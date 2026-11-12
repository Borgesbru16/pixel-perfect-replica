import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Simulador de Preços" },
      { name: "description", content: "Acesso individual ao Simulador de Preços corporativo." },
      { property: "og:title", content: "Entrar — Simulador de Preços" },
      { property: "og:description", content: "Acesso individual ao Simulador de Preços corporativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard", replace: true });
  },
  component: AuthPage,
});

function mensagemErro(error: { message: string; status?: number | undefined }, padrao: string): string {
  const m = error.message ?? "";
  if (/fetch|network|Load failed/i.test(m) || error.status === 0 || (error.status ?? 0) >= 500) {
    return "Sem conexão com o servidor. Aguarde alguns instantes e tente de novo.";
  }
  if (/not confirmed/i.test(m)) {
    return "Confirme seu cadastro pelo link enviado ao seu e-mail antes de entrar.";
  }
  if (/password/i.test(m) && /(least|short|weak)/i.test(m)) {
    return "A senha precisa ser mais forte (mínimo de 6 caracteres).";
  }
  return padrao;
}

function AuthPage() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("senha")),
    });
    setCarregando(false);
    if (error) {
      toast.error(mensagemErro(error, "E-mail ou senha inválidos."));
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("senha")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: String(f.get("nome")) },
      },
    });
    setCarregando(false);
    if (error) {
      toast.error(
        /already/i.test(error.message)
          ? "Este e-mail já está cadastrado. Use a aba Entrar."
          : mensagemErro(error, "Não foi possível criar a conta."),
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      toast.success("Conta criada. Confirme o cadastro pelo link enviado ao seu e-mail.");
    }
  }

  async function social(provider: "google" | "lovable") {
    setCarregando(true);
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) {
      setCarregando(false);
      toast.error("Não foi possível entrar com esta conta.");
      return;
    }
    if (!r.redirected) navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
      <section className="auth-panel hidden flex-col justify-between p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary font-mono text-sm font-semibold text-sidebar-primary-foreground">
            SP
          </div>
          <span className="text-sm font-semibold text-sidebar-accent-foreground">Simulador de Preços</span>
        </div>
        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-widest text-sidebar-foreground/60">Formação e análise</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-sidebar-accent-foreground">
            Preços pai e filho calculados com regras rastreáveis.
          </h1>
          <p className="mt-4 text-sm text-sidebar-foreground/80">
            Margens objetivas, réguas de cor e dimensão, exceções e memória de cálculo em cada item.
          </p>
        </div>
        <p className="font-mono text-[10px] text-sidebar-foreground/50">Motor de cálculo v1.0.0</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Acesso individual</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Entrar no simulador</h2>

          <Tabs defaultValue="entrar" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="cadastrar">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="entrar">
              <form onSubmit={entrar} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email-entrar">E-mail</Label>
                  <Input id="email-entrar" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senha-entrar">Senha</Label>
                  <Input id="senha-entrar" name="senha" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={carregando}>
                  Entrar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="cadastrar">
              <form onSubmit={cadastrar} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" required autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email-cadastrar">E-mail</Label>
                  <Input id="email-cadastrar" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senha-cadastrar">Senha</Label>
                  <Input id="senha-cadastrar" name="senha" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full" disabled={carregando}>
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => social("google")} disabled={carregando}>
              Continuar com Google
            </Button>
            <Button variant="outline" onClick={() => social("lovable")} disabled={carregando}>
              Continuar com Lovable
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
