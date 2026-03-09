import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("GET /api/communications/campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const body = await request.json();
    const { name, type, triggerType } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Campaign name and type are required" },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: orgId,
        name,
        type,
        triggerType: triggerType || null,
        status: "draft",
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("POST /api/communications/campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}
