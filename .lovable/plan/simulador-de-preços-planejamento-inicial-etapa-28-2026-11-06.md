# Simulador de Preços — Planejamento inicial (etapa 28)

Análise completa do documento mestre v1.1. Nada será construído antes da sua aprovação.

## 1. Arquitetura técnica recomendada

```text
Navegador (telas, filtros, tabelas, leitura do Excel)
        |
        v
Funções de servidor (validação, permissões, orquestração)
        |
        v
Motor de cálculo (módulo isolado, sem tela, testado)
        |
        v
Lovable Cloud (banco, login, permissões por linha, arquivos)
```

- **Lovable Cloud** para banco de dados, login individual e permissões aplicadas no próprio banco.
- **Motor de cálculo** como módulo independente da interface, com aritmética decimal exata (nunca ponto flutuante), executado somente no servidor. A tela apenas exibe resultados.
- **Testes automatizados** do motor cobrindo os 17 critérios de aceite, cada um com entrada e resultado esperado.
- **Pontos pendentes** (seção 26) viram parâmetros configuráveis em uma tabela de configurações, nunca valores fixos no código.

## 2. Estrutura do banco de dados

Cadastros auxiliares
- `familias` — código, nome, descrição, status
- `linhas` — código, nome, família, status
- `cores` — nome, status
- `tipos_dimensao` — nome, unidade, descrição, status
- `grupos_dimensionais` — nome, tipo de dimensão, escopo (geral/família/grupo), status
- `regras_dimensionais` — sequência comercial: grupo, valor da dimensão, ordem

Produtos
- `produtos` — código único, descrição, tipo (pai/filho), família, linha, cor, tipo/valor/unidade de dimensão, grupo dimensional, ordem dimensional, custo completo, preço de mercado, status
- `hierarquia_produtos` — pai, filho (filho único: um nível)
- `historico_custos_mercado` — cada alteração de custo/mercado com data, usuário e origem (manual/importação)
- `historico_hierarquia` — vínculos criados/removidos

Regras comerciais (todas com vigência inicial/final, status, prioridade e "regra substituída")
- `margens` — nível (produto/linha/família/geral), referência, percentual
- `reguas` — nome, tipo (cor/dimensional/família), escopo (geral/família/grupo)
- `regras_regua` — percentual por cor dentro de uma régua de cores
- `reguas_dimensionais` — taxa por incremento por grupo dimensional
- `excecoes` — tipo de ajuste (cor/dimensão/família/margem), produto ou escopo, percentual
- `configuracoes` — parâmetros pendentes (modo dimensional, desempate, combinação da família)

Simulações e auditoria
- `simulacoes` — pai, modo, preço do pai, usuário, data, versão do motor, parâmetros usados
- `itens_simulacao` — todos os campos da tabela de resultado + preço original, preço manual, memória de cálculo
- `snapshot_regras` — cópia integral de cada margem, régua, exceção e parâmetro usado
- `importacoes` — arquivo, tipo, usuário, data, contadores e rejeições
- `perfis` e `papeis_usuarios` — Administrador, Gestor comercial, Analista
- `log_auditoria` — alterações de cadastros e regras

Valores financeiros e percentuais em tipo decimal (`numeric`), percentuais guardados como fração (0,40 = 40%).

## 3. Relacionamentos principais

```text
familias 1─N linhas 1─N produtos N─1 cores
grupos_dimensionais 1─N regras_dimensionais (sequência)
produtos(pai) 1─N hierarquia_produtos N─1 produtos(filho)
reguas 1─N regras_regua / reguas_dimensionais
simulacoes 1─N itens_simulacao ; simulacoes 1─N snapshot_regras
```

Garantias no banco: código único; filho com exatamente um pai; pai ≠ filho; pai do tipo "pai"; pai e filho na mesma linha (bloqueio na gravação); vigências sem sobreposição para o mesmo escopo e prioridade, ou marcadas como conflito.

## 4. Organização do backend

Motor de cálculo (ordem da seção 22)
1. Carregar pai → resolver margem (produto > linha > família > geral, dentro da vigência) com origem
2. Validar custo/margem/preço manual → calcular ou receber preço do pai
3. Carregar filhos → validar hierarquia e linha
4. Selecionar réguas vigentes → exceção substitui apenas a regra equivalente
5. Ajuste de cor e ajuste dimensional (posição pela sequência cadastrada) → combinar multiplicativamente
6. Ajuste de família apenas se cadastrado e com forma de aplicação definida
7. Preço bruto → arredondar R$ 0,10 → margem individual → comparar meta e mercado → alertas
8. Gerar memória de cálculo por item

Funções de servidor
- Simulação: calcular, aplicar preço manual de filho, salvar com snapshot, reproduzir simulação salva (somente snapshot)
- Cadastros: criar/editar com validação e auditoria
- Importação: validar e pré-visualizar, confirmar gravação
- Dashboard: indicadores com filtros e permissões
- Exportação Excel

## 5. Módulos e telas (menu lateral)

1. **Dashboard** — totais, últimas atualizações, abaixo da meta, acima/abaixo do mercado
2. **Simulação de preços** — busca do pai, configuração (modo automático/manual), tabela de resultado com filtros, ordenação, edição manual de filhos, memória de cálculo, exportar, salvar
3. **Base de produtos** — lista com busca por código/descrição, filtros, edição
4. **Hierarquia de produtos** — vínculos pai/filho e histórico
5. **Réguas comerciais** — abas: cores, dimensional, família, exceções, sequências dimensionais
6. **Margens objetivas** — por nível, vigências, histórico
7. **Histórico de simulações** — consulta e reprodução fiel
8. **Importação de bases** — assistente em 7 passos (upload → confirmação)
9. **Usuários e configurações** — perfis e parâmetros pendentes

Visual corporativo e sóbrio, foco em tabelas legíveis, indicadores coloridos de status e boa leitura em telas menores.

## 6. Pontos de atenção e riscos técnicos

- **Precisão**: JavaScript erra com decimais; todo o motor usará biblioteca decimal e o banco `numeric`.
- **Desempate do arredondamento**: R$ 10,05 vira 10,00 ou 10,10? Sem definição, fica parametrizado.
- **Dupla aplicação**: exceções e réguas de família precisam de regras claras de substituição; o motor registrará qual regra venceu e por quê.
- **Vigências conflitantes**: duas regras do mesmo escopo ativas no mesmo período bloqueiam o cálculo até resolução.
- **Fidelidade dos snapshots**: reprodução usa somente dados gravados, inclusive a versão do motor.
- **Importação**: arquivos grandes podem exceder limites do servidor; leitura da planilha no navegador e validação em lotes no servidor.
- **Permissões**: aplicadas no banco, não apenas escondendo botões.
- **Volume**: pais com muitos filhos exigem cálculo em lote eficiente.

## 7. Dúvidas comerciais que precisam de confirmação

1. **Taxa dimensional**: linear (5% × 2 = +10%) ou composta (1,05² = +10,25%)?
2. **Sequência dimensional**: vem do campo "ordem dimensional" do produto ou de uma sequência cadastrada por grupo? E se pai e filho estiverem em grupos diferentes?
3. **Cor do pai**: o ajuste de cor do filho é absoluto ou relativo à cor do pai? Ex.: pai Branco (-10%) e filho Branco — aplica -10% de novo ou 0%?
4. **Ajuste de família**: aplica-se ao pai, aos filhos ou a ambos? Multiplica junto com cor e dimensão?
5. **Arredondamento do pai**: o preço automático do pai também é arredondado para R$ 0,10? E o preço manual?
6. **Desempate**: valores exatamente no meio (ex.: R$ 10,05) sobem ou descem?
7. **Margem objetiva dos filhos**: cada filho resolve a própria margem (produto > linha > família > geral) ou herda a do pai?
8. **Margem padrão geral**: existe um valor definido hoje? (Não será inventado.)
9. **Mercado interno**: unidade, moeda, com ou sem impostos, e data de referência.
10. **Planilha**: pode enviar um exemplo real (produtos, custos, mercado, hierarquia)?
11. **Salvamento**: toda simulação é gravada ou só quando o usuário clica em "Salvar"?
12. **Perfis**: o Gestor comercial pode alterar margens e réguas ou apenas "regras autorizadas" (quais)?

## Proposta de execução após aprovação

- **Etapa A**: estrutura visual (menu, layout, dashboard e telas vazias) + ativação do Lovable Cloud, banco, login e perfis.
- **Etapa B**: motor de cálculo isolado com testes dos critérios de aceite, usando parâmetros configuráveis para os pontos pendentes.
- **Etapas seguintes**: cadastros → regras comerciais → tela de simulação → importação → histórico/exportação → homologação.

Cada etapa será entregue e validada antes da próxima.
