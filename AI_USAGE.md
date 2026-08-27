# Uso de Inteligência Artificial

## Ferramentas utilizadas

Usei o Claude (Anthropic, via Claude Code/Cowork) como assistente de IA durante todo o desenvolvimento do desafio — desde o planejamento inicial até a documentação final.

## Como a IA foi utilizada

- **Planejamento e arquitetura:** antes de escrever qualquer código, discuti com a IA a estrutura do repositório, o modelo de dados, as rotas da API e as principais decisões técnicas, alinhando cada parte com os requisitos do desafio antes de avançar.
- **Geração de uma primeira versão do código:** pedi à IA para gerar o código de cada parte do projeto (schema do banco, camada de serviço, rotas, validações, hooks e componentes do frontend), fase por fase, sempre revisando antes de aceitar.
- **Investigação de erros reais:** usei a IA para investigar problemas que apareceram rodando o projeto de verdade no meu ambiente Windows — incluindo um erro que quebrou minha instalação do Prisma depois de eu rodar `npm audit fix --force`, e um erro 500/conexão recusada ao reiniciar o ambiente (detalhado abaixo).
- **Comparação de alternativas técnicas:** em decisões como separar erros 400 de 422, ou testar contra um banco real em vez de mockar o Prisma, discuti com a IA mais de uma abordagem antes de escolher.
- **Testes automatizados:** a IA gerou os testes com Vitest; um deles pegou um bug real (busca acentuada), descrito na seção abaixo.
- **Documentação:** mantive, junto com a IA, um log de decisões ao longo de todo o desenvolvimento (`docs/ai-usage-log.md`), que foi a base para escrever o `README.md` e este documento.

## Exemplos de interações

1. *"Eu quero fazer tudo manualmente, mas você me forneça escrita de código dentro dos padrões adequados e sem fazer nada a mais do que solicitado, deve seguir tudo que foi pedido. Mas vamos planejar, alinhar o projeto cada trecho, tome bastante atenção."* — instrução inicial que guiou todo o projeto: pedir código correto e dentro do escopo, mas sem avançar sem alinhar antes.

2. Depois de rodar `npm audit fix --force` e quebrar minha instalação (a versão do Prisma CLI ficou desalinhada da versão do client), colei o erro exato do terminal (`P1012`, versão `6.12.0` no lugar de `7.10.0`) e perguntei quais comandos faltavam pra corrigir — a IA identificou a causa (downgrade indevido do CLI) e me passou os comandos pra restaurar as versões corretas e reinstalar.

3. *"Backend rodando tá dando problema"* + o erro exato do console do navegador — ao investigar um 500 e depois um `ERR_CONNECTION_REFUSED` reais no meu ambiente, pedi ajuda pra entender a causa; a IA sugeriu isolar o problema testando o backend sozinho antes de desconfiar do frontend, mas o diagnóstico e a correção final (rodar `prisma generate`/`migrate deploy`/`seed` de novo, e manter os dois servidores rodando juntos) eu fiz e validei.

## Sugestão incorreta ou incompleta

**Situação principal:** ao implementar a busca por nome/comentário (Fase 5), a primeira versão do serviço usava o filtro `contains` do Prisma diretamente no SQL do SQLite.

- **Qual foi a sugestão:** buscar direto no banco via `where: { OR: [{ customerName: { contains: search } }, { comment: { contains: search } }] }`.
- **Como percebi o problema:** escrevi um teste automatizado buscando "PÉSSIMO" (maiúsculo, acentuado) esperando encontrar um registro com o comentário "Péssimo." (minúsculo). O teste falhou — 0 resultados em vez de 1. Investigando, descobri que o SQLite só ignora maiúscula/minúscula em caracteres ASCII por padrão; em caracteres acentuados (é, ç, ã...) a comparação é *case-sensitive*. Como o app inteiro é em português, isso quebraria a busca de nomes e comentários reais o tempo todo.
- **O que precisou ser alterado:** tirei a busca por texto do `where` do Prisma. Os filtros "exatos" (canal, status, nota) continuam sendo aplicados no banco, mas nome e comentário passaram a ser filtrados em JavaScript, normalizando os dois lados da comparação com `.normalize("NFD")` + remoção de acentos (`\p{Diacritic}`) + `.toLowerCase()`.
- **Como validei a solução final:** reescrevi o teste que tinha falhado, rodei a suíte inteira de novo (31 testes passando), e testei manualmente contra o servidor real com termos como "REGIÃO" (maiúsculo/acentuado) encontrando "região" (minúsculo) e "preco" (sem acento) encontrando "Preço".

**Outras duas situações menores, do mesmo tipo (sugestão que passou no código mas falhou num teste real):**

- Um bug que só aparecia no Windows: os testes passavam no ambiente onde foram gerados, mas no meu ambiente Windows um arquivo de teste falhava com `table "Feedback" already exists`, porque o Vitest roda arquivos em paralelo por padrão e os dois arquivos recriavam o mesmo banco de teste ao mesmo tempo — uma condição de corrida que o Windows expôs por travar arquivos com mais rigor. Corrigi adicionando `fileParallelism: false` na configuração do Vitest.
- Ao adicionar a troca de status na interface, a primeira versão fazia o modal de detalhe voltar para a tela de "Carregando…" a cada atualização, apagando a mensagem de sucesso antes de eu conseguir vê-la. Percebi rodando o fluxo de ponta a ponta e reparando que a mensagem verde não aparecia no resultado final. Corrigi fazendo o hook manter os dados anteriores na tela durante uma atualização em segundo plano, em vez de resetar para o estado de carregamento.

## Validação

Validei o código gerado com a IA de várias formas, nunca aceitando algo só porque "parecia certo":

- **Testes automatizados:** 31 testes com Vitest (regras de negócio e validações), rodados contra um banco SQLite de teste real e isolado — não mockado.
- **Testes manuais via `curl`:** com o servidor rodando de verdade, testei cada rota da API, incluindo os casos de erro (filtro inválido, id inexistente, JSON malformado, descrição vazia, status inválido) e o fluxo completo da regra do feedback crítico (bloqueio sem anotação, liberação com anotação).
- **Inspeção direta no banco de dados:** em alguns pontos, conferi os dados gravados direto no arquivo SQLite (sem passar pela API), pra confirmar que o que a API retornava batia com o que realmente estava persistido.
- **Testes end-to-end no navegador (Playwright):** capturas de tela reais confirmando visualmente que a listagem, os filtros, os indicadores, o modal de detalhe, o cadastro de anotações e a troca de status funcionam juntos, com as mensagens de sucesso/erro corretas.
- **Instalação do zero:** antes de considerar o `README.md` pronto, simulei uma instalação limpa (sem `node_modules`, banco ou `.env`) seguindo exatamente as instruções documentadas, tanto do backend quanto do frontend.

## Decisões técnicas

**Separação de erros 400 (validação) e 422 (regra de negócio).** A primeira versão usava um único tipo de erro (422) tanto para entrada mal formada (status inexistente, descrição vazia) quanto para a regra do feedback crítico. Comparei duas abordagens: manter tudo em 422 (mais simples) ou separar em duas classes de erro — 400 para entrada mal formada, e 422 apenas para quando a entrada é válida mas viola uma regra de negócio (o caso da seção 6.7 do desafio). Optei pela segunda: é a distinção padrão usada em APIs REST e deixa a resposta mais precisa para quem for consumi-la — um erro 400 diz "você mandou algo com formato errado", um 422 diz "o que você mandou é válido, mas não pode ser aceito agora por causa de uma regra".

**Testar contra um banco real em vez de mockar o Prisma.** Para os testes automatizados, avaliei usar uma biblioteca de mock do Prisma Client (como `vitest-mock-extended`) em vez de rodar contra um banco SQLite de verdade. Optei pelo banco real: para o tamanho deste projeto, isso significa menos configuração e menos dependências, além de ter sido o que realmente encontrou o bug de busca acentuada descrito acima — um mock nunca reproduziria esse comportamento específico do SQLite.

## Domínio da solução

Sinto que domino bem a lógica de negócio da aplicação (a regra do feedback crítico, a separação de erros, os filtros combinados) e a arquitetura geral do backend — consigo explicar por que cada camada existe (rotas → validação → serviço → banco) e por que cada decisão foi tomada. Também me sinto seguro explicando os problemas reais que resolvi sozinho durante o desenvolvimento (a quebra do `npm audit fix --force`, o erro 500/conexão recusada), porque foram situações que investiguei e corrigi eu mesmo, com a IA me ajudando a estruturar a investigação.

Onde eu ainda estudaria mais: testes automatizados no frontend (este projeto só tem testes no backend) e padrões mais avançados de gerenciamento de estado em React para aplicações maiores do que esta, já que aqui usei apenas hooks simples (`useState`/`useEffect`), suficientes para o escopo do desafio mas que não escalariam sozinhos para uma aplicação bem maior.
