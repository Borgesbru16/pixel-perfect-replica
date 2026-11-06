import { CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ModuloPlanejadoProps {
  etapa: string;
  recursos: string[];
  colunas?: string[];
  observacao?: string;
}

/** Estrutura da tela de um módulo ainda não implementado (etapa futura do plano). */
export function ModuloPlanejado({ etapa, recursos, colunas, observacao }: ModuloPlanejadoProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="panel overflow-hidden">
        {colunas && colunas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  {colunas.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={colunas.length} className="px-3 py-16 text-center">
                    <CircleDashed className="mx-auto size-6 text-muted-foreground/60" />
                    <p className="mt-3 text-sm font-medium text-foreground">Nenhum registro ainda</p>
                    <p className="mt-1 text-xs text-muted-foreground">Os dados aparecerão aqui após a {etapa.toLowerCase()}.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <CircleDashed className="mx-auto size-6 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">Módulo em preparação</p>
            <p className="mt-1 text-xs text-muted-foreground">Disponível na {etapa.toLowerCase()}.</p>
          </div>
        )}
      </div>

      <aside className="panel p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">Previsto</p>
          <Badge variant="signal">{etapa}</Badge>
        </div>
        <ul className="mt-4 space-y-2.5">
          {recursos.map((r) => (
            <li key={r} className="flex gap-2.5 text-sm text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {observacao ? <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">{observacao}</p> : null}
      </aside>
    </div>
  );
}
