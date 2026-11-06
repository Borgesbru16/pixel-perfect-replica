/**
 * Critérios de aceite do motor de cálculo (seção 25 do documento mestre).
 * Os percentuais usados aqui são dados de teste, não regras comerciais.
 */
import { describe, expect, it } from "vitest";

import { arredondarDezCentavos } from "./arredondamento";
import { dec } from "./decimal";
import { simular } from "./motor";
import type {
  EntradaSimulacao,
  ItemResultado,
  Excecao,
  MargemRegra,
  ParametrosMotor,
  ProdutoMotor,
  Regua,
  SequenciaDimensional,
} from "./tipos";

const DATA = "2026-11-06";
const VIG = { ativo: true, vigenciaInicio: "2026-01-01", vigenciaFim: null };

const PARAMS: ParametrosMotor = {
  modoDimensional: "linear",
  fontePosicaoDimensional: "sequencia_grupo",
  referenciaCor: "absoluta",
  aplicacaoAjusteFamilia: "nao_aplicar",
  arredondarPaiAutomatico: true,
  desempate: "pendente",
  ordemEspecificidade: ["produto", "grupo_dimensional", "linha", "familia", "geral"],
};

function produto(p: Partial<ProdutoMotor> & { id: string }): ProdutoMotor {
  return {
    codigo: p.id.toUpperCase(),
    descricao: `Produto ${p.id}`,
    tipo: "filho",
    familiaId: "fam1",
    linhaId: "lin1",
    corId: "bege",
    corNome: "Bege",
    grupoDimensionalId: "g1",
    valorDimensao: "20",
    unidade: "mm",
    ordemDimensional: null,
    custo: "6",
    mercado: null,
    ...p,
  };
}

const SEQ: SequenciaDimensional[] = [10, 15, 20, 25, 30].map((v, i) => ({
  grupoDimensionalId: "g1",
  valorDimensao: String(v),
  ordem: i + 1,
  ativo: true,
}));

const REGUA_COR: Regua = {
  ...VIG,
  id: "rc-geral",
  codigo: "COR-GERAL",
  nome: "Cores geral",
  tipo: "cor",
  escopo: "geral",
  familiaId: null,
  linhaId: null,
  grupoDimensionalId: null,
  prioridade: 0,
  percentual: null,
  substituiId: null,
  cores: [
    { corId: "branca", percentual: "-0.10" },
    { corId: "bege", percentual: "0" },
  ],
  taxas: [],
};

const REGUA_DIM: Regua = {
  ...VIG,
  id: "rd-geral",
  codigo: "DIM-GERAL",
  nome: "Dimensional geral",
  tipo: "dimensional",
  escopo: "geral",
  familiaId: null,
  linhaId: null,
  grupoDimensionalId: null,
  prioridade: 0,
  percentual: null,
  substituiId: null,
  cores: [],
  taxas: [{ grupoDimensionalId: "g1", taxa: "0.05" }],
};

const MARGEM_GERAL: MargemRegra = { ...VIG, id: "m-geral", nivel: "geral", referenciaId: null, percentual: "0.40" };

function entrada(over: Partial<EntradaSimulacao> = {}): EntradaSimulacao {
  return {
    dataReferencia: DATA,
    modo: "manual",
    precoPaiInformado: "10",
    pai: produto({ id: "pai", tipo: "pai", custo: "6" }),
    filhos: [],
    margens: [MARGEM_GERAL],
    reguas: [REGUA_COR, REGUA_DIM],
    excecoes: [],
    sequencias: SEQ,
    parametros: PARAMS,
    ...over,
  };
}

const n = (v: string | null) => (v === null ? null : dec(v).toFixed(4));

describe("1. Preço automático do pai", () => {
  it("custo R$ 60,00 e margem 40% resultam em R$ 100,00", () => {
    const r = simular(entrada({ modo: "automatico", pai: produto({ id: "pai", tipo: "pai", custo: "60" }) }));
    expect(n(r.pai.precoFinal)).toBe("100.0000");
    expect(r.pai.origemMargem).toBe("Geral");
  });

  it("bloqueia a formação automática quando não há margem objetiva", () => {
    const r = simular(entrada({ modo: "automatico", margens: [], pai: produto({ id: "pai", tipo: "pai", custo: "60" }) }));
    expect(r.bloqueado).toBe(true);
    expect(r.pai.alertas.map((a) => a.codigo)).toContain("MARGEM_AUSENTE");
  });
});

describe("2/3. Preço manual do pai e margem do pai", () => {
  it("custo R$ 60,00 e preço R$ 90,00 resultam em margem 33,33% e −6,67 p.p.", () => {
    const r = simular(entrada({ precoPaiInformado: "90", pai: produto({ id: "pai", tipo: "pai", custo: "60" }) }));
    expect(n(r.pai.precoFinal)).toBe("90.0000");
    expect(dec(r.pai.margemAlcancada!).times(100).toFixed(2)).toBe("33.33");
    expect(dec(r.pai.diferencaMargem!).times(100).toFixed(2)).toBe("-6.67");
    expect(r.pai.status).toBe("abaixo_meta");
  });

  it("não altera o preço manual informado mesmo abaixo da meta", () => {
    const r = simular(entrada({ precoPaiInformado: "90.03", pai: produto({ id: "pai", tipo: "pai", custo: "60" }) }));
    expect(n(r.pai.precoFinal)).toBe("90.0300");
  });

  it("bloqueia preço manual igual ou inferior a zero", () => {
    const r = simular(entrada({ precoPaiInformado: "0" }));
    expect(r.bloqueado).toBe(true);
  });
});

describe("4-7. Filhos: cor, dimensão e combinação multiplicativa", () => {
  it("pai R$ 10,00, branca −10% e +2 incrementos de 5% resultam em R$ 9,90", () => {
    const filho = produto({ id: "f1", corId: "branca", corNome: "Branca", valorDimensao: "30" });
    const r = simular(entrada({ filhos: [filho] }));
    const f = r.filhos[0]!;
    expect(n(f.ajusteCor!.percentual)).toBe("-0.1000");
    expect(f.ajusteDimensional!.incrementos).toBe(2);
    expect(n(f.ajusteDimensional!.percentual)).toBe("0.1000");
    expect(n(f.precoBruto)).toBe("9.9000");
    expect(n(f.precoFinal)).toBe("9.9000");
  });

  it("calcula vários filhos individualmente", () => {
    const r = simular(
      entrada({
        filhos: [
          produto({ id: "a", valorDimensao: "10" }),
          produto({ id: "b", valorDimensao: "15" }),
          produto({ id: "c", valorDimensao: "25" }),
        ],
      }),
    );
    expect(r.filhos.map((f) => n(f.precoFinal))).toEqual(["9.0000", "9.5000", "10.5000"]);
  });

  it("modo composto: (1,05)^2 − 1 = 10,25%", () => {
    const filho = produto({ id: "f1", valorDimensao: "30" });
    const r = simular(entrada({ filhos: [filho], parametros: { ...PARAMS, modoDimensional: "composto" } }));
    expect(n(r.filhos[0]!.ajusteDimensional!.percentual)).toBe("0.1025");
  });

  it("usa a sequência comercial, não a diferença numérica entre medidas", () => {
    const seq: SequenciaDimensional[] = [
      { grupoDimensionalId: "g1", valorDimensao: "20", ordem: 1, ativo: true },
      { grupoDimensionalId: "g1", valorDimensao: "50", ordem: 2, ativo: true },
    ];
    const r = simular(entrada({ sequencias: seq, filhos: [produto({ id: "f", valorDimensao: "50" })] }));
    expect(r.filhos[0]!.ajusteDimensional!.incrementos).toBe(1);
  });

  it("dimensão ausente não aplica ajuste dimensional", () => {
    const r = simular(entrada({ filhos: [produto({ id: "f", valorDimensao: null })] }));
    expect(r.filhos[0]!.ajusteDimensional).toBeNull();
    expect(r.filhos[0]!.alertas.map((a) => a.codigo)).toContain("DIMENSAO_AUSENTE");
    expect(n(r.filhos[0]!.precoFinal)).toBe("10.0000");
  });

  it("régua ausente gera alerta sem inventar percentual", () => {
    const r = simular(entrada({ reguas: [REGUA_DIM], filhos: [produto({ id: "f", corId: "branca" })] }));
    expect(r.filhos[0]!.ajusteCor).toBeNull();
    expect(r.filhos[0]!.alertas.map((a) => a.codigo)).toContain("REGUA_COR_AUSENTE");
  });

  it("bloqueia filho em linha diferente do pai", () => {
    const r = simular(entrada({ filhos: [produto({ id: "f", linhaId: "outra" })] }));
    expect(r.filhos[0]!.status).toBe("bloqueado");
  });

  it("bloqueia filho sem custo", () => {
    const r = simular(entrada({ filhos: [produto({ id: "f", custo: null })] }));
    expect(r.filhos[0]!.status).toBe("bloqueado");
    expect(r.filhos[0]!.alertas.map((a) => a.codigo)).toContain("CUSTO_AUSENTE");
  });
});

describe("8. Arredondamento em R$ 0,10", () => {
  it.each([
    ["10.04", "10.00"],
    ["10.06", "10.10"],
    ["10.14", "10.10"],
    ["10.16", "10.20"],
    ["10.28", "10.30"],
  ])("%s → %s", (bruto, esperado) => {
    expect(arredondarDezCentavos(dec(bruto), "pendente").valor!.toFixed(2)).toBe(esperado);
  });

  it("meio exato sem critério definido fica pendente", () => {
    const r = arredondarDezCentavos(dec("10.05"), "pendente");
    expect(r.valor).toBeNull();
    expect(r.empate).toBe(true);
  });

  it("meio exato respeita o critério configurado", () => {
    expect(arredondarDezCentavos(dec("10.05"), "para_cima").valor!.toFixed(2)).toBe("10.10");
    expect(arredondarDezCentavos(dec("10.05"), "para_baixo").valor!.toFixed(2)).toBe("10.00");
    expect(arredondarDezCentavos(dec("10.05"), "par").valor!.toFixed(2)).toBe("10.00");
    expect(arredondarDezCentavos(dec("10.15"), "par").valor!.toFixed(2)).toBe("10.20");
  });

  it("a margem do filho usa o preço já arredondado", () => {
    // 10,00 × 1,0 × (1 + 0,05 × 1) × (1 − 0,04) = 10,08 → 10,10
    const reguaCor = { ...REGUA_COR, cores: [{ corId: "bege", percentual: "-0.04" }] };
    const r = simular(entrada({ reguas: [reguaCor, REGUA_DIM], filhos: [produto({ id: "f", valorDimensao: "25" })] }));
    expect(n(r.filhos[0]!.precoBruto)).toBe("10.0800");
    expect(n(r.filhos[0]!.precoFinal)).toBe("10.1000");
    expect(dec(r.filhos[0]!.margemAlcancada!).toFixed(6)).toBe(dec("4.1").div("10.1").toFixed(6));
  });
});

describe("9. Margem individual dos filhos", () => {
  it("custo R$ 6,00 e preço R$ 9,90 resultam em 39,39%", () => {
    const filho = produto({ id: "f1", corId: "branca", valorDimensao: "30", custo: "6" });
    const r = simular(entrada({ filhos: [filho] }));
    expect(dec(r.filhos[0]!.margemAlcancada!).times(100).toFixed(2)).toBe("39.39");
    expect(r.filhos[0]!.status).toBe("abaixo_meta");
  });
});

describe("10. Hierarquia das margens", () => {
  const margens: MargemRegra[] = [
    MARGEM_GERAL,
    { ...VIG, id: "m-fam", nivel: "familia", referenciaId: "fam1", percentual: "0.35" },
    { ...VIG, id: "m-lin", nivel: "linha", referenciaId: "lin1", percentual: "0.30" },
    { ...VIG, id: "m-prod", nivel: "produto", referenciaId: "f", percentual: "0.25" },
  ];

  it("produto > linha > família > geral", () => {
    const r = simular(
      entrada({
        margens,
        filhos: [produto({ id: "f" }), produto({ id: "g" })],
      }),
    );
    expect([r.filhos[0]!.origemMargem, n(r.filhos[0]!.margemObjetiva)]).toEqual(["Produto", "0.2500"]);
    expect([r.filhos[1]!.origemMargem, n(r.filhos[1]!.margemObjetiva)]).toEqual(["Linha", "0.3000"]);
    expect(r.pai.origemMargem).toBe("Linha");
  });

  it("ignora regra fora da vigência", () => {
    const expirada: MargemRegra = { ...margens[2]!, vigenciaFim: "2026-06-30" };
    const r = simular(entrada({ margens: [MARGEM_GERAL, expirada] }));
    expect(r.pai.origemMargem).toBe("Geral");
  });

  it("bloqueia quando há margens conflitantes no mesmo nível", () => {
    const r = simular(entrada({ margens: [MARGEM_GERAL, { ...MARGEM_GERAL, id: "m-geral-2" }] }));
    expect(r.pai.alertas.map((a) => a.codigo)).toContain("MARGEM_CONFLITANTE");
    expect(r.bloqueado).toBe(true);
  });
});

describe("11. Exceções sem dupla aplicação", () => {
  const excecao: Excecao = {
    ...VIG,
    id: "exc1",
    tipoAjuste: "cor",
    escopo: "produto",
    produtoId: "f",
    familiaId: null,
    linhaId: null,
    grupoDimensionalId: null,
    corId: "branca",
    percentual: "-0.05",
    prioridade: 0,
    substituiReguaId: null,
    substituiId: null,
  };

  it("exceção de −5% substitui a régua geral de −10% e a dimensão continua combinada", () => {
    const filho = produto({ id: "f", corId: "branca", valorDimensao: "30" });
    const r = simular(entrada({ excecoes: [excecao], filhos: [filho] }));
    const f = r.filhos[0]!;
    expect(n(f.ajusteCor!.percentual)).toBe("-0.0500");
    expect(f.ajusteCor!.fonte).toBe("excecao");
    expect(n(f.ajusteDimensional!.percentual)).toBe("0.1000");
    // 10 × 0,95 × 1,10 = 10,45 → empate exato, critério pendente
    expect(f.alertas.map((a) => a.codigo)).toContain("DESEMPATE_PENDENTE");
  });

  it("com desempate para cima: R$ 10,45 → R$ 10,50", () => {
    const filho = produto({ id: "f", corId: "branca", valorDimensao: "30" });
    const r = simular(
      entrada({ excecoes: [excecao], filhos: [filho], parametros: { ...PARAMS, desempate: "para_cima" } }),
    );
    expect(n(r.filhos[0]!.precoFinal)).toBe("10.5000");
  });

  it("exige resolução quando duas regras equivalentes empatam", () => {
    const duplicada = { ...REGUA_COR, id: "rc-geral-2", codigo: "COR-GERAL-2" };
    const r = simular(entrada({ reguas: [REGUA_COR, duplicada, REGUA_DIM], filhos: [produto({ id: "f" })] }));
    expect(r.filhos[0]!.status).toBe("bloqueado");
    expect(r.filhos[0]!.alertas.map((a) => a.codigo)).toContain("CONFLITO_COR");
  });

  it("régua substituída deixa de ser aplicada", () => {
    const nova = { ...REGUA_COR, id: "rc-nova", codigo: "COR-NOVA", substituiId: "rc-geral", cores: [{ corId: "branca", percentual: "-0.08" }] };
    const r = simular(entrada({ reguas: [REGUA_COR, nova, REGUA_DIM], filhos: [produto({ id: "f", corId: "branca" })] }));
    expect(n(r.filhos[0]!.ajusteCor!.percentual)).toBe("-0.0800");
  });
});

describe("12. Comparação com mercado", () => {
  it("preço R$ 9,90 e mercado R$ 11,00: −R$ 1,10 e −10%", () => {
    const filho = produto({ id: "f", corId: "branca", valorDimensao: "30", mercado: "11" });
    const r = simular(entrada({ filhos: [filho] }));
    const f = r.filhos[0]!;
    expect(n(f.diferencaMercadoReais)).toBe("-1.1000");
    expect(n(f.diferencaMercadoPct)).toBe("-0.1000");
    expect(f.posicaoMercado).toBe("abaixo");
  });

  it("mercado ausente torna a comparação indisponível", () => {
    const r = simular(entrada({ filhos: [produto({ id: "f" })] }));
    expect(r.filhos[0]!.posicaoMercado).toBe("indisponivel");
  });
});

describe("13. Ausência de correção automática", () => {
  it("filho abaixo da meta mantém o preço calculado pela régua", () => {
    const filho = produto({ id: "f", custo: "9" });
    const r = simular(entrada({ filhos: [filho] }));
    expect(n(r.filhos[0]!.precoFinal)).toBe("10.0000");
    expect(r.filhos[0]!.status).toBe("abaixo_meta");
  });
});

describe("14. Alterações manuais dos filhos", () => {
  it("preço manual recalcula margem e mercado sem afetar outros filhos", () => {
    const a = produto({ id: "a", mercado: "12" });
    const b = produto({ id: "b" });
    const r = simular(entrada({ filhos: [a, b], precosManuaisFilhos: { a: "12" } }));
    const [fa, fb] = r.filhos as [ItemResultado, ItemResultado];
    expect(n(fa.precoCalculado)).toBe("10.0000");
    expect(n(fa.precoManual)).toBe("12.0000");
    expect(n(fa.precoFinal)).toBe("12.0000");
    expect(dec(fa.margemAlcancada!).toFixed(4)).toBe("0.5000");
    expect(fa.posicaoMercado).toBe("igual");
    expect(n(fb.precoFinal)).toBe("10.0000");
    expect(fb.precoManual).toBeNull();
  });

  it("bloqueia preço manual de filho igual ou inferior a zero", () => {
    const r = simular(entrada({ filhos: [produto({ id: "a" })], precosManuaisFilhos: { a: "-1" } }));
    expect(r.filhos[0]!.status).toBe("bloqueado");
  });
});
