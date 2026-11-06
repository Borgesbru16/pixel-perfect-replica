import { D, type Dec } from "./decimal";
import type { Desempate } from "./tipos";

export interface ResultadoArredondamento {
  /** null quando o valor está exatamente no meio e o critério de desempate ainda não foi definido */
  valor: Dec | null;
  empate: boolean;
}

const INCREMENTO = new D("0.10");

/**
 * Arredonda para o múltiplo de R$ 0,10 mais próximo.
 * Quando o valor fica exatamente no meio (ex.: 10,05), aplica o critério de desempate configurado.
 */
export function arredondarDezCentavos(valor: Dec, desempate: Desempate): ResultadoArredondamento {
  const unidades = valor.div(INCREMENTO);
  const piso = unidades.floor();
  const teto = unidades.ceil();
  const resto = unidades.minus(piso);
  const meio = new D("0.5");

  if (resto.isZero()) return { valor: piso.times(INCREMENTO), empate: false };

  if (resto.eq(meio)) {
    switch (desempate) {
      case "pendente":
        return { valor: null, empate: true };
      case "para_cima":
        return { valor: teto.times(INCREMENTO), empate: true };
      case "para_baixo":
        return { valor: piso.times(INCREMENTO), empate: true };
      case "par": {
        const escolhido = piso.mod(2).isZero() ? piso : teto;
        return { valor: escolhido.times(INCREMENTO), empate: true };
      }
    }
  }

  return { valor: (resto.lt(meio) ? piso : teto).times(INCREMENTO), empate: false };
}
