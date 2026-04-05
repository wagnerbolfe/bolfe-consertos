import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const clientId = searchParams.get("clientId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10));

  const search = searchParams.get("search")?.trim() ?? "";

  const where = {
    ...(clientId ? { clientId: BigInt(clientId) } : {}),
    ...(search ? { client: { name: { contains: search, mode: "insensitive" as const } } } : {}),
  };

  const [washers, total] = await Promise.all([
    prisma.washers.findMany({
      where,
      include: { client: { select: { name: true } } },
      orderBy: { id: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.washers.count({ where }),
  ]);

  return NextResponse.json({
    washers: washers.map((w) => ({
      id: w.id.toString(),
      clientName: w.client?.name ?? "",
      description: w.description ?? "",
      brand: w.brand ?? "",
      model: w.model ?? "",
      series: w.series ?? "",
      obs: w.obs ?? "",
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const last = await prisma.washers.findFirst({ orderBy: { id: "desc" } });
  const nextId = last ? last.id + BigInt(1) : BigInt(1);

  const washer = await prisma.washers.create({
    data: {
      id: nextId,
      clientId: body.clientId ? BigInt(body.clientId) : null,
      description: body.description || null,
      brand: body.brand || null,
      model: body.model || null,
      series: body.series || null,
      obs: body.obs || null,
      createdAt: new Date(),
    },
  });

  return NextResponse.json({ id: washer.id.toString() }, { status: 201 });
}
