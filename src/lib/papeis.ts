export type Papel = "administrador" | "gestor_comercial" | "analista";

export const PAPEIS: Papel[] = ["administrador", "gestor_comercial", "analista"];

export const ROTULO_PAPEL: Record<Papel, string> = {
  administrador: "Administrador",
  gestor_comercial: "Gestor comercial",
  analista: "Analista",
};

export const DESCRICAO_PAPEL: Record<Papel, string> = {
  administrador: "Gerencia usuários, cadastros, margens, réguas e importações; consulta todas as simulações.",
  gestor_comercial: "Gerencia regras autorizadas, consulta simulações e acompanha resultados.",
  analista: "Consulta produtos, realiza simulações, importa bases autorizadas e exporta resultados.",
};
