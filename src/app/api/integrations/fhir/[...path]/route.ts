import { NextResponse } from "next/server";
import { requireOrgContext, isAuthContextError } from "@/lib/org";
import { hasPermission } from "@/lib/auth";
import { logServerError } from "@/lib/safe-logger";

export const runtime = "nodejs";

function getFhirBaseUrl() {
  return process.env.FHIR_BASE_URL?.replace(/\/+$/, "") ?? "";
}

function buildFhirUrl(pathSegments: string[], requestUrl: string) {
  const upstream = new URL(`${getFhirBaseUrl()}/${pathSegments.join("/")}`);
  const incomingUrl = new URL(requestUrl);

  incomingUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  return upstream.toString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { userId, organizationId } = await requireOrgContext();
    const canReadPatients = await hasPermission(
      userId,
      organizationId,
      "patients:read",
      "patients",
    );

    if (!canReadPatients) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const baseUrl = getFhirBaseUrl();
    if (!baseUrl) {
      return NextResponse.json(
        { error: "FHIR integration is not configured" },
        { status: 501 },
      );
    }

    const { path } = await params;
    if (!path?.length) {
      return NextResponse.json({ error: "FHIR path is required" }, { status: 400 });
    }

    const response = await fetch(buildFhirUrl(path, request.url), {
      headers: {
        Accept: "application/fhir+json, application/json",
        ...(process.env.FHIR_AUTH_TOKEN
          ? { Authorization: `Bearer ${process.env.FHIR_AUTH_TOKEN}` }
          : {}),
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "application/json";
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    logServerError("FHIR proxy request failed", error);
    return NextResponse.json(
      { error: "Failed to reach FHIR upstream" },
      { status: 502 },
    );
  }
}
