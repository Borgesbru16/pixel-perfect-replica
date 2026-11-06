import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Papel } from "@/lib/papeis";

export interface UsuarioLista {
  id: string;
  nome: string | null;
  email: string | null;
  ativo: boolean;
  papeis: Papel[];
  criadoEm: string;
}

async function exigirAdmin(sb: { rpc: (fn: "has_role", args: { _user_id: string; _role: Papel }) => PromiseLike<{ data: boolean | null }> }, userId: string) {
  const { data } = await sb.rpc("has_role", { _user_id: userId, _role: "administrador" });
  if (!data) throw new Error("Acesso restrito ao administrador.");
}

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UsuarioLista[]> => {
    await exigirAdmin(context.supabase, context.userId);
    const [perfis, papeis] = await Promise.all([
      context.supabase.from("profiles").select("id, nome, email, ativo, created_at").order("created_at"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (perfis.error) throw new Error("Não foi possível carregar os usuários.");
    return (perfis.data ?? []).map((p) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      ativo: p.ativo,
      criadoEm: p.created_at,
      papeis: (papeis.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as Papel),
    }));
  });

const papelSchema = z.object({
  usuarioId: z.string().uuid(),
  papel: z.enum(["administrador", "gestor_comercial", "analista"]),
});

/** Define o perfil único do usuário. */
export const definirPapel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => papelSchema.parse(input))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context.supabase, context.userId);
    if (data.usuarioId === context.userId && data.papel !== "administrador") {
      throw new Error("Você não pode remover o próprio perfil de administrador.");
    }
    const sb = context.supabase;
    const ins = await sb.from("user_roles").upsert(
      { user_id: data.usuarioId, role: data.papel },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );
    if (ins.error) throw new Error("Não foi possível atualizar o perfil.");
    const del = await sb.from("user_roles").delete().eq("user_id", data.usuarioId).neq("role", data.papel);
    if (del.error) throw new Error("Não foi possível atualizar o perfil.");
    return { ok: true };
  });

const ativoSchema = z.object({ usuarioId: z.string().uuid(), ativo: z.boolean() });

export const definirAtivo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ativoSchema.parse(input))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context.supabase, context.userId);
    if (data.usuarioId === context.userId && !data.ativo) {
      throw new Error("Você não pode desativar o próprio acesso.");
    }
    const { error } = await context.supabase.from("profiles").update({ ativo: data.ativo }).eq("id", data.usuarioId);
    if (error) throw new Error("Não foi possível atualizar o usuário.");
    return { ok: true };
  });
