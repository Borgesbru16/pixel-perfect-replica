PROJETO: SIMULADOR DE PREÇOS
Documento mestre de requisitos funcionais e técnicos para desenvolvimento no Lovable
Versão: 1.1
Idioma: Português brasileiro
Tipo: Aplicativo web corporativo
Objetivo: Formação, simulação e análise de preços de produtos.
________________________________________
1. INSTRUÇÃO PRINCIPAL AO LOVABLE
Desenvolva um aplicativo web completo para simulação de preços, seguindo rigorosamente os requisitos deste documento.
O aplicativo deverá ser desenvolvido com arquitetura organizada, banco de dados estruturado, motor de cálculo independente da interface e possibilidade de evolução futura.
Regras obrigatórias de desenvolvimento:
1.	Não inventar regras comerciais.
2.	Não utilizar percentuais ilustrativos como valores definitivos.
3.	Não deixar cálculos importantes somente no frontend.
4.	Não alterar automaticamente preços para corrigir margens.
5.	Não aplicar duas vezes uma mesma regra comercial.
6.	Não perder o histórico de custos, preços ou regras.
7.	Não recalcular simulações antigas com dados atualizados.
8.	Não avançar para outra etapa sem validar a anterior.
9.	Utilizar dados financeiros com precisão decimal.
10.	Manter a aplicação preparada para receber novas regras comerciais.
Antes de desenvolver, analisar este documento, propor a arquitetura e identificar eventuais dúvidas. Não iniciar a implementação de todos os módulos de uma só vez.
2. OBJETIVO DO APLICATIVO
Criar um simulador de preços que permita:
•	Cadastrar e atualizar produtos.
•	Relacionar códigos pais e filhos.
•	Trabalhar com produtos de diferentes cores.
•	Trabalhar com diferentes bitolas e diâmetros.
•	Calcular preços automaticamente a partir do custo e da margem.
•	Permitir informar manualmente o preço do código pai.
•	Replicar os preços para os filhos conforme as réguas comerciais.
•	Calcular a margem individual de cada produto.
•	Comparar os preços simulados com o mercado interno.
•	Identificar produtos abaixo da margem objetiva.
•	Identificar divergências nas réguas.
•	Importar bases por Excel.
•	Salvar e consultar simulações anteriores.
•	Reproduzir simulações utilizando exatamente os dados e regras originais.
3. PREMISSAS COMERCIAIS DEFINIDAS
Estas regras estão confirmadas e deverão ser implementadas:
Assunto	Definição
Margem	Calculada sobre o preço de venda
Custo	Custo completo
Código pai	Formação automática ou manual
Código filho	Preço derivado do pai
Linha	Pai e filhos sempre pertencem à mesma linha
Cor	Possui régua percentual própria
Dimensão	Possui taxa fixa por incremento
Comportamento dimensional	Pode variar por família ou grupo
Combinação cor/dimensão	Multiplicativa
Família	Pode possuir regras de preço e de margem
Mercado interno	Somente referência competitiva
Margem dos filhos	Calculada individualmente
Correção automática de margem	Não permitida
Alteração manual de filho	Permitida apenas na simulação
Arredondamento	Múltiplos de R$ 0,10
Importação	Planilha única ou arquivos separados
Histórico	Deve preservar fotografia dos dados e regras
4. ARQUITETURA TECNOLÓGICA
Utilizar:
•	Lovable para construção da interface.
•	Supabase ou Lovable Cloud para banco de dados e autenticação.
•	Backend para execução das regras de negócio.
•	Excel e CSV para importação.
•	Excel para exportação dos resultados.
A escolha entre Supabase e Lovable Cloud deverá considerar as políticas de segurança da organização.
Separação da arquitetura
Frontend
•	Telas.
•	Cadastros.
•	Pesquisa.
•	Filtros.
•	Tabelas.
•	Indicadores.
•	Relatórios.
Backend
•	Motor de formação de preços.
•	Resolução de margens.
•	Aplicação das réguas.
•	Aplicação de exceções.
•	Arredondamento.
•	Validações.
•	Histórico das simulações.
Banco de dados
•	Produtos.
•	Hierarquia.
•	Famílias.
•	Linhas.
•	Cores.
•	Dimensões.
•	Custos.
•	Mercado.
•	Margens.
•	Réguas.
•	Exceções.
•	Simulações.
•	Histórico.
•	Usuários.
5. MENU PRINCIPAL
Criar menu lateral com:
1.	Dashboard.
2.	Simulação de preços.
3.	Base de produtos.
4.	Hierarquia de produtos.
5.	Réguas comerciais.
6.	Margens objetivas.
7.	Histórico de simulações.
8.	Importação de bases.
9.	Usuários e configurações.
O visual deverá ser corporativo, moderno, intuitivo e responsivo.
Priorizar tabelas de fácil leitura, filtros, pesquisa por código e descrição, indicadores visuais e navegação simples.
6. CADASTRO DE PRODUTOS
Criar uma base central de produtos.
Campos obrigatórios ou previstos
Campo	Descrição
Código	Identificação comercial
Descrição	Descrição do produto
Tipo de código	Pai ou filho
Código pai	Vínculo do filho
Família	Família comercial
Linha	Linha comercial
Cor	Cor do produto
Tipo de dimensão	Bitola, diâmetro ou outra
Valor da dimensão	Valor numérico
Unidade	mm, polegada etc.
Grupo dimensional	Grupo de aplicação da régua
Ordem dimensional	Posição comercial na sequência
Custo completo	Custo utilizado no cálculo
Preço mercado interno	Referência competitiva
Margem específica	Exceção opcional
Status	Ativo ou inativo
O código comercial deverá ser único.
Custos e preços de mercado deverão aceitar atualização independente da classificação comercial do produto.
Regras da hierarquia
•	Um filho deverá possuir um pai válido.
•	Pai e filhos sempre pertencerão à mesma linha.
•	Não permitir um produto como pai dele mesmo.
•	Não permitir vínculos duplicados.
•	Não permitir filhos sem pai.
•	Na primeira versão, trabalhar com um nível: pai e filhos.
•	Registrar alterações de hierarquia.
7. CADASTROS AUXILIARES
Criar cadastros independentes para:
Famílias
•	Identificador.
•	Nome.
•	Descrição.
•	Status.
•	Margem padrão.
•	Regras específicas de preço, quando aplicáveis.
Linhas
•	Identificador.
•	Nome.
•	Família.
•	Status.
•	Margem específica, quando aplicável.
Cores
•	Identificador.
•	Nome.
•	Status.
Tipos de dimensão
•	Identificador.
•	Nome.
•	Unidade de medida.
•	Descrição.
•	Status.
Grupos dimensionais
•	Identificador.
•	Nome.
•	Tipo de dimensão.
•	Escopo de aplicação.
•	Status.
8. FORMAÇÃO DO PREÇO DO CÓDIGO PAI
O usuário deverá escolher entre dois modos.
8.1. Automático
Fórmula:
P = C / (1 - M)
Onde:
•	P = preço de venda.
•	C = custo completo.
•	M = margem objetiva.
Exemplo:
Custo: R$ 60,00.
Margem objetiva: 40%.
Preço calculado: R$ 100,00.
8.2. Manual
O usuário informa o preço desejado.
Fórmula:
M = (P - C) / P
Exemplo:
Custo: R$ 60,00.
Preço informado: R$ 90,00.
Margem alcançada: 33,33%.
O sistema deverá apresentar a margem alcançada, a margem objetiva e a diferença em pontos percentuais.
Não modificar automaticamente o preço informado.
9. HIERARQUIA DAS MARGENS OBJETIVAS
Criar módulo próprio para cadastro e manutenção das margens.
Ordem de precedência:
1.	Margem específica do produto.
2.	Margem específica da linha.
3.	Margem específica da família.
4.	Margem padrão geral.
O sistema deverá utilizar a primeira regra válida encontrada.
Exibir a margem aplicada e sua origem.
Permitir:
•	Cadastro.
•	Edição.
•	Vigência inicial e final.
•	Ativação e desativação.
•	Histórico de alterações.
Se não houver margem aplicável, bloquear a formação automática e apresentar alerta.
10. RÉGUAS COMERCIAIS
Todas as réguas deverão ser configuráveis pelo usuário autorizado.
Cada regra deverá ter:
•	Identificador.
•	Nome.
•	Tipo.
•	Escopo.
•	Percentual.
•	Prioridade.
•	Vigência inicial.
•	Vigência final.
•	Status.
•	Identificação da regra substituída, quando aplicável.
10.1. Régua de cores
Permitir configurar o ajuste percentual de cada cor.
Exemplo meramente ilustrativo:
Cor	Ajuste
Branca	-10%
Bege	0%
Cinza	0%
Preta	0%
Os percentuais deverão ser cadastrados, nunca fixados no código.
A régua poderá variar conforme família ou grupo de produtos.
10.2. Régua dimensional
A régua dimensional é uma regra independente da régua de cores.
Deverá atender a bitolas, diâmetros e outras dimensões comerciais.
Definições confirmadas:
•	Formato: taxa fixa por incremento.
•	Comportamento: pode variar conforme família ou grupo de produtos.
•	Referência: dimensão do código pai.
•	Aplicação: individual por filho.
•	Combinação com cor: multiplicativa.
O sistema deverá identificar quantos incrementos separam a dimensão do filho da dimensão do pai.
Exemplo ilustrativo:
Dimensão	Posição em relação ao pai
10 mm	-2
15 mm	-1
20 mm	0
25 mm	+1
30 mm	+2
O pai será sempre a referência da régua na simulação.
A posição dimensional deverá ser obtida por uma sequência comercial cadastrada. Não presumir que a diferença numérica entre medidas representa necessariamente um incremento.
Cada grupo dimensional poderá ter sua própria taxa.
A régua deverá permitir taxas positivas ou negativas, conforme configuração comercial.
Hipótese matemática a validar antes da homologação: interpretar a taxa fixa por incremento como acréscimo percentual linear sobre o preço de referência:
A_D = r × n
Onde:
•	A_D = ajuste dimensional acumulado.
•	r = taxa percentual por incremento.
•	n = quantidade de incrementos em relação ao pai.
Exemplo: taxa de 5% e dois incrementos acima do pai resultam em ajuste dimensional de +10%.
Não transformar essa hipótese em regra definitiva sem validação comercial.
10.3. Régua de família
A família poderá possuir:
•	Margem objetiva própria.
•	Ajuste de preço.
•	Régua de cores específica.
•	Régua dimensional específica.
•	Exceções comerciais.
A aplicação de um ajuste de família no preço deverá ser configurável e não poderá duplicar um ajuste já aplicado por outra régua.
10.4. Régua de linha
Como pai e filhos sempre pertencem à mesma linha, não aplicar ajuste de linha entre eles.
A régua de linha poderá ser mantida para outras aplicações comerciais, mas não deverá produzir diferença artificial entre o preço do pai e o dos filhos.
11. FÓRMULA DOS PREÇOS DOS FILHOS
Fórmula principal:
P_f = P_p × (1 + A_C) × (1 + A_D)
Onde:
•	P_f = preço do filho.
•	P_p = preço do pai.
•	A_C = ajuste de cor.
•	A_D = ajuste dimensional.
Ajustes de família somente deverão ser incluídos quando houver regra específica cadastrada e sua forma de aplicação estiver definida.
Não aplicar ajuste de linha entre pai e filho.
Exemplo:
Preço do pai: R$ 10,00.
Ajuste de cor: -10%.
Ajuste dimensional: +10%.
Preço antes do arredondamento:
R$ 10,00 × 0,90 × 1,10 = R$ 9,90.
O custo de cada filho deverá ser independente do custo do pai.
12. ARREDONDAMENTO
Regra confirmada: o preço final deverá ser múltiplo de R$ 0,10.
Exemplos:
Resultado bruto	Resultado final
R$ 10,04	R$ 10,00
R$ 10,06	R$ 10,10
R$ 10,14	R$ 10,10
R$ 10,16	R$ 10,20
R$ 10,28	R$ 10,30
Executar o arredondamento somente depois da aplicação de todas as regras de preço.
Calcular a margem utilizando o preço já arredondado.
Utilizar precisão decimal e definir explicitamente o critério de desempate quando o preço estiver exatamente no meio de dois incrementos.
13. MARGEM INDIVIDUAL DOS FILHOS
Fórmula:
M_f = (P_f - C_f) / P_f
Cada filho deverá ter sua margem calculada individualmente.
O sistema deverá comparar a margem alcançada com a margem objetiva aplicável.
Se estiver abaixo da meta:
•	Apresentar alerta.
•	Mostrar diferença em pontos percentuais.
•	Não alterar o preço.
•	Não alterar a régua.
•	Não alterar os demais filhos.
14. COMPARAÇÃO COM MERCADO INTERNO
O mercado interno será somente referência competitiva.
Fórmula:
D = (P_s / P_m) - 1
Onde:
•	P_s = preço simulado.
•	P_m = preço de mercado.
Exibir:
•	Preço simulado.
•	Preço de mercado.
•	Diferença em reais.
•	Diferença percentual.
•	Indicador acima ou abaixo do mercado.
Não utilizar mercado como teto ou piso automático.
15. EXCEÇÕES E PRECEDÊNCIA
O sistema deverá suportar:
•	Regras gerais.
•	Regras por família.
•	Regras por linha, quando aplicáveis.
•	Regras por grupo dimensional.
•	Regras por produto.
•	Vigências.
•	Prioridades.
•	Substituição de regras.
Uma exceção deverá substituir a regra genérica equivalente.
Exemplo: se a régua geral define -10% para branco e um produto específico possui exceção de -5%, aplicar somente -5%.
Regras independentes de cor e dimensão deverão continuar combinadas.
Não escolher uma única regra vencedora quando duas regras independentes forem aplicáveis.
16. TELA DE SIMULAÇÃO
Criar uma tela principal para realizar simulações.
Seleção do produto
Permitir pesquisa por:
•	Código.
•	Descrição.
•	Família.
•	Linha.
Ao selecionar o código pai, carregar automaticamente todos os filhos.
Configuração da simulação
Exibir:
•	Código e descrição do pai.
•	Custo completo.
•	Mercado interno.
•	Margem objetiva.
•	Origem da margem.
•	Modo automático ou manual.
•	Preço calculado ou informado.
Resultado
Criar tabela com:
Campo
Código
Descrição
Tipo de código
Família
Linha
Cor
Dimensão
Custo completo
Mercado interno
Ajuste de cor
Ajuste dimensional
Margem objetiva
Preço simulado
Margem alcançada
Diferença da margem
Diferença do mercado
Status
Alertas
Permitir:
•	Filtros.
•	Ordenação.
•	Pesquisa.
•	Edição manual dos filhos.
•	Memória de cálculo.
•	Exportação Excel.
•	Salvamento da simulação.
17. ALTERAÇÕES MANUAIS DOS FILHOS
Permitir alterar manualmente o preço de um filho durante a simulação.
Essa alteração:
•	Não modifica a régua oficial.
•	Não modifica o cadastro do produto.
•	Não altera outros filhos.
•	Fica registrada na simulação.
•	Identifica o preço original e o preço manual.
•	Recalcula margem e comparação com mercado.
18. ALERTAS E VALIDAÇÕES
Implementar alertas para:
Condição	Comportamento
Margem abaixo da objetiva	Alerta
Margem igual ou acima da objetiva	Dentro da meta
Preço acima do mercado	Indicador
Preço abaixo do mercado	Indicador
Custo ausente	Bloquear cálculo do produto
Custo igual a zero ou negativo	Bloquear cálculo
Margem inválida	Bloquear cálculo
Preço manual igual ou inferior a zero	Bloquear cálculo
Margem objetiva ausente	Bloquear formação automática
Filho sem pai	Bloquear replicação
Pai e filho em linhas diferentes	Bloquear cadastro
Régua ausente	Alertar, sem inventar percentual
Mercado ausente	Comparação indisponível
Dimensão ausente	Não aplicar ajuste dimensional
Regra fora da vigência	Não aplicar
Regras conflitantes	Exigir resolução
Os alertas de mercado e margem deverão ser independentes.
19. IMPORTAÇÃO DE EXCEL
Permitir importar:
•	Base completa de produtos.
•	Custos.
•	Preços de mercado.
•	Hierarquia.
•	Cadastros comerciais autorizados.
Aceitar uma única planilha ou arquivos separados.
Fluxo obrigatório:
1.	Upload.
2.	Identificação das colunas.
3.	Mapeamento.
4.	Validação.
5.	Pré-visualização.
6.	Confirmação.
7.	Atualização do banco.
Antes da atualização, mostrar:
•	Registros novos.
•	Registros atualizados.
•	Registros rejeitados.
•	Motivos das rejeições.
Não sobrescrever informações sem confirmação.
Permitir atualizar custo e mercado sem alterar hierarquia ou réguas.
Registrar arquivo, data, usuário, tipo de importação e resultado.
20. HISTÓRICO E SNAPSHOTS
Cada simulação deverá armazenar:
•	Código pai e filhos.
•	Modo de formação.
•	Preço manual ou automático.
•	Custos utilizados.
•	Preços de mercado.
•	Margens objetivas.
•	Origem das margens.
•	Réguas utilizadas.
•	Percentuais aplicados.
•	Vigências.
•	Ajustes dimensionais.
•	Preços finais.
•	Alterações manuais.
•	Margens alcançadas.
•	Alertas.
•	Data e usuário.
As simulações antigas deverão ser reproduzidas com os dados originais, sem utilizar custos ou regras atuais.
21. MODELO DE DADOS
Criar as seguintes tabelas:
produtos
•	Cadastro e características dos produtos.
hierarquia_produtos
•	Relacionamento pai/filho.
familias
•	Cadastro de famílias.
linhas
•	Cadastro de linhas.
cores
•	Cadastro de cores.
tipos_dimensao
•	Tipos de dimensão e unidades.
grupos_dimensionais
•	Agrupamento comercial das dimensões.
reguas
•	Cadastro das regras comerciais.
regras_regua
•	Percentuais e condições.
reguas_dimensionais
•	Taxas dimensionais.
regras_dimensionais
•	Incrementos e ajustes.
margens
•	Margens objetivas por nível.
excecoes
•	Regras específicas.
importacoes
•	Histórico de arquivos.
simulacoes
•	Cabeçalho das simulações.
itens_simulacao
•	Produtos e resultados.
snapshot_regras
•	Fotografia das regras utilizadas.
usuarios
•	Perfis e permissões.
Utilizar chaves primárias, chaves estrangeiras, restrições de integridade e índices apropriados.
Utilizar tipos DECIMAL para valores financeiros e percentuais.
22. MOTOR DE CÁLCULO
Implementar no backend, seguindo esta ordem:
1.	Receber código pai e modo de formação.
2.	Carregar dados do pai.
3.	Resolver margem objetiva.
4.	Validar custo e margem.
5.	Calcular ou receber preço do pai.
6.	Carregar filhos.
7.	Validar hierarquia e linha.
8.	Identificar réguas vigentes.
9.	Resolver exceções.
10.	Calcular ajuste de cor.
11.	Calcular ajuste dimensional.
12.	Identificar regras de família aplicáveis.
13.	Combinar ajustes independentes.
14.	Calcular preço bruto.
15.	Arredondar para R$ 0,10.
16.	Calcular margem individual.
17.	Comparar com margem objetiva.
18.	Comparar com mercado.
19.	Gerar alertas.
20.	Salvar resultados e snapshots.
O motor nunca deverá corrigir automaticamente preços para alcançar a margem.
23. SEGURANÇA E PERFIS
Criar três perfis:
Administrador
•	Gerenciar usuários.
•	Gerenciar cadastros.
•	Gerenciar margens e réguas.
•	Importar bases.
•	Consultar todas as simulações.
Gestor comercial
•	Gerenciar regras autorizadas.
•	Consultar simulações.
•	Acompanhar resultados.
Analista
•	Consultar produtos.
•	Realizar simulações.
•	Importar bases autorizadas.
•	Exportar resultados.
Aplicar permissões também no banco de dados.
Considerar autenticação individual, políticas de acesso, logs e backups.
24. DASHBOARD
Apresentar:
•	Total de produtos.
•	Total de pais.
•	Total de filhos.
•	Total de simulações.
•	Última atualização de custos.
•	Última atualização de mercado.
•	Última atualização das réguas.
•	Produtos abaixo da margem objetiva.
•	Produtos acima e abaixo do mercado.
Os indicadores deverão respeitar os filtros e permissões.
25. CRITÉRIOS DE ACEITE
Antes de considerar o aplicativo pronto, testar:
1.	Preço automático do pai.
2.	Preço manual do pai.
3.	Margem do pai.
4.	Preços de vários filhos.
5.	Ajuste de cor.
6.	Ajuste dimensional.
7.	Combinação multiplicativa.
8.	Arredondamento em R$ 0,10.
9.	Margem individual dos filhos.
10.	Hierarquia das margens.
11.	Exceções sem dupla aplicação.
12.	Comparação com mercado.
13.	Ausência de correção automática.
14.	Alterações manuais.
15.	Importação Excel.
16.	Reprodução de simulações antigas.
17.	Segurança e permissões.
Cada teste deverá possuir dados de entrada e resultado esperado.
26. PONTOS PENDENTES DE VALIDAÇÃO
Não assumir regras comerciais ainda não aprovadas.
Pontos pendentes:
1.	Confirmar se a taxa dimensional fixa por incremento será aplicada linearmente ou de forma composta.
2.	Confirmar a sequência dimensional de cada grupo.
3.	Definir como ajustes de preço da família serão combinados com as réguas de cor e dimensão.
4.	Definir o desempate do arredondamento em meio incremento.
5.	Validar a estrutura real da planilha de produtos.
6.	Validar unidade, moeda e condições dos preços de mercado.
Implementar os pontos pendentes como parâmetros configuráveis ou deixar a funcionalidade aguardando validação.
27. PLANO DE DESENVOLVIMENTO NO LOVABLE
Desenvolver em etapas independentes.
FASE 1 — Estrutura visual
•	Navegação.
•	Layout.
•	Dashboard inicial.
•	Telas dos módulos.
FASE 2 — Banco de dados
•	Tabelas.
•	Relacionamentos.
•	Autenticação.
•	Permissões.
FASE 3 — Cadastros
•	Produtos.
•	Famílias.
•	Linhas.
•	Cores.
•	Dimensões.
•	Hierarquia.
FASE 4 — Importação
•	Upload.
•	Mapeamento.
•	Validação.
•	Pré-visualização.
•	Atualização.
FASE 5 — Regras comerciais
•	Margens.
•	Réguas de cores.
•	Réguas dimensionais.
•	Regras de família.
•	Exceções.
•	Vigências.
FASE 6 — Motor de cálculo
•	Formação do pai.
•	Formação dos filhos.
•	Arredondamento.
•	Margens.
•	Mercado.
•	Alertas.
FASE 7 — Histórico e relatórios
•	Snapshots.
•	Consulta de simulações.
•	Exportação.
•	Auditoria.
FASE 8 — Testes e homologação
•	Testes matemáticos.
•	Testes comerciais.
•	Testes de importação.
•	Testes de segurança.
28. PRIMEIRA SOLICITAÇÃO AO LOVABLE
Após incorporar este documento ao contexto do projeto, executar somente a primeira etapa de planejamento.
Solicitação:
"Analise integralmente a documentação do Simulador de Preços. Não construa ainda o aplicativo completo. Primeiro, apresente:
1.	Arquitetura técnica recomendada.
2.	Estrutura de banco de dados.
3.	Relacionamentos entre tabelas.
4.	Organização das funções de backend.
5.	Organização dos módulos e telas.
6.	Pontos de atenção e riscos técnicos.
7.	Dúvidas comerciais que precisam de confirmação.
Não invente regras de negócio nem percentuais.
Aguarde minha aprovação antes de iniciar a implementação."
ENTREGA FINAL ESPERADA
Um aplicativo corporativo de simulação de preços, com formação de preços de pais e filhos, réguas comerciais configuráveis, variação por cor e dimensão, análise individual de margem, comparação com mercado, importação Excel, histórico reproduzível e controle de acesso.
A prioridade do projeto é a confiabilidade dos cálculos e das regras comerciais, não apenas a aparência visual.
