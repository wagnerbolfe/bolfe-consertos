"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Droplets,
  FileTextIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  total: {
    label: "Ordens",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

type Order = {
  id: string;
  clientName: string;
  brand: string;
  model: string;
  problem: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [ordersData, setOrdersData] = React.useState<
    { month: string; total: number }[]
  >([]);
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);
  const [totalClientes, setTotalClientes] = React.useState<number | null>(null);
  const [totalLavadoras, setTotalLavadoras] = React.useState<number | null>(
    null,
  );
  const [totalOrdens, setTotalOrdens] = React.useState<number | null>(null);
  const [topBrand, setTopBrand] = React.useState<string | null>(null);
  const [chartRange, setChartRange] = React.useState("12");

  React.useEffect(() => {
    fetch("/api/orders/stats")
      .then((res) => res.json())
      .then(setOrdersData)
      .catch(() => {});
    fetch("/api/clientes?pageSize=1")
      .then((res) => res.json())
      .then((json) => setTotalClientes(json.total ?? 0))
      .catch(() => {});
    fetch("/api/lavadoras?pageSize=1")
      .then((res) => res.json())
      .then((json) => setTotalLavadoras(json.total ?? 0))
      .catch(() => {});
    fetch("/api/lavadoras/top-brand")
      .then((res) => res.json())
      .then((json) => setTopBrand(json.brand ?? "—"))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    fetch("/api/orders?page=1&pageSize=5")
      .then((res) => res.json())
      .then((json) => {
        setRecentOrders(json.orders ?? []);
        setTotalOrdens(json.total ?? 0);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1" />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Início</h1>
          <Button>Download</Button>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quantidade de Clientes
                </CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalClientes === null ? "—" : totalClientes}
                </div>
                <p className="text-xs text-muted-foreground">
                  clientes cadastrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quantidade de Ordens
                </CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalOrdens === null ? "—" : totalOrdens}
                </div>
                <p className="text-xs text-muted-foreground">
                  ordens cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Máquinas cadastradas
                </CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalLavadoras === null ? "—" : totalLavadoras}
                </div>
                <p className="text-xs text-muted-foreground">
                  lavadoras cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Marca mais cadastrada
                </CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topBrand ?? "—"}</div>
                <p className="text-xs text-muted-foreground">
                  marca com mais máquinas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Ordens por Mês</CardTitle>
                  <CardDescription>
                    Últimos {chartRange} meses do ano
                  </CardDescription>
                </div>
                <Select value={chartRange} onValueChange={setChartRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-87.5 w-full">
                  <LineChart
                    data={ordersData.slice(-Number(chartRange))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(v) => String(v)}
                    />
                    <ChartTooltip
                      cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Line
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Ordens</CardTitle>
                <CardDescription>As 5 ordens mais recentes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Marca / Modelo</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOrders
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 4 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : recentOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/ordens/${order.id}`)
                            }
                          >
                            <TableCell className="text-muted-foreground">
                              {order.id}
                            </TableCell>
                            <TableCell>{order.clientName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {[order.brand, order.model]
                                .filter(Boolean)
                                .join(" / ")}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {order.createdAt}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
