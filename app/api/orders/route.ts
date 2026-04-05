import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const SITUATION_LABELS: Record<number, string> = {
  0: "Aberta",
  1: "Em andamento",
  2: "Concluída",
  3: "Cancelada",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 10));

  const search = searchParams.get("search")?.trim() ?? "";
  const clientId = searchParams.get("clientId");

  const where = {
    ...(clientId ? { clientId: BigInt(clientId) } : {}),
    ...(search ? { client: { name: { contains: search, mode: "insensitive" as const } } } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true, phone: true, mobile: true } } },
    }),
    prisma.orders.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id.toString(),
      clientName: o.client?.name ?? "",
      device: o.device ?? "",
      brand: o.brand ?? "",
      model: o.model ?? "",
      problem: o.problem ?? "",
      phone: o.client?.phone || o.client?.mobile || "",
      createdAt: o.createdAt ? o.createdAt.toLocaleDateString("pt-BR") : "",
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const lastOrder = await prisma.orders.findFirst({ orderBy: { id: "desc" } });
  const nextId = lastOrder ? lastOrder.id + BigInt(1) : BigInt(1);

  const situationKey = Number(
    Object.entries(SITUATION_LABELS).find(([, v]) => v === body.situation)?.[0] ?? 0
  );

  const order = await prisma.orders.create({
    data: {
      id: nextId,
      clientId: body.clientId ? BigInt(body.clientId) : null,
      washerId: body.washerId ? BigInt(body.washerId) : null,
      device: body.device || null,
      brand: body.brand || null,
      model: body.model || null,
      series: body.series || null,
      problem: body.problem || null,
      obs: body.obs || null,
      situation: BigInt(situationKey),
      createdAt: new Date(),
    },
  });

  return NextResponse.json({ id: order.id.toString() }, { status: 201 });
}
