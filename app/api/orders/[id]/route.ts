import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SITUATION_LABELS } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const order = await prisma.orders.findUnique({
    where: { id: BigInt(id) },
    include: {
      client: { select: { name: true } },
      washer: { select: { description: true, brand: true, model: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id.toString(),
    clientId: order.clientId?.toString() ?? "",
    clientName: order.client?.name ?? "",
    washerId: order.washerId?.toString() ?? "",
    washerLabel: [order.washer?.description, order.washer?.brand, order.washer?.model].filter(Boolean).join(" — ") || "",
    device: order.device ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    series: order.series ?? "",
    problem: order.problem ?? "",
    obs: order.obs ?? "",
    situation: SITUATION_LABELS[Number(order.situation)] ?? "Aberta",
    createdAt: order.createdAt ? order.createdAt.toISOString().split("T")[0] : "",
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const situationKey = Number(
    Object.entries(SITUATION_LABELS).find(([, v]) => v === body.situation)?.[0] ?? 0
  );

  const order = await prisma.orders.update({
    where: { id: BigInt(id) },
    data: {
      clientId: body.clientId ? BigInt(body.clientId) : null,
      washerId: body.washerId ? BigInt(body.washerId) : null,
      device: body.device || null,
      brand: body.brand || null,
      model: body.model || null,
      series: body.series || null,
      problem: body.problem || null,
      obs: body.obs || null,
      situation: BigInt(situationKey),
    },
  });

  return NextResponse.json({ id: order.id.toString() });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.orders.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true });
}
