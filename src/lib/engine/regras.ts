import { D, dec, decOuNulo, type Dec } from "./decimal";
import type {
  Escopo,
  Excecao,
  MargemRegra,
  ProdutoMotor,
  Regua,
  SequenciaDimensional,
  Vigencia,
} from "./tipos";

export function vigente(regra: Vigencia, data: string): boolean {
  return (
    regra.ativo &&
    regra.vigenciaInicio <= data &&
    (regra.vigenciaFim === null || regra.vigenciaFim >= data)
  );
}

// ---------------------------------------------------------------------------
// Margem objetiva: produto > linha > família > geral (primeira regra válida)
// ---------------------------------------------------------------------------

export type ResolucaoMargem =
  | { status: "ok"; percentual: Dec; origem: string; regraId: string }
  | { status: "ausente" }
  | { status: "conflito"; nivel: string; ids: string[] };

const ROTULO_NIVEL: Record<MargemRegra["nivel"], string> = {
  produto: "Produto",
  linha: "Linha",
  familia: "Família",
  geral: "Geral",
};

export function resolverMargem(
  produto: ProdutoMotor,
  margens: MargemRegra[],
  data: string,
): ResolucaoMargem {
  const niveis: { nivel: MargemRegra["nivel"]; ref: string | null }[] = [
    { nivel: "produto", ref: produto.id },
    { nivel: "linha", ref: produto.linhaId },
    { nivel: "familia", ref: produto.familiaId },
    { nivel: "geral", ref: null },
  ];
  for (const { nivel, ref } of niveis) {
    const candidatas = margens.filter(
      (m) => m.nivel === nivel && (nivel === "geral" || m.referenciaId === ref) && vigente(m, data),
    );
    if (candidatas.length === 1) {
      const m = candidatas[0];
      return { status: "ok", percentual: dec(m.percentual), origem: ROTULO_NIVEL[nivel], regraId: m.id };
    }
    if (candidatas.length > 1) {
      return { status: "conflito", nivel: ROTULO_NIVEL[nivel], ids: candidatas.map((c) => c.id) };
    }
  }
  return { status: "ausente" };
}

// ---------------------------------------------------------------------------
// Réguas e exceções
// ---------------------------------------------------------------------------

export interface Candidato {
  id: string;
  fonte: "regua" | "excecao";
  escopo: Escopo;
  prioridade: number;
  percentual: Dec;
  descricao: string;
}

export type Escolha =
  | { status: "ok"; vencedor: Candidato }
  | { status: "ausente" }
  | { status: "conflito"; candidatos: Candidato[] };

function escopoAplica(
  escopo: Escopo,
  alvo: { produtoId?: string | null; familiaId?: string | null; linhaId?: string | null; grupoDimensionalId?: string | null },
  produto: ProdutoMotor,
): boolean {
  switch (escopo) {
    case "geral":
      return true;
    case "familia":
      return alvo.familiaId === produto.familiaId;
    case "linha":
      return alvo.linhaId === produto.linhaId;
    case "grupo_dimensional":
      return produto.grupoDimensionalId !== null && alvo.grupoDimensionalId === produto.grupoDimensionalId;
    case "produto":
      return alvo.produtoId === produto.id;
  }
}

/** Réguas vigentes de um tipo, removendo as que foram substituídas por outra régua vigente. */
export function reguasVigentes(reguas: Regua[], tipo: Regua["tipo"], data: string): Regua[] {
  const vig = reguas.filter((r) => r.tipo === tipo && vigente(r, data));
  const substituidas = new Set(vig.map((r) => r.substituiId).filter(Boolean) as string[]);
  return vig.filter((r) => !substituidas.has(r.id));
}

export function excecoesVigentes(
  excecoes: Excecao[],
  tipo: Excecao["tipoAjuste"],
  produto: ProdutoMotor,
  data: string,
): Excecao[] {
  const vig = excecoes.filter((e) => e.tipoAjuste === tipo && vigente(e, data) && escopoAplica(e.escopo, e, produto));
  const substituidas = new Set(vig.map((e) => e.substituiId).filter(Boolean) as string[]);
  return vig.filter((e) => !substituidas.has(e.id));
}

/**
 * Escolhe uma única regra para um mesmo tipo de ajuste.
 * Ordem: escopo mais específico → exceção antes de régua → maior prioridade.
 * Empate total exige resolução (conflito).
 */
export function escolherRegra(candidatos: Candidato[], ordem: Escopo[]): Escolha {
  if (candidatos.length === 0) return { status: "ausente" };
  const rank = (c: Candidato) => {
    const i = ordem.indexOf(c.escopo);
    return i === -1 ? ordem.length : i;
  };
  const ordenados = [...candidatos].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.fonte === b.fonte ? 0 : a.fonte === "excecao" ? -1 : 1) ||
      b.prioridade - a.prioridade,
  );
  const topo = ordenados[0];
  const empatados = ordenados.filter(
    (c) => rank(c) === rank(topo) && c.fonte === topo.fonte && c.prioridade === topo.prioridade,
  );
  if (empatados.length > 1) return { status: "conflito", candidatos: empatados };
  return { status: "ok", vencedor: topo };
}

const ROTULO_ESCOPO: Record<Escopo, string> = {
  geral: "geral",
  familia: "família",
  linha: "linha",
  grupo_dimensional: "grupo dimensional",
  produto: "produto",
};

export function rotuloEscopo(e: Escopo): string {
  return ROTULO_ESCOPO[e];
}

/** Candidatos para o ajuste de cor de um produto. */
export function candidatosCor(produto: ProdutoMotor, reguas: Regua[], excecoes: Excecao[], data: string): Candidato[] {
  if (!produto.corId) return [];
  const exc = excecoesVigentes(excecoes, "cor", produto, data).filter((e) => e.corId === produto.corId);
  const substituidasPorExcecao = new Set(exc.map((e) => e.substituiReguaId).filter(Boolean) as string[]);
  const lista: Candidato[] = [];
  for (const r of reguasVigentes(reguas, "cor", data)) {
    if (substituidasPorExcecao.has(r.id)) continue;
    if (!escopoAplica(r.escopo, r, produto)) continue;
    const item = r.cores.find((c) => c.corId === produto.corId);
    if (!item) continue;
    lista.push({
      id: r.id,
      fonte: "regua",
      escopo: r.escopo,
      prioridade: r.prioridade,
      percentual: dec(item.percentual),
      descricao: `régua ${r.codigo} (${rotuloEscopo(r.escopo)})`,
    });
  }
  for (const e of exc) {
    lista.push({
      id: e.id,
      fonte: "excecao",
      escopo: e.escopo,
      prioridade: e.prioridade,
      percentual: dec(e.percentual),
      descricao: `exceção (${rotuloEscopo(e.escopo)})`,
    });
  }
  return lista;
}

/** Candidatos para a taxa dimensional de um produto (no grupo do produto). */
export function candidatosDimensional(
  produto: ProdutoMotor,
  reguas: Regua[],
  excecoes: Excecao[],
  data: string,
): Candidato[] {
  if (!produto.grupoDimensionalId) return [];
  const exc = excecoesVigentes(excecoes, "dimensional", produto, data);
  const substituidasPorExcecao = new Set(exc.map((e) => e.substituiReguaId).filter(Boolean) as string[]);
  const lista: Candidato[] = [];
  for (const r of reguasVigentes(reguas, "dimensional", data)) {
    if (substituidasPorExcecao.has(r.id)) continue;
    if (!escopoAplica(r.escopo, r, produto)) continue;
    const taxa = r.taxas.find((t) => t.grupoDimensionalId === produto.grupoDimensionalId);
    if (!taxa) continue;
    lista.push({
      id: r.id,
      fonte: "regua",
      escopo: r.escopo,
      prioridade: r.prioridade,
      percentual: dec(taxa.taxa),
      descricao: `régua ${r.codigo} (${rotuloEscopo(r.escopo)})`,
    });
  }
  for (const e of exc) {
    lista.push({
      id: e.id,
      fonte: "excecao",
      escopo: e.escopo,
      prioridade: e.prioridade,
      percentual: dec(e.percentual),
      descricao: `exceção (${rotuloEscopo(e.escopo)})`,
    });
  }
  return lista;
}

/** Candidatos para o ajuste de preço da família. */
export function candidatosFamilia(
  produto: ProdutoMotor,
  reguas: Regua[],
  excecoes: Excecao[],
  data: string,
): Candidato[] {
  const exc = excecoesVigentes(excecoes, "familia", produto, data);
  const substituidasPorExcecao = new Set(exc.map((e) => e.substituiReguaId).filter(Boolean) as string[]);
  const lista: Candidato[] = [];
  for (const r of reguasVigentes(reguas, "familia", data)) {
    if (substituidasPorExcecao.has(r.id) || r.percentual === null) continue;
    if (!escopoAplica(r.escopo, r, produto)) continue;
    lista.push({
      id: r.id,
      fonte: "regua",
      escopo: r.escopo,
      prioridade: r.prioridade,
      percentual: dec(r.percentual),
      descricao: `régua ${r.codigo} (${rotuloEscopo(r.escopo)})`,
    });
  }
  for (const e of exc) {
    lista.push({
      id: e.id,
      fonte: "excecao",
      escopo: e.escopo,
      prioridade: e.prioridade,
      percentual: dec(e.percentual),
      descricao: `exceção (${rotuloEscopo(e.escopo)})`,
    });
  }
  return lista;
}

/** Posição comercial de um produto na sequência dimensional. */
export function posicaoDimensional(
  produto: ProdutoMotor,
  sequencias: SequenciaDimensional[],
  fonte: "sequencia_grupo" | "ordem_produto",
): number | null {
  if (fonte === "ordem_produto") return produto.ordemDimensional;
  const valor = decOuNulo(produto.valorDimensao);
  if (!valor || !produto.grupoDimensionalId) return null;
  const item = sequencias.find(
    (s) => s.ativo && s.grupoDimensionalId === produto.grupoDimensionalId && new D(s.valorDimensao).eq(valor),
  );
  return item ? item.ordem : null;
}
