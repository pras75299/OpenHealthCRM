import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const defaultOrg = await prisma.organization.findFirst();
        if (!defaultOrg) {
            return NextResponse.json({ error: "No organization found." }, { status: 500 });
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                organizationId: defaultOrg.id,
            },
            include: {
                provider: true,
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        const mappedAppointments = appointments.map((a) => {
            // Basic time formatting
            const timeString = a.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Estimate duration based on start/end
            const durationMs = a.endTime.getTime() - a.startTime.getTime();
            const durationMins = Math.round(durationMs / 60000);

            return {
                id: a.id,
                patientId: a.patientId,
                provider: a.provider?.name || "Unknown Provider",
                date: a.startTime.toISOString().split("T")[0],
                time: timeString,
                duration: `${durationMins} min`,
                type: a.notes || "Standard", // Mapping notes to type temporarilly until schema changes
                status: a.status as any, // "Confirmed" | "In Waiting Room" | "Scheduled" | "Pending"
            };
        });

        return NextResponse.json(mappedAppointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const defaultOrg = await prisma.organization.findFirst();
        if (!defaultOrg) {
            return NextResponse.json({ error: "No organization found." }, { status: 500 });
        }

        const body = await request.json();

        // We need a provider. For now, grab the first user as provider, or fallback
        let provider = await prisma.user.findFirst();
        if (!provider) {
            provider = await prisma.user.create({
                data: {
                    organizationId: defaultOrg.id,
                    email: `doctor_${Date.now()}@example.com`,
                    name: body.provider || "Dr. Default"
                }
            });
        }

        // Calculate start/end times based on frontend strings
        const startDateTime = new Date(`${body.date}T${body.time}`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Default 30 min duration

        const newAppointment = await prisma.appointment.create({
            data: {
                organizationId: defaultOrg.id,
                patientId: body.patientId,
                providerId: provider.id,
                startTime: startDateTime,
                endTime: endDateTime,
                status: body.status || "Scheduled",
                notes: body.type, // Map type to notes for now
            },
            include: {
                provider: true
            }
        });

        const mappedResult = {
            id: newAppointment.id,
            patientId: newAppointment.patientId,
            provider: newAppointment.provider?.name || "Unknown Provider",
            date: newAppointment.startTime.toISOString().split("T")[0],
            time: newAppointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: "30 min",
            type: newAppointment.notes || "Standard",
            status: newAppointment.status,
        };

        return NextResponse.json(mappedResult, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });
        }

        const updateData: any = {};
        if (updates.status) updateData.status = updates.status;

        // Handle date/time updates if provided
        if (updates.date || updates.time) {
            // Need to fetch current to get the missing piece if only one is updated
            const current = await prisma.appointment.findUnique({ where: { id } });
            if (current) {
                const dateStr = updates.date || current.startTime.toISOString().split("T")[0];
                const timeStr = updates.time || current.startTime.toTimeString().substring(0, 5);
                updateData.startTime = new Date(`${dateStr}T${timeStr}`);
                updateData.endTime = new Date(updateData.startTime.getTime() + 30 * 60000);
            }
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: { provider: true }
        });

        const mappedResult = {
            id: updated.id,
            patientId: updated.patientId,
            provider: updated.provider?.name,
            date: updated.startTime.toISOString().split("T")[0],
            time: updated.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: "30 min",
            type: updated.notes || "Standard",
            status: updated.status,
        };

        return NextResponse.json(mappedResult);

    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
}
