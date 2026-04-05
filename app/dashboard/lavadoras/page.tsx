"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const PAGE_SIZE = 10;

type Washer = {
  id: string;
  clientName: string;
  description: string;
  brand: string;
  model: string;
  series: string;
  obs: string;
};

type WashersResponse = {
  washers: Washer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function LavadorasPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search);
  const [data, setData] = React.useState<WashersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/lavadoras?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, debouncedSearch]);

  const totalPages = data?.totalPages ?? 1;

  function handlePage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1" />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight shrink-0">
            Lavadoras
          </h1>
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome do cliente..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            className="shrink-0"
            onClick={() => router.push("/dashboard/lavadoras/novo")}
          >
            Cadastrar Lavadora
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[8%]">#</TableHead>
                <TableHead className="w-[18%]">Cliente</TableHead>
                <TableHead className="w-[18%]">Descrição</TableHead>
                <TableHead className="w-[13%]">Marca</TableHead>
                <TableHead className="w-[13%]">Modelo</TableHead>
                <TableHead className="w-[13%]">Série</TableHead>
                <TableHead className="w-[17%]">Obs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.washers.map((washer) => (
                    <TableRow
                      key={washer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/dashboard/lavadoras/${washer.id}`)
                      }
                    >
                      <TableCell className="text-muted-foreground">
                        {washer.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {washer.clientName}
                      </TableCell>
                      <TableCell>{washer.description}</TableCell>
                      <TableCell>{washer.brand}</TableCell>
                      <TableCell>{washer.model}</TableCell>
                      <TableCell>{washer.series}</TableCell>
                      <TableCell className="truncate">{washer.obs}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data
              ? `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, data.total)} de ${data.total} lavadoras`
              : "Carregando..."}
          </p>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePage(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  text="Anterior"
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (Math.abs(p - page) === 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                  text="Próximo"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </SidebarInset>
  );
}
