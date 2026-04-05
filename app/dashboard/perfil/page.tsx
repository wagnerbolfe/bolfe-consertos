"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export default function PerfilPage() {
  const { data: session, isPending, refetch } = authClient.useSession();

  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSuccess(false);
    try {
      await authClient.updateUser({ name: name.trim() });
      await refetch();
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium">Meu Perfil</span>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        <Card className="w-full max-w-lg shadow-md p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {isPending ? (
              <>
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-16 w-16 text-lg">
                  <AvatarImage src={session?.user?.image ?? ""} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-base font-semibold">{name}</span>
                  <span className="text-sm text-muted-foreground">
                    {session?.user?.email}
                  </span>
                </div>
              </>
            )}
          </div>

          <Separator />

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              {isPending ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSuccess(false);
                  }}
                  placeholder="Seu nome"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving || isPending}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              {success && (
                <span className="text-sm text-green-600">Nome atualizado!</span>
              )}
            </div>
          </form>
        </Card>
      </div>
    </SidebarInset>
  );
}
