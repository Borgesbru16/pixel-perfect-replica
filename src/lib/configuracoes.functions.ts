import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export interface Parametro {
  chave: string;
  valor: Json;
  opcoes: Json[];
  descricao: string;
  status: "pendente_validacao" | "validado";
  atualizadoEm: string;
}

export const listarParametros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Parametro[]> => {
    const { data, error } = await context.supabase.from("configuracoes").select("*").order("chave");
    if (error) throw new Error("Não foi possível carregar os parâmetros.");
    return (data ?? []).map((c) => ({
      chave: c.chave,
      valor: c.valor,
      opcoes: Array.isArray(c.opcoes) ? (c.opcoes as Json[]) : [],
      descricao: c.descricao,
      status: c.status as Parametro["status"],
      atualizadoEm: c.updated_at,
    }));
  });

const schema = z.object({
  chave: z.string().min(1),
  valor: z.union([z.string(), z.boolean()]),
  status: z.enum(["pendente_validacao", "validado"]),
});

export const atualizarParametro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "administrador" });
    if (!isAdmin) throw new Error("Acesso restrito ao administrador.");

    const atual = await sb.from("configuracoes").select("opcoes").eq("chave", data.chave).maybeSingle();
    const opcoes = Array.isArray(atual.data?.opcoes) ? (atual.data!.opcoes as Json[]) : [];
    if (opcoes.length === 0 || !opcoes.some((o) => o === data.valor)) {
      throw new Error("Valor não permitido para este parâmetro.");
    }
    const { error } = await sb
      .from("configuracoes")
      .update({ valor: data.valor, status: data.status, updated_by: context.userId })
      .eq("chave", data.chave);
    if (error) throw new Error("Não foi possível salvar o parâmetro.");
    return { ok: true };
  });
