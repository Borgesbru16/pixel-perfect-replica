import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/hierarquia")({
  head: () => ({
    meta: [
      { title: "Hierarquia de produtos — Simulador de Preços" },
      { name: "description", content: "Vínculos entre produtos pai e filho, com histórico de alterações." },
      { property: "og:title", content: "Hierarquia de produtos — Simulador de Preços" },
      { property: "og:description", content: "Vínculos entre produtos pai e filho, com histórico de alterações." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaHierarquia,
});

function PaginaHierarquia() {
  return (
    <>
      <PageHeader modulo="Cadastros" titulo="Hierarquia de produtos" descricao="Vínculos entre produtos pai e filho, com histórico de alterações." />
      <ModuloPlanejado
        etapa="Etapa 3 — Cadastros"
        recursos={["Vincular filhos a um pai da mesma linha", "Bloqueio de filho com mais de um pai", "Bloqueio de produto pai dele mesmo", "Histórico de vínculos criados e removidos"]}
        colunas={["Pai", "Descrição do pai", "Filho", "Descrição do filho", "Linha", "Vinculado em"]}
        observacao="As regras de vínculo já são garantidas pelo banco."
      />
    </>
  );
}
