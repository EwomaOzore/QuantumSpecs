import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = items.filter((n) => !n.readAt).length;
  return NextResponse.json({ items, unread });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string; all?: boolean };
  const now = new Date();

  if (body.all) {
    await prisma.notification.updateMany({
      where: { readAt: null },
      data: { readAt: now },
    });
  } else if (body.id) {
    await prisma.notification.update({
      where: { id: body.id },
      data: { readAt: now },
    });
  } else {
    return NextResponse.json({ error: "id or all required" }, { status: 400 });
  }

  const unread = await prisma.notification.count({ where: { readAt: null } });
  return NextResponse.json({ ok: true, unread });
}
