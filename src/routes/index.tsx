import { createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

// A sessão fica no navegador: o redirecionamento roda apenas no cliente.
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Simulador de Preços — Início" },
      { name: "description", content: "Acesse o Simulador de Preços para formar, simular e analisar preços de produtos." },
      { property: "og:title", content: "Simulador de Preços — Início" },
      { property: "og:description", content: "Formação, simulação e análise de preços de produtos pai e filho." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/dashboard" : "/auth", replace: true });
  },
});
