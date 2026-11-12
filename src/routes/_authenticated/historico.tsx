import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de simulações — Simulador de Preços" },
      { name: "description", content: "Consulte simulações gravadas e reproduza exatamente o resultado da época." },
      { property: "og:title", content: "Histórico de simulações — Simulador de Preços" },
      { property: "og:description", content: "Consulte simulações gravadas e reproduza exatamente o resultado da época." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaHistorico,
});

function PaginaHistorico() {
  return (
    <>
      <PageHeader modulo="Análise" titulo="Histórico de simulações" descricao="Consulte simulações gravadas e reproduza exatamente o resultado da época." />
      <ModuloPlanejado
        etapa="Etapa 7 — Histórico"
        recursos={["Filtros por produto pai, usuário e período", "Reprodução fiel usando somente o snapshot gravado", "Versão do motor e parâmetros utilizados", "Exportação para Excel"]}
        colunas={["Data", "Produto pai", "Modo", "Preço do pai", "Itens", "Usuário", "Versão do motor"]}
        observacao="Simulações gravadas não podem ser alteradas."
      />
    </>
  );
}
