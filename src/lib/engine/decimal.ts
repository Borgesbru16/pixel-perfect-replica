import Decimal from "decimal.js";

/** Instância isolada do Decimal para o motor: precisão alta, sem notação exponencial. */
export const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP, toExpNeg: -30, toExpPos: 40 });
export type Dec = InstanceType<typeof D>;

export function dec(valor: string | number | Dec): Dec {
  return new D(valor);
}

export function decOuNulo(valor: string | null | undefined): Dec | null {
  if (valor === null || valor === undefined || String(valor).trim() === "") return null;
  try {
    return new D(valor);
  } catch {
    return null;
  }
}

/** Formata um valor em reais no padrão brasileiro (somente para memória de cálculo e alertas). */
export function formatarReais(valor: Dec, casas = 2): string {
  const fixo = valor.toFixed(casas);
  const negativo = fixo.startsWith("-");
  const [inteiro, frac] = (negativo ? fixo.slice(1) : fixo).split(".");
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negativo ? "−" : ""}R$ ${milhar}${frac ? "," + frac : ""}`;
}

/** Formata uma fração como percentual brasileiro (0.4 → "40,00%"). */
export function formatarPct(fracao: Dec, casas = 2): string {
  const v = fracao.times(100).toFixed(casas);
  return `${v.replace("-", "−").replace(".", ",")}%`;
}

export function formatarNumero(valor: Dec, casas = 4): string {
  return valor.toFixed(casas).replace("-", "−").replace(".", ",");
}
