import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  FileUp,
  GitFork,
  History,
  LayoutDashboard,
  Package,
  Ruler,
  Settings,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const GRUPOS = [
  {
    rotulo: "Análise",
    itens: [
      { to: "/dashboard", titulo: "Dashboard", icone: LayoutDashboard },
      { to: "/simulacao", titulo: "Simulação de preços", icone: Calculator },
      { to: "/historico", titulo: "Histórico de simulações", icone: History },
    ],
  },
  {
    rotulo: "Cadastros",
    itens: [
      { to: "/produtos", titulo: "Base de produtos", icone: Package },
      { to: "/hierarquia", titulo: "Hierarquia de produtos", icone: GitFork },
      { to: "/importacao", titulo: "Importação de bases", icone: FileUp },
    ],
  },
  {
    rotulo: "Regras comerciais",
    itens: [
      { to: "/reguas", titulo: "Réguas comerciais", icone: Ruler },
      { to: "/margens", titulo: "Margens objetivas", icone: Target },
    ],
  },
  {
    rotulo: "Administração",
    itens: [{ to: "/configuracoes", titulo: "Usuários e configurações", icone: Settings }],
  },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-mono text-sm font-semibold text-sidebar-primary-foreground">
            SP
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">Simulador de Preços</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Formação e análise
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {GRUPOS.map((g) => (
          <SidebarGroup key={g.rotulo}>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              {g.rotulo}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.itens.map((item) => {
                  const ativo = pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={ativo} tooltip={item.titulo}>
                        <Link to={item.to}>
                          <item.icone />
                          <span>{item.titulo}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1 font-mono text-[10px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          Motor de cálculo v1.0.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
