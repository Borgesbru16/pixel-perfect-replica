import type { ReactNode } from "react";

interface PageHeaderProps {
  modulo: string;
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}

export function PageHeader({ modulo, titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">{modulo}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{titulo}</h1>
        {descricao ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div> : null}
    </div>
  );
}
