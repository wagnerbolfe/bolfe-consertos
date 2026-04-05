import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await prisma.washers.groupBy({
    by: ["brand"],
    _count: { brand: true },
    where: { brand: { not: null } },
    orderBy: { _count: { brand: "desc" } },
    take: 1,
  });

  const brand = result[0]?.brand ?? null;

  return NextResponse.json({ brand });
}
