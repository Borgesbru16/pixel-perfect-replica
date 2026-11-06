import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Papel } from "@/lib/papeis";

export interface Sessao {
  userId: string;
  email: string | null;
  nome: string | null;
  papeis: Papel[];
  ativo: boolean;
}

export const sessaoQuery = queryOptions({
  queryKey: ["sessao"],
  queryFn: async (): Promise<Sessao | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const [papeis, perfil] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("profiles").select("nome, email, ativo").eq("id", user.id).maybeSingle(),
    ]);
    return {
      userId: user.id,
      email: perfil.data?.email ?? user.email ?? null,
      nome: perfil.data?.nome ?? null,
      ativo: perfil.data?.ativo ?? true,
      papeis: (papeis.data ?? []).map((r) => r.role as Papel),
    };
  },
  staleTime: 60_000,
});

export function useSessao() {
  const q = useQuery(sessaoQuery);
  const papeis = q.data?.papeis ?? [];
  return {
    ...q,
    sessao: q.data ?? null,
    eAdmin: papeis.includes("administrador"),
    podeGerenciarRegras: papeis.includes("administrador") || papeis.includes("gestor_comercial"),
  };
}
