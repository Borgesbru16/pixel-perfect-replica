import { arredondarDezCentavos } from "./arredondamento";
import { D, dec, decOuNulo, formatarNumero, formatarPct, formatarReais, type Dec } from "./decimal";
import {
  candidatosCor,
  candidatosDimensional,
  candidatosFamilia,
  escolherRegra,
  posicaoDimensional,
  resolverMargem,
  type Escolha,
} from "./regras";
import type {
  AjusteAplicado,
  AjusteDimensionalAplicado,
  Alerta,
  EntradaSimulacao,
  ItemResultado,
  ProdutoMotor,
  ResultadoSimulacao,
} from "./tipos";

export const VERSAO_MOTOR = "1.0.0";

const UM = new D(1);
const CEM = new D(100);

/** Representação de saída: string decimal sem notação exponencial. */
function s(v: Dec | null): string | null {
  return v === null ? null : v.toFixed();
}

function itemBase(p: ProdutoMotor): ItemResultado {
  return {
    produtoId: p.id,
    codigo: p.codigo,
    descricao: p.descricao,
    tipo: p.tipo,
    familia: p.familiaNome ?? null,
    linha: p.linhaNome ?? null,
    cor: p.corNome ?? null,
    dimensao: p.valorDimensao !== null ? `${p.valorDimensao}${p.unidade ? " " + p.unidade : ""}` : null,
    custo: p.custo,
    mercado: p.mercado,
    ajusteCor: null,
    ajusteDimensional: null,
    ajusteFamilia: null,
    margemObjetiva: null,
    origemMargem: null,
    margemRegraId: null,
    precoBruto: null,
    precoCalculado: null,
    precoManual: null,
    precoFinal: null,
    margemAlcancada: null,
    diferencaMargem: null,
    diferencaMercadoReais: null,
    diferencaMercadoPct: null,
    posicaoMercado: "indisponivel",
    status: "sem_meta",
    alertas: [],
    memoria: [],
    regrasAplicadas: [],
  };
}

function alerta(item: ItemResultado, a: Alerta) {
  item.alertas.push(a);
}

function temBloqueio(item: ItemResultado) {
  return item.alertas.some((a) => a.severidade === "bloqueio");
}

/** Valida o custo completo. Retorna null (com bloqueio registrado) quando inválido. */
function validarCusto(item: ItemResultado, p: ProdutoMotor): Dec | null {
  const custo = decOuNulo(p.custo);
  if (custo === null) {
    alerta(item, { codigo: "CUSTO_AUSENTE", severidade: "bloqueio", mensagem: "Custo ausente: cálculo bloqueado." });
    return null;
  }
  if (custo.lte(0)) {
    alerta(item, {
      codigo: "CUSTO_INVALIDO",
      severidade: "bloqueio",
      mensagem: "Custo igual a zero ou negativo: cálculo bloqueado.",
    });
    return null;
  }
  return custo;
}

/** Resolve a margem objetiva e registra origem/alertas. */
function aplicarMargem(item: ItemResultado, p: ProdutoMotor, entrada: EntradaSimulacao): Dec | null {
  const r = resolverMargem(p, entrada.margens, entrada.dataReferencia);
  if (r.status === "conflito") {
    alerta(item, {
      codigo: "MARGEM_CONFLITANTE",
      severidade: "bloqueio",
      mensagem: `Há ${r.ids.length} margens vigentes no nível ${r.nivel}: resolva o conflito antes de calcular.`,
    });
    return null;
  }
  if (r.status === "ausente") return null;
  if (r.percentual.lt(0) || r.percentual.gte(1)) {
    alerta(item, { codigo: "MARGEM_INVALIDA", severidade: "bloqueio", mensagem: "Margem objetiva inválida." });
    return null;
  }
  item.margemObjetiva = s(r.percentual);
  item.origemMargem = r.origem;
  item.margemRegraId = r.regraId;
  item.regrasAplicadas.push({ tipo: "margem", id: r.regraId });
  item.memoria.push(`Margem objetiva: ${formatarPct(r.percentual)} (origem: ${r.origem})`);
  return r.percentual;
}

/** Converte a escolha de regra em ajuste aplicado, registrando conflitos. */
function ajusteDeEscolha(
  item: ItemResultado,
  escolha: Escolha,
  rotulo: string,
  tipoRegra: string,
): AjusteAplicado | "conflito" | null {
  if (escolha.status === "conflito") {
    alerta(item, {
      codigo: `CONFLITO_${tipoRegra.toUpperCase()}`,
      severidade: "bloqueio",
      mensagem: `Regras conflitantes para ${rotulo} (${escolha.candidatos.map((c) => c.descricao).join(", ")}): resolva antes de calcular.`,
    });
    return "conflito";
  }
  if (escolha.status === "ausente") return null;
  const v = escolha.vencedor;
  item.regrasAplicadas.push({ tipo: tipoRegra, id: v.id });
  return { percentual: s(v.percentual)!, origem: v.descricao, regraId: v.id, fonte: v.fonte };
}

/** Compara preço final com margem objetiva e mercado e define o status. */
function finalizar(item: ItemResultado, preco: Dec, custo: Dec, meta: Dec | null, p: ProdutoMotor) {
  item.precoFinal = s(preco);
  const margem = preco.minus(custo).div(preco);
  item.margemAlcancada = s(margem);
  item.memoria.push(
    `Margem alcançada: (${formatarReais(preco)} − ${formatarReais(custo)}) / ${formatarReais(preco)} = ${formatarPct(margem)}`,
  );

  if (meta !== null) {
    const dif = margem.minus(meta);
    item.diferencaMargem = s(dif);
    if (margem.lt(meta)) {
      item.status = "abaixo_meta";
      alerta(item, {
        codigo: "MARGEM_ABAIXO",
        severidade: "alerta",
        mensagem: `Margem ${formatarPct(margem)} abaixo da objetiva ${formatarPct(meta)} (${formatarNumero(dif.times(CEM), 2)} p.p.). Preço mantido.`,
      });
    } else {
      item.status = "dentro_meta";
    }
  } else {
    item.status = "sem_meta";
  }

  const mercado = decOuNulo(p.mercado);
  if (mercado === null || mercado.lte(0)) {
    item.posicaoMercado = "indisponivel";
    alerta(item, { codigo: "MERCADO_AUSENTE", severidade: "info", mensagem: "Mercado ausente: comparação indisponível." });
  } else {
    const pct = preco.div(mercado).minus(UM);
    item.diferencaMercadoPct = s(pct);
    item.diferencaMercadoReais = s(preco.minus(mercado));
    item.posicaoMercado = pct.gt(0) ? "acima" : pct.lt(0) ? "abaixo" : "igual";
    item.memoria.push(
      `Mercado: ${formatarReais(preco)} / ${formatarReais(mercado)} − 1 = ${formatarPct(pct)} (${item.posicaoMercado} do mercado)`,
    );
  }
}

/** Ajuste de preço da família (somente se configurado e cadastrado). */
function resolverFamilia(item: ItemResultado, p: ProdutoMotor, entrada: EntradaSimulacao): Dec | "conflito" {
  const escolha = escolherRegra(
    candidatosFamilia(p, entrada.reguas, entrada.excecoes, entrada.dataReferencia),
    entrada.parametros.ordemEspecificidade,
  );
  const aj = ajusteDeEscolha(item, escolha, "o ajuste de família", "familia");
  if (aj === "conflito") return "conflito";
  if (aj === null) {
    item.memoria.push("Ajuste de família: nenhuma regra cadastrada (não aplicado)");
    return new D(0);
  }
  item.ajusteFamilia = aj;
  item.memoria.push(`Ajuste de família: ${formatarPct(dec(aj.percentual))} — ${aj.origem}`);
  return dec(aj.percentual);
}

function arredondar(item: ItemResultado, bruto: Dec, entrada: EntradaSimulacao): Dec | null {
  const r = arredondarDezCentavos(bruto, entrada.parametros.desempate);
  if (r.valor === null) {
    alerta(item, {
      codigo: "DESEMPATE_PENDENTE",
      severidade: "bloqueio",
      mensagem: `Preço ${formatarReais(bruto, 4)} está exatamente entre dois múltiplos de R$ 0,10 e o critério de desempate ainda não foi definido.`,
    });
    return null;
  }
  item.memoria.push(
    `Arredondamento para múltiplo de R$ 0,10: ${formatarReais(bruto, 4)} → ${formatarReais(r.valor)}${r.empate ? ` (desempate: ${entrada.parametros.desempate})` : ""}`,
  );
  return r.valor;
}

// ---------------------------------------------------------------------------
// Pai
// ---------------------------------------------------------------------------

function calcularPai(entrada: EntradaSimulacao): { item: ItemResultado; preco: Dec | null } {
  const p = entrada.pai;
  const item = itemBase(p);
  item.memoria.push(`Modo de formação: ${entrada.modo === "automatico" ? "automático" : "manual"}`);

  if (p.tipo !== "pai") {
    alerta(item, { codigo: "NAO_E_PAI", severidade: "bloqueio", mensagem: "O produto selecionado não é um código pai." });
  }

  const custo = validarCusto(item, p);
  const meta = aplicarMargem(item, p, entrada);
  if (meta === null && !temBloqueio(item)) {
    if (entrada.modo === "automatico") {
      alerta(item, {
        codigo: "MARGEM_AUSENTE",
        severidade: "bloqueio",
        mensagem: "Margem objetiva ausente: formação automática bloqueada.",
      });
    } else {
      alerta(item, {
        codigo: "MARGEM_AUSENTE",
        severidade: "alerta",
        mensagem: "Margem objetiva ausente: comparação com a meta indisponível.",
      });
    }
  }

  let fatorFamilia = UM;
  if (entrada.parametros.aplicacaoAjusteFamilia === "pai_e_filhos" && entrada.modo === "automatico") {
    const af = resolverFamilia(item, p, entrada);
    if (af !== "conflito") fatorFamilia = UM.plus(af);
  }

  if (temBloqueio(item) || custo === null) {
    item.status = "bloqueado";
    return { item, preco: null };
  }

  let preco: Dec | null;
  if (entrada.modo === "automatico") {
    const m = meta!;
    const bruto = custo.div(UM.minus(m)).times(fatorFamilia);
    item.precoBruto = s(bruto);
    item.memoria.push(
      `Preço = custo / (1 − margem) = ${formatarReais(custo)} / (1 − ${formatarPct(m)})${fatorFamilia.eq(UM) ? "" : ` × ${formatarNumero(fatorFamilia)}`} = ${formatarReais(bruto, 4)}`,
    );
    if (entrada.parametros.arredondarPaiAutomatico) {
      preco = arredondar(item, bruto, entrada);
    } else {
      preco = bruto.toDecimalPlaces(4);
      item.memoria.push("Arredondamento do pai desativado nos parâmetros.");
    }
    item.precoCalculado = s(preco);
  } else {
    const informado = decOuNulo(entrada.precoPaiInformado ?? null);
    if (informado === null || informado.lte(0)) {
      alerta(item, {
        codigo: "PRECO_MANUAL_INVALIDO",
        severidade: "bloqueio",
        mensagem: "Preço manual igual ou inferior a zero: cálculo bloqueado.",
      });
      preco = null;
    } else {
      preco = informado;
      item.precoManual = s(informado);
      item.memoria.push(`Preço informado manualmente: ${formatarReais(informado)} (não alterado pelo sistema)`);
    }
  }

  if (preco === null) {
    item.status = "bloqueado";
    return { item, preco: null };
  }

  finalizar(item, preco, custo, meta, p);
  return { item, preco };
}

// ---------------------------------------------------------------------------
// Filhos
// ---------------------------------------------------------------------------

function calcularFilho(
  f: ProdutoMotor,
  entrada: EntradaSimulacao,
  precoPai: Dec | null,
  ajusteCorPai: Dec | null,
  posicaoPai: number | null,
): ItemResultado {
  const item = itemBase(f);
  const pai = entrada.pai;
  const par = entrada.parametros;

  if (f.tipo !== "filho") {
    alerta(item, { codigo: "NAO_E_FILHO", severidade: "bloqueio", mensagem: "Produto não está cadastrado como filho." });
  }
  if (f.linhaId !== pai.linhaId) {
    alerta(item, {
      codigo: "LINHA_DIFERENTE",
      severidade: "bloqueio",
      mensagem: "Pai e filho em linhas diferentes: replicação bloqueada.",
    });
  }
  if (precoPai === null) {
    alerta(item, {
      codigo: "PAI_SEM_PRECO",
      severidade: "bloqueio",
      mensagem: "Preço do pai indisponível: replicação bloqueada.",
    });
  }

  const custo = validarCusto(item, f);
  const meta = aplicarMargem(item, f, entrada);
  if (meta === null && !item.alertas.some((a) => a.codigo === "MARGEM_CONFLITANTE")) {
    alerta(item, {
      codigo: "MARGEM_AUSENTE",
      severidade: "alerta",
      mensagem: "Margem objetiva ausente: comparação com a meta indisponível.",
    });
  }

  // --- Cor ---------------------------------------------------------------
  let fatorCor = UM;
  if (!f.corId) {
    alerta(item, { codigo: "COR_AUSENTE", severidade: "alerta", mensagem: "Produto sem cor: ajuste de cor não aplicado." });
  } else {
    const escolha = escolherRegra(
      candidatosCor(f, entrada.reguas, entrada.excecoes, entrada.dataReferencia),
      par.ordemEspecificidade,
    );
    const aj = ajusteDeEscolha(item, escolha, "a cor", "cor");
    if (aj === null) {
      alerta(item, {
        codigo: "REGUA_COR_AUSENTE",
        severidade: "alerta",
        mensagem: `Régua de cor ausente para ${f.corNome ?? "a cor do produto"}: nenhum percentual aplicado.`,
      });
    } else if (aj !== "conflito") {
      let pct = dec(aj.percentual);
      if (par.referenciaCor === "relativa_ao_pai") {
        if (ajusteCorPai === null) {
          alerta(item, {
            codigo: "REGUA_COR_PAI_AUSENTE",
            severidade: "bloqueio",
            mensagem: "Ajuste de cor relativo ao pai exige régua para a cor do pai.",
          });
        } else {
          pct = UM.plus(pct).div(UM.plus(ajusteCorPai)).minus(UM);
          item.memoria.push(
            `Ajuste de cor relativo ao pai: (1 + ${formatarPct(dec(aj.percentual))}) / (1 + ${formatarPct(ajusteCorPai)}) − 1`,
          );
        }
      }
      item.ajusteCor = { ...aj, percentual: s(pct)! };
      fatorCor = UM.plus(pct);
      item.memoria.push(`Ajuste de cor (${f.corNome ?? "cor"}): ${formatarPct(pct)} — ${aj.origem}`);
    }
  }

  // --- Dimensão ------------------------------------------------------------
  let fatorDim = UM;
  const semDimensao =
    f.valorDimensao === null || pai.valorDimensao === null || !f.grupoDimensionalId || !pai.grupoDimensionalId;
  if (semDimensao) {
    alerta(item, {
      codigo: "DIMENSAO_AUSENTE",
      severidade: "alerta",
      mensagem: "Dimensão ausente (no pai ou no filho): ajuste dimensional não aplicado.",
    });
  } else if (f.grupoDimensionalId !== pai.grupoDimensionalId) {
    alerta(item, {
      codigo: "GRUPO_DIMENSIONAL_DIFERENTE",
      severidade: "bloqueio",
      mensagem: "Pai e filho em grupos dimensionais diferentes: regra ainda não definida.",
    });
  } else {
    const posFilho = posicaoDimensional(f, entrada.sequencias, par.fontePosicaoDimensional);
    if (posFilho === null || posicaoPai === null) {
      alerta(item, {
        codigo: "POSICAO_DIMENSIONAL_AUSENTE",
        severidade: "bloqueio",
        mensagem:
          par.fontePosicaoDimensional === "sequencia_grupo"
            ? "Dimensão do pai ou do filho não cadastrada na sequência do grupo dimensional."
            : "Ordem dimensional ausente no pai ou no filho.",
      });
    } else {
      const n = posFilho - posicaoPai;
      if (n === 0) {
        item.ajusteDimensional = { percentual: "0", origem: "mesma posição do pai", regraId: null, fonte: null, incrementos: 0, taxa: null };
        item.memoria.push("Ajuste dimensional: 0 incrementos em relação ao pai (0,00%)");
      } else {
        const escolha = escolherRegra(
          candidatosDimensional(f, entrada.reguas, entrada.excecoes, entrada.dataReferencia),
          par.ordemEspecificidade,
        );
        const aj = ajusteDeEscolha(item, escolha, "a dimensão", "dimensional");
        if (aj === null) {
          alerta(item, {
            codigo: "REGUA_DIMENSIONAL_AUSENTE",
            severidade: "alerta",
            mensagem: "Régua dimensional ausente para o grupo: nenhum percentual aplicado.",
          });
        } else if (aj !== "conflito") {
          const r = dec(aj.percentual);
          const ad =
            par.modoDimensional === "linear" ? r.times(n) : UM.plus(r).pow(n).minus(UM);
          const detalhe: AjusteDimensionalAplicado = {
            ...aj,
            percentual: s(ad)!,
            incrementos: n,
            taxa: aj.percentual,
          };
          item.ajusteDimensional = detalhe;
          fatorDim = UM.plus(ad);
          item.memoria.push(
            par.modoDimensional === "linear"
              ? `Ajuste dimensional (linear): ${formatarPct(r)} × ${n} incrementos = ${formatarPct(ad)} — ${aj.origem}`
              : `Ajuste dimensional (composto): (1 + ${formatarPct(r)})^${n} − 1 = ${formatarPct(ad, 4)} — ${aj.origem}`,
          );
        }
      }
    }
  }

  // --- Família -------------------------------------------------------------
  let fatorFamilia = UM;
  if (par.aplicacaoAjusteFamilia !== "nao_aplicar") {
    const af = resolverFamilia(item, f, entrada);
    if (af !== "conflito") fatorFamilia = UM.plus(af);
  }

  if (temBloqueio(item) || custo === null || precoPai === null) {
    item.status = "bloqueado";
    return item;
  }

  // --- Preço bruto, arredondamento, manual ---------------------------------
  const bruto = precoPai.times(fatorCor).times(fatorDim).times(fatorFamilia);
  item.precoBruto = s(bruto);
  item.memoria.push(
    `Preço bruto: ${formatarReais(precoPai)} × ${formatarNumero(fatorCor)} × ${formatarNumero(fatorDim)}${
      par.aplicacaoAjusteFamilia !== "nao_aplicar" ? ` × ${formatarNumero(fatorFamilia)}` : ""
    } = ${formatarReais(bruto, 4)}`,
  );
  const calculado = arredondar(item, bruto, entrada);
  if (calculado === null) {
    item.status = "bloqueado";
    return item;
  }
  item.precoCalculado = s(calculado);

  let final = calculado;
  const manualTxt = entrada.precosManuaisFilhos?.[f.id];
  if (manualTxt !== undefined && manualTxt !== null && String(manualTxt).trim() !== "") {
    const manual = decOuNulo(manualTxt);
    if (manual === null || manual.lte(0)) {
      alerta(item, {
        codigo: "PRECO_MANUAL_INVALIDO",
        severidade: "bloqueio",
        mensagem: "Preço manual igual ou inferior a zero: cálculo bloqueado.",
      });
      item.status = "bloqueado";
      return item;
    }
    final = manual;
    item.precoManual = s(manual);
    alerta(item, {
      codigo: "PRECO_MANUAL",
      severidade: "info",
      mensagem: `Preço alterado manualmente nesta simulação: original ${formatarReais(calculado)}, manual ${formatarReais(manual)}.`,
    });
    item.memoria.push(`Preço manual na simulação: ${formatarReais(manual)} (original ${formatarReais(calculado)})`);
  }

  finalizar(item, final, custo, meta, f);
  return item;
}

// ---------------------------------------------------------------------------
// Entrada principal
// ---------------------------------------------------------------------------

/**
 * Executa a simulação completa (seção 22 do documento mestre).
 * Função pura: não acessa banco nem relógio; tudo vem da entrada.
 * Nunca corrige preços para alcançar a margem.
 */
export function simular(entrada: EntradaSimulacao): ResultadoSimulacao {
  const { item: pai, preco: precoPai } = calcularPai(entrada);

  // Ajuste de cor do pai (usado apenas na referência relativa)
  let ajusteCorPai: Dec | null = null;
  if (entrada.parametros.referenciaCor === "relativa_ao_pai" && entrada.pai.corId) {
    const esc = escolherRegra(
      candidatosCor(entrada.pai, entrada.reguas, entrada.excecoes, entrada.dataReferencia),
      entrada.parametros.ordemEspecificidade,
    );
    if (esc.status === "ok") ajusteCorPai = esc.vencedor.percentual;
  }

  const posicaoPai = posicaoDimensional(
    entrada.pai,
    entrada.sequencias,
    entrada.parametros.fontePosicaoDimensional,
  );

  const filhos = entrada.filhos.map((f) => calcularFilho(f, entrada, precoPai, ajusteCorPai, posicaoPai));

  return {
    versaoMotor: VERSAO_MOTOR,
    dataReferencia: entrada.dataReferencia,
    modo: entrada.modo,
    parametros: entrada.parametros,
    pai,
    filhos,
    bloqueado: pai.status === "bloqueado",
  };
}
