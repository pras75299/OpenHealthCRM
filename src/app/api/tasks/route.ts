import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get("assigneeId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        organizationId: orgId,
        ...(assigneeId ? { assigneeId } : {}),
        ...(patientId ? { patientId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const body = await request.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      patientId,
      assigneeId,
      taskType,
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.$transaction(async (tx: any) => {
      const t = await tx.task.create({
        data: {
          organizationId: orgId,
          title: String(title),
          description: description || null,
          status: status || "open",
          priority: priority || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          patientId: patientId || null,
          assigneeId: assigneeId || null,
          creatorId: userId,
          taskType: taskType || null,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: "CREATE",
          entityType: "Task",
          entityId: t.id,
          afterState: JSON.stringify(t),
        },
      });

      return t;
    });

    const withRelations = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });

    return NextResponse.json(withRelations ?? task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
