import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const cliente = await prisma.clients.findUnique({
    where: { id: BigInt(id) },
  });

  if (!cliente) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: cliente.id.toString(),
    name: cliente.name ?? "",
    contact: cliente.contact ?? "",
    address: cliente.address ?? "",
    neighborhood: cliente.neighborhood ?? "",
    phone: cliente.phone ?? "",
    mobile: cliente.mobile ?? "",
    situation: cliente.situation === 0 ? "Ativo" : "Inativo",
    createdAt: cliente.createdAt ? cliente.createdAt.toLocaleDateString("pt-BR") : "",
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const cliente = await prisma.clients.update({
    where: { id: BigInt(id) },
    data: {
      name: body.name || null,
      contact: body.contact || null,
      address: body.address || null,
      neighborhood: body.neighborhood || null,
      phone: body.phone || null,
      mobile: body.mobile || null,
      situation: body.situation === "Inativo" ? 1 : 0,
    },
  });

  return NextResponse.json({ id: cliente.id.toString() });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.clients.delete({ where: { id: BigInt(id) } });
  return NextResponse.json({ success: true });
}
