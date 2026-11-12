import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: "Base de produtos — Simulador de Preços" },
      { name: "description", content: "Produtos pai e filho com custo completo, preço de mercado, cor e dimensão." },
      { property: "og:title", content: "Base de produtos — Simulador de Preços" },
      { property: "og:description", content: "Produtos pai e filho com custo completo, preço de mercado, cor e dimensão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaProdutos,
});

function PaginaProdutos() {
  return (
    <>
      <PageHeader modulo="Cadastros" titulo="Base de produtos" descricao="Produtos pai e filho com custo completo, preço de mercado, cor e dimensão." />
      <ModuloPlanejado
        etapa="Etapa 3 — Cadastros"
        recursos={["Busca por código ou descrição", "Filtros por tipo, família, linha, cor e status", "Edição com histórico de custo e mercado", "Cadastros auxiliares: famílias, linhas, cores e dimensões"]}
        colunas={["Código", "Descrição", "Tipo", "Família", "Linha", "Cor", "Dimensão", "Custo", "Mercado", "Status"]}
      />
    </>
  );
}
