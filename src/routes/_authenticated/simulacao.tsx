import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/simulacao")({
  head: () => ({
    meta: [
      { title: "Simulação de preços — Simulador de Preços" },
      { name: "description", content: "Busque um produto pai, defina o modo de cálculo e veja o preço de cada filho com a memória de cálculo." },
      { property: "og:title", content: "Simulação de preços — Simulador de Preços" },
      { property: "og:description", content: "Busque um produto pai, defina o modo de cálculo e veja o preço de cada filho com a memória de cálculo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaSimulacao,
});

function PaginaSimulacao() {
  return (
    <>
      <PageHeader modulo="Análise" titulo="Simulação de preços" descricao="Busque um produto pai, defina o modo de cálculo e veja o preço de cada filho com a memória de cálculo." />
      <ModuloPlanejado
        etapa="Etapa 5 — Simulação"
        recursos={["Busca do produto pai por código ou descrição", "Modo automático (custo ÷ (1 − margem)) ou preço manual do pai", "Tabela de filhos com filtros, ordenação e alertas", "Edição manual do preço de filhos", "Memória de cálculo por item", "Salvar simulação com snapshot das regras e exportar"]}
        colunas={["Código", "Descrição", "Cor", "Dimensão", "Ajuste cor", "Ajuste dim.", "Preço bruto", "Preço final", "Margem", "Meta", "Mercado", "Status"]}
        observacao="O cálculo é feito pelo motor no servidor; a tela apenas exibe resultados."
      />
    </>
  );
}
