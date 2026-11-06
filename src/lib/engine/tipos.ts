/**
 * Tipos do motor de cálculo de preços.
 *
 * Valores financeiros e percentuais trafegam como strings decimais
 * (ex.: "60.00", "0.40") para nunca passarem por ponto flutuante.
 * Percentuais são sempre frações: 0.40 = 40%.
 */

export type Escopo = "geral" | "familia" | "linha" | "grupo_dimensional" | "produto";
export type NivelMargem = "produto" | "linha" | "familia" | "geral";
export type TipoCodigo = "pai" | "filho";
export type ModoFormacao = "automatico" | "manual";

export interface ProdutoMotor {
  id: string;
  codigo: string;
  descricao: string;
  tipo: TipoCodigo;
  familiaId: string;
  familiaNome?: string | null;
  linhaId: string;
  linhaNome?: string | null;
  corId: string | null;
  corNome?: string | null;
  grupoDimensionalId: string | null;
  valorDimensao: string | null;
  unidade?: string | null;
  ordemDimensional: number | null;
  custo: string | null;
  mercado: string | null;
}

export interface Vigencia {
  ativo: boolean;
  /** Data ISO (AAAA-MM-DD) */
  vigenciaInicio: string;
  vigenciaFim: string | null;
}

export interface MargemRegra extends Vigencia {
  id: string;
  nivel: NivelMargem;
  /** id do produto, linha ou família conforme o nível; null para "geral" */
  referenciaId: string | null;
  percentual: string;
}

export interface Regua extends Vigencia {
  id: string;
  codigo: string;
  nome: string;
  tipo: "cor" | "dimensional" | "familia";
  escopo: Exclude<Escopo, "produto">;
  familiaId: string | null;
  linhaId: string | null;
  grupoDimensionalId: string | null;
  prioridade: number;
  /** Usado pelas réguas de família */
  percentual: string | null;
  substituiId: string | null;
  /** Percentuais por cor (réguas de cor) */
  cores: { corId: string; percentual: string }[];
  /** Taxas por incremento (réguas dimensionais) */
  taxas: { grupoDimensionalId: string; taxa: string }[];
}

export interface Excecao extends Vigencia {
  id: string;
  tipoAjuste: "cor" | "dimensional" | "familia";
  escopo: Escopo;
  produtoId: string | null;
  familiaId: string | null;
  linhaId: string | null;
  grupoDimensionalId: string | null;
  corId: string | null;
  percentual: string;
  prioridade: number;
  substituiReguaId: string | null;
  substituiId: string | null;
  motivo?: string | null;
}

export interface SequenciaDimensional {
  grupoDimensionalId: string;
  valorDimensao: string;
  ordem: number;
  ativo: boolean;
}

export type Desempate = "pendente" | "para_cima" | "para_baixo" | "par";

export interface ParametrosMotor {
  modoDimensional: "linear" | "composto";
  fontePosicaoDimensional: "sequencia_grupo" | "ordem_produto";
  referenciaCor: "absoluta" | "relativa_ao_pai";
  aplicacaoAjusteFamilia: "nao_aplicar" | "filhos" | "pai_e_filhos";
  arredondarPaiAutomatico: boolean;
  desempate: Desempate;
  ordemEspecificidade: Escopo[];
}

export interface EntradaSimulacao {
  dataReferencia: string;
  modo: ModoFormacao;
  precoPaiInformado?: string | null;
  pai: ProdutoMotor;
  filhos: ProdutoMotor[];
  margens: MargemRegra[];
  reguas: Regua[];
  excecoes: Excecao[];
  sequencias: SequenciaDimensional[];
  parametros: ParametrosMotor;
  /** Preços manuais de filhos, por id do produto (somente na simulação) */
  precosManuaisFilhos?: Record<string, string>;
}

export type Severidade = "bloqueio" | "alerta" | "info";

export interface Alerta {
  codigo: string;
  severidade: Severidade;
  mensagem: string;
}

export interface AjusteAplicado {
  percentual: string;
  origem: string;
  regraId: string | null;
  fonte: "regua" | "excecao" | null;
}

export interface AjusteDimensionalAplicado extends AjusteAplicado {
  incrementos: number;
  taxa: string | null;
}

export type StatusItem = "bloqueado" | "abaixo_meta" | "dentro_meta" | "sem_meta";
export type PosicaoMercado = "acima" | "abaixo" | "igual" | "indisponivel";

export interface ItemResultado {
  produtoId: string;
  codigo: string;
  descricao: string;
  tipo: TipoCodigo;
  familia: string | null;
  linha: string | null;
  cor: string | null;
  dimensao: string | null;
  custo: string | null;
  mercado: string | null;
  ajusteCor: AjusteAplicado | null;
  ajusteDimensional: AjusteDimensionalAplicado | null;
  ajusteFamilia: AjusteAplicado | null;
  margemObjetiva: string | null;
  origemMargem: string | null;
  margemRegraId: string | null;
  precoBruto: string | null;
  precoCalculado: string | null;
  precoManual: string | null;
  precoFinal: string | null;
  margemAlcancada: string | null;
  /** Diferença em fração (multiplique por 100 para pontos percentuais) */
  diferencaMargem: string | null;
  diferencaMercadoReais: string | null;
  diferencaMercadoPct: string | null;
  posicaoMercado: PosicaoMercado;
  status: StatusItem;
  alertas: Alerta[];
  memoria: string[];
  regrasAplicadas: { tipo: string; id: string }[];
}

export interface ResultadoSimulacao {
  versaoMotor: string;
  dataReferencia: string;
  modo: ModoFormacao;
  parametros: ParametrosMotor;
  pai: ItemResultado;
  filhos: ItemResultado[];
  bloqueado: boolean;
}
