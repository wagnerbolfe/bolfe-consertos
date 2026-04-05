import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const washer = await prisma.washers.findUnique({
    where: { id: BigInt(id) },
    include: { client: { select: { name: true } } },
  });

  if (!washer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: washer.id.toString(),
    clientId: washer.clientId?.toString() ?? "",
    clientName: washer.client?.name ?? "",
    description: washer.description ?? "",
    brand: washer.brand ?? "",
    model: washer.model ?? "",
    series: washer.series ?? "",
    obs: washer.obs ?? "",
    createdAt: washer.createdAt ? washer.createdAt.toLocaleDateString("pt-BR") : "",
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const washer = await prisma.washers.update({
    where: { id: BigInt(id) },
    data: {
      description: body.description || null,
      brand: body.brand || null,
      model: body.model || null,
      series: body.series || null,
      obs: body.obs || null,
    },
  });

  return NextResponse.json({ id: washer.id.toString() });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.washers.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true });
}
