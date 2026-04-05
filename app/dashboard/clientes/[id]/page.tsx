"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, BellIcon } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

type ClienteForm = {
  name: string;
  contact: string;
  address: string;
  neighborhood: string;
  phone: string;
  mobile: string;
  createdAt: string;
};

const EMPTY_FORM: ClienteForm = {
  name: "",
  contact: "",
  address: "",
  neighborhood: "",
  phone: "",
  mobile: "",
  createdAt: "",
};

export default function ClientePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [form, setForm] = React.useState<ClienteForm>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/clientes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        setForm({
          name: data.name ?? "",
          contact: data.contact ?? "",
          address: data.address ?? "",
          neighborhood: data.neighborhood ?? "",
          phone: data.phone ?? "",
          mobile: data.mobile ?? "",
          createdAt: data.createdAt ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function set(field: keyof ClienteForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      await fetch(`/api/clientes/${id}`, {
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
      await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      router.push("/dashboard/clientes");
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
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Clientes</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-4 w-4" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
              3
            </Badge>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        <Card className="w-full max-w-2xl shadow-md p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Cliente #{id}
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
                    <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O cliente será permanentemente removido.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="createdAt">Cadastrado em</Label>
                <Input id="createdAt" value={form.createdAt} disabled />
              </div>
            </div>
          )}
        </Card>
      </div>
    </SidebarInset>
  );
}
