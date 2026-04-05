import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export async function GET() {
  const year = new Date().getFullYear();

  const orders = await prisma.orders.findMany({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
    select: { createdAt: true },
  });

  const counts = Array(12).fill(0);
  for (const o of orders) {
    if (o.createdAt) counts[o.createdAt.getMonth()]++;
  }

  const data = counts.map((total, i) => ({ month: MONTH_LABELS[i], total }));

  return NextResponse.json(data);
}
