import { NextResponse } from "next/server";
import { revokePatientSessionFromRequest } from "@/lib/patient-auth";

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
    console.error("Patient logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
