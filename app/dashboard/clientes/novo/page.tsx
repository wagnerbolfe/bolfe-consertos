"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

type ClienteForm = {
  name: string;
  contact: string;
  address: string;
  neighborhood: string;
  phone: string;
  mobile: string;
};

const EMPTY_FORM: ClienteForm = {
  name: "",
  contact: "",
  address: "",
  neighborhood: "",
  phone: "",
  mobile: "",
};

export default function NovoClientePage() {
  const router = useRouter();

  const [form, setForm] = React.useState<ClienteForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  function set(field: keyof ClienteForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard/clientes");
      }
    } finally {
      setSaving(false);
    }
  }

  const canSave = form.name.trim().length > 0;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Clientes</span>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        <Card className="w-full max-w-2xl shadow-md p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Novo Cliente</h1>
            <Button onClick={handleSave} disabled={saving || !canSave}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="Nome do contato"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Endereço"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={form.neighborhood}
                onChange={(e) => set("neighborhood", e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Telefone"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="mobile">Celular</Label>
              <Input
                id="mobile"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                placeholder="Celular"
              />
            </div>
          </div>
        </Card>
      </div>
    </SidebarInset>
  );
}
