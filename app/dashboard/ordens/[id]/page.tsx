"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const SITUATIONS = ["Aberta", "Em andamento", "Concluída", "Cancelada"];

type Client = { id: string; name: string; phone: string; mobile: string };
type Washer = {
  id: string;
  label: string;
  brand: string;
  model: string;
  series: string;
};

type OrderForm = {
  clientId: string;
  clientName: string;
  washerId: string;
  washerLabel: string;
  device: string;
  brand: string;
  model: string;
  series: string;
  problem: string;
  obs: string;
  situation: string;
};

const EMPTY_FORM: OrderForm = {
  clientId: "",
  clientName: "",
  washerId: "",
  washerLabel: "",
  device: "",
  brand: "",
  model: "",
  series: "",
  problem: "",
  obs: "",
  situation: "Aberta",
};

export default function OrdemPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const isNew = id === "novo";

  const [form, setForm] = React.useState<OrderForm>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Client picker modal
  const [clientModalOpen, setClientModalOpen] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientSearch, setClientSearch] = React.useState("");
  const [clientsLoading, setClientsLoading] = React.useState(false);

  // Washers for selected client
  const [washers, setWashers] = React.useState<Washer[]>([]);

  React.useEffect(() => {
    if (!isNew || !form.clientId) {
      setWashers([]);
      return;
    }
    fetch(`/api/lavadoras?clientId=${form.clientId}`)
      .then((r) => r.json())
      .then((data) =>
        setWashers(
          (data.washers ?? []).map(
            (w: {
              id: string;
              description: string;
              brand: string;
              model: string;
              series: string;
            }) => ({
              id: w.id,
              label:
                w.description ||
                [w.brand, w.model].filter(Boolean).join(" - ") ||
                `#${w.id}`,
              brand: w.brand,
              model: w.model,
              series: w.series,
            }),
          ),
        ),
      )
      .catch(() => {});
  }, [form.clientId, isNew]);

  React.useEffect(() => {
    if (isNew || !id) return;
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        setForm({
          clientId: data.clientId ?? "",
          clientName: data.clientName ?? "",
          washerId: data.washerId ?? "",
          washerLabel: data.washerLabel ?? "",
          device: data.device ?? "",
          brand: data.brand ?? "",
          model: data.model ?? "",
          series: data.series ?? "",
          problem: data.problem ?? "",
          obs: data.obs ?? "",
          situation: data.situation ?? "Aberta",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, isNew]);

  function openClientModal() {
    setClientModalOpen(true);
    setClientSearch("");
    setClientsLoading(true);
    fetch("/api/clientes?pageSize=1000")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clientes);
        setClientsLoading(false);
      })
      .catch(() => setClientsLoading(false));
  }

  function selectClient(client: Client) {
    setForm((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      washerId: "",
      washerLabel: "",
    }));
    setClientModalOpen(false);
  }

  function set(field: keyof OrderForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!isNew && !id) return;
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/orders" : `/api/orders/${id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          router.replace(`/dashboard/ordens/${data.id}`);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      router.push("/dashboard/ordens");
    } finally {
      setDeleting(false);
    }
  }

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()),
  );

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/ordens")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Ordens</span>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        <Card className="w-full max-w-2xl shadow-md p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "Nova Ordem" : `Ordem #${id}`}
            </h1>
            <div className="flex gap-2">
              {!isNew && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      {deleting ? "Excluindo..." : "Excluir"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir ordem?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A ordem será
                        permanentemente removida.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Input
                  id="clientId"
                  value={form.clientName}
                  readOnly
                  disabled={!isNew}
                  placeholder="Selecione o cliente"
                  className={isNew ? "cursor-pointer" : ""}
                  onClick={isNew ? openClientModal : undefined}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="washerId">Lavadora</Label>
                {isNew ? (
                  <Select
                    value={form.washerId}
                    onValueChange={(v) => {
                      const w = washers.find((x) => x.id === v);
                      setForm((prev) => ({
                        ...prev,
                        washerId: v,
                        washerLabel: w?.label ?? "",
                        brand: w?.brand ?? "",
                        model: w?.model ?? "",
                        series: w?.series ?? "",
                      }));
                    }}
                    disabled={!form.clientId}
                  >
                    <SelectTrigger id="washerId" className="w-full">
                      <SelectValue
                        placeholder={
                          form.clientId
                            ? "Selecione a lavadora"
                            : "Selecione um cliente primeiro"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {washers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="washerId"
                    value={form.washerLabel}
                    disabled
                    placeholder="Lavadora"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  placeholder="Marca"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={form.model}
                  placeholder="Modelo"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="series">Série</Label>
                <Input
                  id="series"
                  value={form.series}
                  placeholder="Número de série"
                  disabled
                />
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="situation">Situação</Label>
                <Select
                  value={form.situation}
                  onValueChange={(v) => set("situation", v)}
                  disabled={!isNew}
                >
                  <SelectTrigger id="situation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="problem">Problema</Label>
                <Textarea
                  id="problem"
                  value={form.problem}
                  onChange={(e) => set("problem", e.target.value)}
                  placeholder="Descrição do problema"
                  className="min-h-64"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  value={form.obs}
                  onChange={(e) => set("obs", e.target.value)}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto flex flex-col gap-1">
            {clientsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : filteredClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cliente encontrado.
              </p>
            ) : (
              filteredClients.map((c) => (
                <button
                  key={c.id}
                  className="flex flex-col items-start rounded-md px-3 py-2 text-sm hover:bg-accent text-left"
                  onClick={() => selectClient(c)}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {c.phone || c.mobile || ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
