import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const last = await prisma.clients.findFirst({ orderBy: { id: "desc" } });
  const nextId = last ? last.id + BigInt(1) : BigInt(1);

  const cliente = await prisma.clients.create({
    data: {
      id: nextId,
      name: body.name || null,
      contact: body.contact || null,
      address: body.address || null,
      neighborhood: body.neighborhood || null,
      phone: body.phone || null,
      mobile: body.mobile || null,
      situation: 0,
      createdAt: new Date(),
    },
  });

  return NextResponse.json({ id: cliente.id.toString() }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 10));
  const search = searchParams.get("search")?.trim() ?? "";

  const situationParam = searchParams.get("situation");
  const situationFilter =
    situationParam === "ativo"
      ? { situation: 0 }
      : situationParam === "inativo"
        ? { situation: 1 }
        : {};

  const where = search
    ? { ...situationFilter, name: { contains: search, mode: "insensitive" as const } }
    : Object.keys(situationFilter).length > 0
      ? situationFilter
      : undefined;

  const [clientes, total] = await Promise.all([
    prisma.clients.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: "asc" },
    }),
    prisma.clients.count({ where }),
  ]);

  return NextResponse.json({
    clientes: clientes.map((c) => ({
      id: c.id.toString(),
      name: c.name ?? "—",
      contact: c.contact ?? "—",
      address: c.address ?? "—",
      neighborhood: c.neighborhood ?? "—",
      phone: c.phone ?? "—",
      mobile: c.mobile ?? "—",
      situation: c.situation === 0 ? "Ativo" : "Inativo",
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
