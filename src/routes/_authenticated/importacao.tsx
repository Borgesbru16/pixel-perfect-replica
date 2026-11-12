import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/importacao")({
  head: () => ({
    meta: [
      { title: "Importação de bases — Simulador de Preços" },
      { name: "description", content: "Atualize produtos, custos, mercado e hierarquia a partir de planilhas Excel." },
      { property: "og:title", content: "Importação de bases — Simulador de Preços" },
      { property: "og:description", content: "Atualize produtos, custos, mercado e hierarquia a partir de planilhas Excel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaImportacao,
});

function PaginaImportacao() {
  return (
    <>
      <PageHeader modulo="Cadastros" titulo="Importação de bases" descricao="Atualize produtos, custos, mercado e hierarquia a partir de planilhas Excel." />
      <ModuloPlanejado
        etapa="Etapa 6 — Importação"
        recursos={["Assistente em 7 passos: envio, tipo, colunas, validação, prévia, confirmação e relatório", "Leitura da planilha no navegador", "Rejeições linha a linha com motivo", "Registro de cada importação com usuário e contadores"]}
        colunas={["Data", "Arquivo", "Tipo", "Linhas", "Aceitas", "Rejeitadas", "Usuário"]}
      />
    </>
  );
}
