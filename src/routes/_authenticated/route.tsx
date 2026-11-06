import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSessao } from "@/hooks/use-sessao";
import { supabase } from "@/integrations/supabase/client";
import { ROTULO_PAPEL } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppLayout,
});

function AppLayout() {
  const { sessao } = useSessao();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const papel = sessao?.papeis[0];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">{sessao?.nome ?? sessao?.email ?? "—"}</p>
              <p className="text-xs leading-tight text-muted-foreground">{sessao?.email}</p>
            </div>
            {papel ? <Badge variant="info">{ROTULO_PAPEL[papel]}</Badge> : <Badge variant="muted">Sem perfil</Badge>}
            <Button variant="ghost" size="icon" onClick={sair} aria-label="Sair">
              <LogOut />
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-8">
          {sessao && !sessao.ativo ? (
            <div className="panel p-6 text-sm text-muted-foreground">
              Seu acesso está desativado. Procure o administrador do sistema.
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
