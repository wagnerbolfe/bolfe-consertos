"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Client = { id: string; name: string; phone: string; mobile: string };

type WasherForm = {
  clientId: string;
  clientName: string;
  description: string;
  brand: string;
  model: string;
  series: string;
  obs: string;
};

const EMPTY_FORM: WasherForm = {
  clientId: "",
  clientName: "",
  description: "",
  brand: "",
  model: "",
  series: "",
  obs: "",
};

export default function NovaLavadoraPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<WasherForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  const [clientModalOpen, setClientModalOpen] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientSearch, setClientSearch] = React.useState("");
  const [clientsLoading, setClientsLoading] = React.useState(false);

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
    }));
    setClientModalOpen(false);
  }

  function set(field: keyof WasherForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/lavadoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard/lavadoras");
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()),
  );

  const fieldsDisabled = !form.clientId;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/lavadoras")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Lavadoras</span>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        <Card className="w-full max-w-2xl shadow-md p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Nova Lavadora</h1>
            <Button onClick={handleSave} disabled={saving || !form.clientId}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Input
                id="clientId"
                value={form.clientName}
                readOnly
                placeholder="Selecione o cliente"
                className="cursor-pointer"
                onClick={openClientModal}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Descrição"
                disabled={fieldsDisabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Marca"
                disabled={fieldsDisabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="Modelo"
                disabled={fieldsDisabled}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="series">Série</Label>
              <Input
                id="series"
                value={form.series}
                onChange={(e) => set("series", e.target.value)}
                placeholder="Número de série"
                disabled={fieldsDisabled}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                value={form.obs}
                onChange={(e) => set("obs", e.target.value)}
                placeholder="Observações adicionais"
                rows={4}
                disabled={fieldsDisabled}
              />
            </div>
          </div>
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
