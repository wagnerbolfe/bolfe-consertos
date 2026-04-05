"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type WasherForm = {
  clientName: string;
  description: string;
  brand: string;
  model: string;
  series: string;
  obs: string;
  createdAt: string;
};

const EMPTY_FORM: WasherForm = {
  clientName: "",
  description: "",
  brand: "",
  model: "",
  series: "",
  obs: "",
  createdAt: "",
};

export default function LavadoraPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [form, setForm] = React.useState<WasherForm>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/lavadoras/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        setForm({
          clientName: data.clientName ?? "",
          description: data.description ?? "",
          brand: data.brand ?? "",
          model: data.model ?? "",
          series: data.series ?? "",
          obs: data.obs ?? "",
          createdAt: data.createdAt ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function set(field: keyof WasherForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      await fetch(`/api/lavadoras/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await fetch(`/api/lavadoras/${id}`, { method: "DELETE" });
      router.push("/dashboard/lavadoras");
    } finally {
      setDeleting(false);
    }
  }

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
            <h1 className="text-2xl font-bold tracking-tight">
              Lavadora #{id}
            </h1>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting || loading}>
                    {deleting ? "Excluindo..." : "Excluir"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir lavadora?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A lavadora será
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
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="clientName">Cliente</Label>
                <Input id="clientName" value={form.clientName} disabled />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="createdAt">Cadastrado em</Label>
                <Input id="createdAt" value={form.createdAt} disabled />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Descrição"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="Marca"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Modelo"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="series">Série</Label>
                <Input
                  id="series"
                  value={form.series}
                  onChange={(e) => set("series", e.target.value)}
                  placeholder="Número de série"
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
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </SidebarInset>
  );
}
