export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      configuracoes: {
        Row: {
          chave: string
          descricao: string
          opcoes: Json
          status: string
          updated_at: string
          updated_by: string | null
          valor: Json
        }
        Insert: {
          chave: string
          descricao: string
          opcoes?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor: Json
        }
        Update: {
          chave?: string
          descricao?: string
          opcoes?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
          valor?: Json
        }
        Relationships: []
      }
      cores: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      excecoes: {
        Row: {
          ativo: boolean
          cor_id: string | null
          created_at: string
          created_by: string | null
          escopo: Database["public"]["Enums"]["escopo_regra"]
          familia_id: string | null
          grupo_dimensional_id: string | null
          id: string
          linha_id: string | null
          motivo: string | null
          percentual: number
          prioridade: number
          produto_id: string | null
          substitui_id: string | null
          substitui_regua_id: string | null
          tipo_ajuste: string
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          ativo?: boolean
          cor_id?: string | null
          created_at?: string
          created_by?: string | null
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          grupo_dimensional_id?: string | null
          id?: string
          linha_id?: string | null
          motivo?: string | null
          percentual: number
          prioridade?: number
          produto_id?: string | null
          substitui_id?: string | null
          substitui_regua_id?: string | null
          tipo_ajuste: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          ativo?: boolean
          cor_id?: string | null
          created_at?: string
          created_by?: string | null
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          grupo_dimensional_id?: string | null
          id?: string
          linha_id?: string | null
          motivo?: string | null
          percentual?: number
          prioridade?: number
          produto_id?: string | null
          substitui_id?: string | null
          substitui_regua_id?: string | null
          tipo_ajuste?: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "excecoes_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "cores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_grupo_dimensional_id_fkey"
            columns: ["grupo_dimensional_id"]
            isOneToOne: false
            referencedRelation: "grupos_dimensionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_linha_id_fkey"
            columns: ["linha_id"]
            isOneToOne: false
            referencedRelation: "linhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_substitui_id_fkey"
            columns: ["substitui_id"]
            isOneToOne: false
            referencedRelation: "excecoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excecoes_substitui_regua_id_fkey"
            columns: ["substitui_regua_id"]
            isOneToOne: false
            referencedRelation: "reguas"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      grupos_dimensionais: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          escopo: Database["public"]["Enums"]["escopo_regra"]
          familia_id: string | null
          id: string
          nome: string
          tipo_dimensao_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          id?: string
          nome: string
          tipo_dimensao_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          id?: string
          nome?: string
          tipo_dimensao_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_dimensionais_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_dimensionais_tipo_dimensao_id_fkey"
            columns: ["tipo_dimensao_id"]
            isOneToOne: false
            referencedRelation: "tipos_dimensao"
            referencedColumns: ["id"]
          },
        ]
      }
      hierarquia_produtos: {
        Row: {
          created_at: string
          created_by: string | null
          filho_id: string
          id: string
          pai_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          filho_id: string
          id?: string
          pai_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          filho_id?: string
          id?: string
          pai_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hierarquia_produtos_filho_id_fkey"
            columns: ["filho_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hierarquia_produtos_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_custos_mercado: {
        Row: {
          campo: string
          created_at: string
          id: number
          importacao_id: string | null
          origem: string
          produto_id: string
          usuario_id: string | null
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          campo: string
          created_at?: string
          id?: never
          importacao_id?: string | null
          origem?: string
          produto_id: string
          usuario_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          campo?: string
          created_at?: string
          id?: never
          importacao_id?: string | null
          origem?: string
          produto_id?: string
          usuario_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_custos_mercado_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_hierarquia: {
        Row: {
          acao: string
          created_at: string
          filho_id: string
          id: number
          pai_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          filho_id: string
          id?: never
          pai_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          filho_id?: string
          id?: never
          pai_id?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      importacoes: {
        Row: {
          arquivo_nome: string
          concluida_em: string | null
          created_at: string
          id: string
          mapeamento: Json | null
          rejeicoes: Json
          status: string
          tipo: string
          total_atualizados: number
          total_novos: number
          total_rejeitados: number
          usuario_id: string
        }
        Insert: {
          arquivo_nome: string
          concluida_em?: string | null
          created_at?: string
          id?: string
          mapeamento?: Json | null
          rejeicoes?: Json
          status?: string
          tipo: string
          total_atualizados?: number
          total_novos?: number
          total_rejeitados?: number
          usuario_id?: string
        }
        Update: {
          arquivo_nome?: string
          concluida_em?: string | null
          created_at?: string
          id?: string
          mapeamento?: Json | null
          rejeicoes?: Json
          status?: string
          tipo?: string
          total_atualizados?: number
          total_novos?: number
          total_rejeitados?: number
          usuario_id?: string
        }
        Relationships: []
      }
      itens_simulacao: {
        Row: {
          ajuste_cor: number | null
          ajuste_dimensional: number | null
          ajuste_familia: number | null
          alertas: Json
          codigo: string
          cor: string | null
          custo_completo: number | null
          descricao: string
          diferenca_margem_pp: number | null
          diferenca_mercado_pct: number | null
          diferenca_mercado_reais: number | null
          dimensao: string | null
          familia: string | null
          id: string
          linha: string | null
          margem_alcancada: number | null
          margem_objetiva: number | null
          memoria_calculo: Json
          ordem: number
          origem_margem: string | null
          preco_bruto: number | null
          preco_calculado: number | null
          preco_final: number | null
          preco_manual: number | null
          preco_mercado: number | null
          produto_id: string | null
          simulacao_id: string
          status: string
          tipo_codigo: Database["public"]["Enums"]["tipo_codigo"]
        }
        Insert: {
          ajuste_cor?: number | null
          ajuste_dimensional?: number | null
          ajuste_familia?: number | null
          alertas?: Json
          codigo: string
          cor?: string | null
          custo_completo?: number | null
          descricao: string
          diferenca_margem_pp?: number | null
          diferenca_mercado_pct?: number | null
          diferenca_mercado_reais?: number | null
          dimensao?: string | null
          familia?: string | null
          id?: string
          linha?: string | null
          margem_alcancada?: number | null
          margem_objetiva?: number | null
          memoria_calculo?: Json
          ordem?: number
          origem_margem?: string | null
          preco_bruto?: number | null
          preco_calculado?: number | null
          preco_final?: number | null
          preco_manual?: number | null
          preco_mercado?: number | null
          produto_id?: string | null
          simulacao_id: string
          status: string
          tipo_codigo: Database["public"]["Enums"]["tipo_codigo"]
        }
        Update: {
          ajuste_cor?: number | null
          ajuste_dimensional?: number | null
          ajuste_familia?: number | null
          alertas?: Json
          codigo?: string
          cor?: string | null
          custo_completo?: number | null
          descricao?: string
          diferenca_margem_pp?: number | null
          diferenca_mercado_pct?: number | null
          diferenca_mercado_reais?: number | null
          dimensao?: string | null
          familia?: string | null
          id?: string
          linha?: string | null
          margem_alcancada?: number | null
          margem_objetiva?: number | null
          memoria_calculo?: Json
          ordem?: number
          origem_margem?: string | null
          preco_bruto?: number | null
          preco_calculado?: number | null
          preco_final?: number | null
          preco_manual?: number | null
          preco_mercado?: number | null
          produto_id?: string | null
          simulacao_id?: string
          status?: string
          tipo_codigo?: Database["public"]["Enums"]["tipo_codigo"]
        }
        Relationships: [
          {
            foreignKeyName: "itens_simulacao_simulacao_id_fkey"
            columns: ["simulacao_id"]
            isOneToOne: false
            referencedRelation: "simulacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      linhas: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          familia_id: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          familia_id: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          familia_id?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linhas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
        ]
      }
      log_auditoria: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: number
          registro_id: string | null
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: never
          registro_id?: string | null
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: never
          registro_id?: string | null
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      margens: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          familia_id: string | null
          id: string
          linha_id: string | null
          nivel: Database["public"]["Enums"]["nivel_margem"]
          observacao: string | null
          percentual: number
          produto_id: string | null
          substitui_id: string | null
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          familia_id?: string | null
          id?: string
          linha_id?: string | null
          nivel: Database["public"]["Enums"]["nivel_margem"]
          observacao?: string | null
          percentual: number
          produto_id?: string | null
          substitui_id?: string | null
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          familia_id?: string | null
          id?: string
          linha_id?: string | null
          nivel?: Database["public"]["Enums"]["nivel_margem"]
          observacao?: string | null
          percentual?: number
          produto_id?: string | null
          substitui_id?: string | null
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "margens_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "margens_linha_id_fkey"
            columns: ["linha_id"]
            isOneToOne: false
            referencedRelation: "linhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "margens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "margens_substitui_id_fkey"
            columns: ["substitui_id"]
            isOneToOne: false
            referencedRelation: "margens"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          codigo: string
          cor_id: string | null
          created_at: string
          custo_atualizado_em: string | null
          custo_completo: number | null
          descricao: string
          familia_id: string
          grupo_dimensional_id: string | null
          id: string
          linha_id: string
          mercado_atualizado_em: string | null
          ordem_dimensional: number | null
          preco_mercado: number | null
          tipo_codigo: Database["public"]["Enums"]["tipo_codigo"]
          tipo_dimensao_id: string | null
          unidade: string | null
          updated_at: string
          valor_dimensao: number | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          cor_id?: string | null
          created_at?: string
          custo_atualizado_em?: string | null
          custo_completo?: number | null
          descricao: string
          familia_id: string
          grupo_dimensional_id?: string | null
          id?: string
          linha_id: string
          mercado_atualizado_em?: string | null
          ordem_dimensional?: number | null
          preco_mercado?: number | null
          tipo_codigo: Database["public"]["Enums"]["tipo_codigo"]
          tipo_dimensao_id?: string | null
          unidade?: string | null
          updated_at?: string
          valor_dimensao?: number | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          cor_id?: string | null
          created_at?: string
          custo_atualizado_em?: string | null
          custo_completo?: number | null
          descricao?: string
          familia_id?: string
          grupo_dimensional_id?: string | null
          id?: string
          linha_id?: string
          mercado_atualizado_em?: string | null
          ordem_dimensional?: number | null
          preco_mercado?: number | null
          tipo_codigo?: Database["public"]["Enums"]["tipo_codigo"]
          tipo_dimensao_id?: string | null
          unidade?: string | null
          updated_at?: string
          valor_dimensao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "cores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_grupo_dimensional_id_fkey"
            columns: ["grupo_dimensional_id"]
            isOneToOne: false
            referencedRelation: "grupos_dimensionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_linha_id_fkey"
            columns: ["linha_id"]
            isOneToOne: false
            referencedRelation: "linhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_tipo_dimensao_id_fkey"
            columns: ["tipo_dimensao_id"]
            isOneToOne: false
            referencedRelation: "tipos_dimensao"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regras_dimensionais: {
        Row: {
          ativo: boolean
          created_at: string
          grupo_dimensional_id: string
          id: string
          ordem: number
          updated_at: string
          valor_dimensao: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          grupo_dimensional_id: string
          id?: string
          ordem: number
          updated_at?: string
          valor_dimensao: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          grupo_dimensional_id?: string
          id?: string
          ordem?: number
          updated_at?: string
          valor_dimensao?: number
        }
        Relationships: [
          {
            foreignKeyName: "regras_dimensionais_grupo_dimensional_id_fkey"
            columns: ["grupo_dimensional_id"]
            isOneToOne: false
            referencedRelation: "grupos_dimensionais"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_regua: {
        Row: {
          cor_id: string
          created_at: string
          id: string
          percentual: number
          regua_id: string
          updated_at: string
        }
        Insert: {
          cor_id: string
          created_at?: string
          id?: string
          percentual: number
          regua_id: string
          updated_at?: string
        }
        Update: {
          cor_id?: string
          created_at?: string
          id?: string
          percentual?: number
          regua_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regras_regua_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "cores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_regua_regua_id_fkey"
            columns: ["regua_id"]
            isOneToOne: false
            referencedRelation: "reguas"
            referencedColumns: ["id"]
          },
        ]
      }
      reguas: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string | null
          escopo: Database["public"]["Enums"]["escopo_regra"]
          familia_id: string | null
          grupo_dimensional_id: string | null
          id: string
          linha_id: string | null
          nome: string
          percentual: number | null
          prioridade: number
          substitui_id: string | null
          tipo: Database["public"]["Enums"]["tipo_regua"]
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          grupo_dimensional_id?: string | null
          id?: string
          linha_id?: string | null
          nome: string
          percentual?: number | null
          prioridade?: number
          substitui_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_regua"]
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          escopo?: Database["public"]["Enums"]["escopo_regra"]
          familia_id?: string | null
          grupo_dimensional_id?: string | null
          id?: string
          linha_id?: string | null
          nome?: string
          percentual?: number | null
          prioridade?: number
          substitui_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_regua"]
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "reguas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reguas_grupo_dimensional_id_fkey"
            columns: ["grupo_dimensional_id"]
            isOneToOne: false
            referencedRelation: "grupos_dimensionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reguas_linha_id_fkey"
            columns: ["linha_id"]
            isOneToOne: false
            referencedRelation: "linhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reguas_substitui_id_fkey"
            columns: ["substitui_id"]
            isOneToOne: false
            referencedRelation: "reguas"
            referencedColumns: ["id"]
          },
        ]
      }
      reguas_dimensionais: {
        Row: {
          created_at: string
          grupo_dimensional_id: string
          id: string
          regua_id: string
          taxa_por_incremento: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          grupo_dimensional_id: string
          id?: string
          regua_id: string
          taxa_por_incremento: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          grupo_dimensional_id?: string
          id?: string
          regua_id?: string
          taxa_por_incremento?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reguas_dimensionais_grupo_dimensional_id_fkey"
            columns: ["grupo_dimensional_id"]
            isOneToOne: false
            referencedRelation: "grupos_dimensionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reguas_dimensionais_regua_id_fkey"
            columns: ["regua_id"]
            isOneToOne: false
            referencedRelation: "reguas"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          codigo_pai: string
          created_at: string
          data_referencia: string
          descricao_pai: string
          id: string
          margem_objetiva_pai: number | null
          modo: Database["public"]["Enums"]["modo_formacao"]
          numero: number
          observacao: string | null
          origem_margem_pai: string | null
          parametros: Json
          preco_pai: number | null
          preco_pai_informado: number | null
          produto_pai_id: string | null
          resumo: Json
          usuario_id: string
          versao_motor: string
        }
        Insert: {
          codigo_pai: string
          created_at?: string
          data_referencia: string
          descricao_pai: string
          id?: string
          margem_objetiva_pai?: number | null
          modo: Database["public"]["Enums"]["modo_formacao"]
          numero?: never
          observacao?: string | null
          origem_margem_pai?: string | null
          parametros?: Json
          preco_pai?: number | null
          preco_pai_informado?: number | null
          produto_pai_id?: string | null
          resumo?: Json
          usuario_id?: string
          versao_motor: string
        }
        Update: {
          codigo_pai?: string
          created_at?: string
          data_referencia?: string
          descricao_pai?: string
          id?: string
          margem_objetiva_pai?: number | null
          modo?: Database["public"]["Enums"]["modo_formacao"]
          numero?: never
          observacao?: string | null
          origem_margem_pai?: string | null
          parametros?: Json
          preco_pai?: number | null
          preco_pai_informado?: number | null
          produto_pai_id?: string | null
          resumo?: Json
          usuario_id?: string
          versao_motor?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshot_regras: {
        Row: {
          dados: Json
          id: string
          regra_id: string | null
          simulacao_id: string
          tipo: string
        }
        Insert: {
          dados: Json
          id?: string
          regra_id?: string | null
          simulacao_id: string
          tipo: string
        }
        Update: {
          dados?: Json
          id?: string
          regra_id?: string | null
          simulacao_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "snapshot_regras_simulacao_id_fkey"
            columns: ["simulacao_id"]
            isOneToOne: false
            referencedRelation: "simulacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_dimensao: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          unidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          unidade: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pode_gerenciar_regras: { Args: { _user_id: string }; Returns: boolean }
      tem_acesso: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "administrador" | "gestor_comercial" | "analista"
      escopo_regra:
        | "geral"
        | "familia"
        | "linha"
        | "grupo_dimensional"
        | "produto"
      modo_formacao: "automatico" | "manual"
      nivel_margem: "produto" | "linha" | "familia" | "geral"
      tipo_codigo: "pai" | "filho"
      tipo_regua: "cor" | "dimensional" | "familia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "gestor_comercial", "analista"],
      escopo_regra: [
        "geral",
        "familia",
        "linha",
        "grupo_dimensional",
        "produto",
      ],
      modo_formacao: ["automatico", "manual"],
      nivel_margem: ["produto", "linha", "familia", "geral"],
      tipo_codigo: ["pai", "filho"],
      tipo_regua: ["cor", "dimensional", "familia"],
    },
  },
} as const
