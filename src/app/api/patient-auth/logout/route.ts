import { NextResponse } from "next/server";
import { revokePatientSessionFromRequest } from "@/lib/patient-auth";
import { logServerError } from "@/lib/safe-logger";

export async function POST(request: Request) {
  try {
    const session = await revokePatientSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("patient_session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
    return response;
  } catch (error) {
    logServerError("Patient logout error", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
