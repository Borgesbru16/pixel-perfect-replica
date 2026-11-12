import { createFileRoute } from "@tanstack/react-router";

import { ModuloPlanejado } from "@/components/app/modulo-planejado";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_authenticated/reguas")({
  head: () => ({
    meta: [
      { title: "Réguas comerciais — Simulador de Preços" },
      { name: "description", content: "Percentuais por cor, por posição dimensional e por família, com exceções e vigências." },
      { property: "og:title", content: "Réguas comerciais — Simulador de Preços" },
      { property: "og:description", content: "Percentuais por cor, por posição dimensional e por família, com exceções e vigências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaReguas,
});

function PaginaReguas() {
  return (
    <>
      <PageHeader modulo="Regras comerciais" titulo="Réguas comerciais" descricao="Percentuais por cor, por posição dimensional e por família, com exceções e vigências." />
      <ModuloPlanejado
        etapa="Etapa 4 — Regras comerciais"
        recursos={["Réguas de cores", "Réguas dimensionais (taxa por incremento)", "Ajuste de família", "Exceções por produto ou escopo", "Sequências dimensionais por grupo", "Vigência, prioridade e regra substituída"]}
        colunas={["Nome", "Tipo", "Escopo", "Percentual", "Início", "Fim", "Prioridade", "Status"]}
        observacao="Pontos ainda não definidos (taxa linear ou composta, cor relativa ao pai) ficam em Usuários e configurações."
      />
    </>
  );
}
