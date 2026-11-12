import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/margens")({
  head: () => ({
    meta: [
      { title: "Margens objetivas — Simulador de Preços" },
      { name: "description", content: "Margens por produto, linha, família ou geral, com vigência e histórico." },
      { property: "og:title", content: "Margens objetivas — Simulador de Preços" },
      { property: "og:description", content: "Margens por produto, linha, família ou geral, com vigência e histórico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaMargens,
});

function PaginaMargens() {
  return (
    <>
      <PageHeader modulo="Regras comerciais" titulo="Margens objetivas" descricao="Margens por produto, linha, família ou geral, com vigência e histórico." />
      <ModuloPlanejado
        etapa="Etapa 4 — Regras comerciais"
        recursos={["Precedência: produto > linha > família > geral", "Vigência inicial e final", "Alerta de vigências sobrepostas", "Histórico de alterações"]}
        colunas={["Nível", "Referência", "Margem", "Início", "Fim", "Prioridade", "Status"]}
        observacao="Nenhuma margem padrão foi inventada; aguardando o valor oficial."
      />
    </>
  );
}
