import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/patients
// Fetches all patients for the default organization
export async function GET() {
    try {
        // TEMPORARY: Fetch the first organization to act as default tenant
        const defaultOrg = await prisma.organization.findFirst();

        if (!defaultOrg) {
            return NextResponse.json(
                { error: "No organization found. Please seed the database." },
                { status: 500 }
            );
        }

        const patients = await prisma.patient.findMany({
            where: {
                organizationId: defaultOrg.id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map Prisma schema to expected frontend Patient type
        const mappedPatients = patients.map((p) => ({
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
            dob: p.dateOfBirth?.toISOString().split("T")[0] || "",
            phone: p.phone || "",
            email: p.email || "",
            address: p.address || "",
            mrn: `PT-${p.id.substring(0, 5).toUpperCase()}`, // Simulated MRN if not in schema
            status: "Active", // Defaulting as status isn't explicitly in schema
            lastVisit: p.updatedAt.toISOString().split("T")[0],
            regDate: p.createdAt.toISOString().split("T")[0],
            gender: "Unknown",      // Fields missing from current Prisma Patient schema
            bloodType: "Unknown",   // Need to be added to DB later or handled gracefully
            allergies: "None",
            primaryCare: "Unassigned",
        }));

        return NextResponse.json(mappedPatients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
        );
    }
}

// POST /api/patients
// Creates a new patient
export async function POST(request: Request) {
    try {
        const defaultOrg = await prisma.organization.findFirst();
        if (!defaultOrg) {
            return NextResponse.json(
                { error: "No organization found." },
                { status: 500 }
            );
        }

        const body = await request.json();

        // Map from frontend Patient type to Prisma schema
        const newPatient = await prisma.patient.create({
            data: {
                organizationId: defaultOrg.id,
                firstName: body.firstName,
                lastName: body.lastName,
                dateOfBirth: body.dob ? new Date(body.dob) : null,
                phone: body.phone,
                email: body.email,
                address: body.address,
            },
        });

        // Map back for response
        const mappedResult = {
            id: newPatient.id,
            firstName: newPatient.firstName,
            lastName: newPatient.lastName,
            dob: newPatient.dateOfBirth?.toISOString().split("T")[0] || "",
            phone: newPatient.phone || "",
            email: newPatient.email || "",
            address: newPatient.address || "",
            mrn: `PT-${newPatient.id.substring(0, 5).toUpperCase()}`,
            status: "Active",
            lastVisit: newPatient.updatedAt.toISOString().split("T")[0],
            regDate: newPatient.createdAt.toISOString().split("T")[0],
            gender: body.gender || "Unknown",
            bloodType: body.bloodType || "Unknown",
            allergies: body.allergies || "None",
            primaryCare: body.primaryCare || "Unassigned",
        };

        return NextResponse.json(mappedResult, { status: 201 });
    } catch (error) {
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }
}
