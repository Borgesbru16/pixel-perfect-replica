import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Calculator, Package, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obterIndicadores } from "@/lib/dashboard.functions";

const indicadoresQuery = queryOptions({
  queryKey: ["dashboard", "indicadores"],
  queryFn: () => obterIndicadores(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Simulador de Preços" },
      { name: "description", content: "Indicadores de produtos, simulações, metas e comparação com o mercado." },
      { property: "og:title", content: "Dashboard — Simulador de Preços" },
      { property: "og:description", content: "Indicadores de produtos, simulações, metas e comparação com o mercado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(indicadoresQuery),
  component: Dashboard,
});

function formatarData(iso: string | null) {
  if (!iso) return "Sem registro";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Indicador({ rotulo, valor, detalhe, icone }: { rotulo: string; valor: number; detalhe?: string; icone: ReactNode }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{rotulo}</p>
        <span className="text-muted-foreground [&_svg]:size-4">{icone}</span>
      </div>
      <p className="tabular mt-3 text-3xl font-medium text-foreground">{valor.toLocaleString("pt-BR")}</p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

function Dashboard() {
  const { data: i } = useSuspenseQuery(indicadoresQuery);

  return (
    <>
      <PageHeader
        modulo="Análise"
        titulo="Dashboard"
        descricao="Visão geral da base de produtos, das simulações e do posicionamento de preços."
        acoes={
          <Button asChild>
            <Link to="/simulacao">
              <Calculator /> Nova simulação
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador rotulo="Produtos" valor={i.totalProdutos} detalhe={`${i.totalPais} pais · ${i.totalFilhos} filhos`} icone={<Package />} />
        <Indicador rotulo="Simulações" valor={i.totalSimulacoes} detalhe="Gravadas no histórico" icone={<Calculator />} />
        <Indicador rotulo="Abaixo da meta" valor={i.itensAbaixoMeta} detalhe="Itens com margem menor que a objetiva" icone={<TrendingDown />} />
        <div className="panel p-5">
          <p className="eyebrow">Versus mercado</p>
          <div className="mt-3 flex items-end gap-6">
            <div>
              <p className="tabular flex items-center gap-1 text-2xl font-medium text-foreground">
                <ArrowUpRight className="size-4 text-destructive" />
                {i.itensAcimaMercado.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">Acima</p>
            </div>
            <div>
              <p className="tabular flex items-center gap-1 text-2xl font-medium text-foreground">
                <ArrowDownRight className="size-4 text-success" />
                {i.itensAbaixoMercado.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">Abaixo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <p className="eyebrow">Últimas atualizações</p>
          <dl className="mt-4 divide-y text-sm">
            {(
              [
                ["Custos", i.ultimaAtualizacaoCustos],
                ["Preços de mercado", i.ultimaAtualizacaoMercado],
                ["Réguas comerciais", i.ultimaAtualizacaoReguas],
              ] as const
            ).map(([rotulo, data]) => (
              <div key={rotulo} className="flex items-center justify-between py-2.5">
                <dt className="text-muted-foreground">{rotulo}</dt>
                <dd className="tabular text-foreground">{formatarData(data)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow">Parâmetros aguardando validação</p>
            <Badge variant={i.parametrosPendentes.length ? "warning" : "success"}>{i.parametrosPendentes.length}</Badge>
          </div>
          {i.parametrosPendentes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Todos os parâmetros comerciais foram validados.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {i.parametrosPendentes.map((p) => (
                <li key={p.chave} className="flex gap-2.5 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <span className="text-foreground">{p.descricao}</span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/configuracoes">Ver parâmetros</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
