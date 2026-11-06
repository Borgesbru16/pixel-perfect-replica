import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface Indicadores {
  totalProdutos: number;
  totalPais: number;
  totalFilhos: number;
  totalSimulacoes: number;
  ultimaAtualizacaoCustos: string | null;
  ultimaAtualizacaoMercado: string | null;
  ultimaAtualizacaoReguas: string | null;
  itensAbaixoMeta: number;
  itensAcimaMercado: number;
  itensAbaixoMercado: number;
  parametrosPendentes: { chave: string; descricao: string }[];
}

/** Indicadores do dashboard. Consultas executadas como o usuário: respeitam as permissões do banco. */
export const obterIndicadores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Indicadores> => {
    const sb = context.supabase;
    const contar = async (q: PromiseLike<{ count: number | null; error: unknown }>) => {
      const r = await q;
      if (r.error) console.error("[dashboard]", r.error);
      return r.count ?? 0;
    };
    const ultima = async (tabela: "produtos" | "reguas", coluna: string) => {
      const { data, error } = await sb
        .from(tabela)
        .select(coluna)
        .not(coluna, "is", null)
        .order(coluna, { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) console.error("[dashboard]", error);
      return (data as Record<string, string> | null)?.[coluna] ?? null;
    };

    const [
      totalProdutos,
      totalPais,
      totalFilhos,
      totalSimulacoes,
      itensAbaixoMeta,
      itensAcimaMercado,
      itensAbaixoMercado,
      custos,
      mercado,
      reguas,
      pendentes,
    ] = await Promise.all([
      contar(sb.from("produtos").select("id", { count: "exact", head: true })),
      contar(sb.from("produtos").select("id", { count: "exact", head: true }).eq("tipo_codigo", "pai")),
      contar(sb.from("produtos").select("id", { count: "exact", head: true }).eq("tipo_codigo", "filho")),
      contar(sb.from("simulacoes").select("id", { count: "exact", head: true })),
      contar(sb.from("itens_simulacao").select("id", { count: "exact", head: true }).eq("status", "abaixo_meta")),
      contar(sb.from("itens_simulacao").select("id", { count: "exact", head: true }).gt("diferenca_mercado_pct", 0)),
      contar(sb.from("itens_simulacao").select("id", { count: "exact", head: true }).lt("diferenca_mercado_pct", 0)),
      ultima("produtos", "custo_atualizado_em"),
      ultima("produtos", "mercado_atualizado_em"),
      ultima("reguas", "updated_at"),
      sb.from("configuracoes").select("chave, descricao").eq("status", "pendente_validacao").order("chave"),
    ]);

    return {
      totalProdutos,
      totalPais,
      totalFilhos,
      totalSimulacoes,
      ultimaAtualizacaoCustos: custos,
      ultimaAtualizacaoMercado: mercado,
      ultimaAtualizacaoReguas: reguas,
      itensAbaixoMeta,
      itensAcimaMercado,
      itensAbaixoMercado,
      parametrosPendentes: pendentes.data ?? [],
    };
  });
