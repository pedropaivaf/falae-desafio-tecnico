# Log de uso de IA (rascunho para o AI_USAGE.md final)

Formato por entrada: data | fase | o que pedi | o que a IA sugeriu | o que validei/mudei

---

### 2026-08-26 | Planejamento geral
- Pedi: montar arquitetura completa (pastas, modelo de dados, rotas, decisões) a partir do README do desafio.
- IA sugeriu: schema Prisma usando `enum` do Prisma para channel/status.
- Problema encontrado: SQLite não suporta `enum` nativo no Prisma — quebraria no `migrate dev`.
- Corrigido para: campos `String` + constantes TypeScript (`FEEDBACK_CHANNELS`, `FEEDBACK_STATUSES`) usadas na validação manual.
- Como validei: confirmado rodando `npx prisma migrate dev` na Fase 2, sem erro de schema.

### 2026-08-26 | Fase 2 — setup do backend
- Pedi: gerar o setup inicial do Prisma com SQLite (schema, client, seed).
- IA sugeriu (primeira tentativa): `import { PrismaClient } from '@prisma/client'` direto, sem adapter — o jeito "clássico" do Prisma 5/6.
- Problema encontrado: o projeto instalou Prisma 7.10.0 (versão estável atual), que mudou bastante: exige um *driver adapter* (`@prisma/adapter-better-sqlite3`) para instanciar o `PrismaClient`, o client passou a ser gerado em `generated/prisma/` (fora do `node_modules`), e a config de datasource/seed saiu do `schema.prisma`/`package.json` e foi para um novo arquivo `prisma.config.ts`.
- Como percebi: rodando os comandos reais (`prisma init`, `prisma migrate dev`) e comparando com a documentação oficial atualizada, não confiando na memória "padrão" da IA sobre versões antigas do Prisma.
- Corrigido para: instalar `@prisma/adapter-better-sqlite3`, criar `prisma.config.ts` com a URL do banco e o comando de seed, e importar o `PrismaClient` do caminho gerado (`generated/prisma/client`) usando o adapter.
- Como validei: `npx prisma validate`, `npx prisma migrate dev --name init`, `npx prisma generate`, `npx prisma db seed`, consulta direta no `dev.db` confirmando 12 feedbacks/4 anotações, `npx tsc --noEmit` sem erros, e `npm run dev` respondendo em `/health`.

### 2026-08-26 | Fase 3 — service layer e regra de negócio
- Pedi: implementar a camada de serviço (listagem+filtros+indicadores, detalhe, notas, troca de status) e a regra do feedback crítico.
- IA gerou: `feedback.service.ts` com filtros combináveis via Prisma (`where` dinâmico), cálculo de indicadores e a regra "crítico só conclui com anotação".
- Ponto de atenção que verifiquei antes de aceitar: se a busca (`contains`) no SQLite seria case-insensitive sem precisar de `mode: "insensitive"` (esse `mode` só existe pra Postgres/MySQL no Prisma — usar com SQLite dá erro, mesma classe de problema do `enum` da Fase 2).
- Como validei: escrevi um script descartável chamando as funções do service direto contra o banco seedado (não fiz só leitura de código) e conferi: busca "atendimento" vs "ATENDIMENTO" retornam o mesmo resultado; filtros combinados (channel+status) batem com os dados esperados; indicadores batem com o cálculo manual (soma das notas / total); indicadores com 0 resultados retornam 0 (não `NaN`); anotação vazia/só espaço é bloqueada; status inválido é bloqueado; feedback crítico sem anotação não conclui (mensagem igual à do desafio); com anotação, conclui normalmente; feedback inexistente retorna 404. Depois apaguei o script de teste.

### 2026-08-26 | Fase 3 — decisão técnica: 400 vs 422
- Decisão: a primeira versão usava 422 (`BusinessRuleError`) pra três casos diferentes: status fora do enum, descrição de anotação vazia, e a regra do feedback crítico.
- Alternativas comparadas: (a) manter tudo em 422, mais simples; (b) separar em duas classes — 400 (`ValidationError`) pra entrada mal formada/campo obrigatório ausente, e 422 (`BusinessRuleError`) só pra quando a requisição é válida mas viola uma regra de negócio (o caso do 6.7 do desafio).
- Escolhi (b): 400 = "você mandou algo com formato errado" (status que não existe, descrição vazia); 422 = "o que você mandou é válido, mas não pode ser aceito agora por causa de uma regra" (crítico sem anotação). É a distinção padrão de REST e deixa a resposta da API mais precisa pra quem for consumir.
- Como validei: reescrevi o smoke test cobrindo os três casos e conferi o `statusCode`/`name` de cada erro lançado.

### 2026-08-26 | Fase 4 — rotas, controller, validação e erros
- Pedi: expor o service via Express (5 rotas do desafio), validação de entrada e middleware central de erro.
- IA gerou: `feedback.validation.ts` (valida id, filtros de query, body), `feedback.controller.ts`, `feedback.routes.ts`, `errorHandler.ts`.
- Erro que o `tsc` pegou sozinho (não foi preciso eu achar): `req.params.id` no Express 5/TS mais recente tem tipo `string | string[]`, não só `string` — `parseFeedbackId` original não aceitava isso. Corrigido pra validar o tipo dentro da própria função.
- Decisão que confirmei antes de confiar: Express 5 propaga erro de `async` handler pro middleware de erro sozinho (sem precisar de `try/catch` manual nem do pacote `express-async-errors` que era necessário no Express 4). Não presumi isso — subi o servidor de verdade e testei.
- Como validei (end-to-end, servidor rodando, via `curl`, não só leitura): listagem sem filtro, filtros combinados (channel+status+rating), filtro inválido → 400, detalhe por id, notas de um feedback, criar nota vazia → 400, criar nota válida → 201, status inválido → 400, status válido → 200, id inexistente → 404, id não-numérico → 400, JSON malformado no body → 400, e a regra do crítico completa via HTTP: concluir sem anotação → 422 com a mensagem exata do desafio, adicionar anotação e concluir → 200. Todos os casos bateram.

### 2026-08-26 | Fase 5 — testes automatizados (⭐ bom exemplo de sugestão incorreta pro AI_USAGE.md)
- Pedi: testes com Vitest cobrindo a regra do feedback crítico e as validações principais, contra um banco de testes isolado (não o `dev.db` de demonstração).
- IA gerou: `feedback.service.ts` original usava o filtro `contains` do Prisma direto no SQL pra busca por nome/comentário.
- **Sugestão incorreta que um teste automatizado pegou (não fui eu que li e percebi — foi o teste que falhou):** escrevi um teste buscando "PÉSSIMO" (maiúsculo, acentuado) esperando achar um registro com comentário "Péssimo." (minúsculo). O teste falhou: 0 resultados em vez de 1.
- Causa raiz: o SQLite só ignora maiúscula/minúscula em caracteres ASCII por padrão (`contains` vira `LIKE`). Em caracteres acentuados (é, ç, ã...) ele é case-*sensitive* — e o app inteiro é em português, então isso quebraria busca de nomes/comentários reais o tempo todo (ex.: buscar "atendimento" sem acento não achar "Não gostei do Atendimento").
- Corrigido para: tirei a busca por texto do `where` do Prisma. Agora busco só pelos filtros "exatos" (canal/status/nota) no banco, e filtro nome/comentário em JavaScript, normalizando os dois lados com `.normalize("NFD")` + removendo os acentos (`\p{Diacritic}`) + `.toLowerCase()`. Pra esse volume de dados (uma tela de restaurante, não milhões de linhas) isso é mais simples e mais correto do que configurar extensão ICU no SQLite.
- Como validei: reescrevi o teste que falhou, rodei a suíte inteira de novo (31 testes passando), e revalidei via `curl` no servidor real com "REGIÃO" (maiúsculo/acentuado) achando "região" (minúsculo) e "preco" (sem acento) achando "Preço".

### 2026-08-26 | Fase 5 — como os testes rodam isolados
- Decisão: os testes usam um banco SQLite separado (`tests/test.db`), recriado do zero a partir do `migration.sql` já commitado, via um `setupFiles` do Vitest que troca a `DATABASE_URL` antes de qualquer módulo da aplicação ser importado.
- Alternativa que descartei: mockar o Prisma Client (ex.: `vitest-mock-extended`). Decidi não usar — pra esse tamanho de projeto, rodar contra um SQLite real é mais simples (menos dependência, menos configuração) e já pegou o bug de acentuação acima, que um mock nunca acharia.

### 2026-08-26 | Fase 5 — bug que só apareceu no Windows do Pedro (não no ambiente da IA)
- O que aconteceu: os 31 testes passavam no ambiente onde foram gerados, mas ao rodar `npm test` no Windows real, `feedback.service.test.ts` falhou inteiro com `SqliteError: table "Feedback" already exists`, enquanto `feedback.validation.test.ts` passou.
- Causa: o Vitest roda arquivos de teste em paralelo por padrão. Os dois arquivos usam o mesmo `setupFiles` (`tests/setup.ts`), que apaga e recria o `tests/test.db` do zero. Rodando ao mesmo tempo, um arquivo recria o banco enquanto o outro ainda está usando — condição de corrida. Isso não deu erro no ambiente onde a IA gerou o código (Linux), mas apareceu no Windows do Pedro, provavelmente porque o Windows trava arquivos abertos com mais rigor.
- Como percebi: reportando o erro exato do terminal do Pedro pra IA investigar, em vez de tentar adivinhar sozinho.
- Corrigido para: `fileParallelism: false` no `vitest.config.mts` — os arquivos de teste rodam em série, sem concorrência no mesmo banco.
- Como validei: pedi confirmação rodando `npm test` de novo no Windows depois do fix.

### 2026-08-26 | Fase 6 — setup do frontend
- Pedi: criar o projeto Vite + React + TypeScript + Tailwind, tipos compartilhados e cliente de API.
- Antes de gerar qualquer código, conferi as versões atuais no npm (mesma lição da Fase 2 com o Prisma): Vite 8, React 19 e principalmente **Tailwind CSS 4**, que mudou o setup por completo — não usa mais `tailwind.config.js`/`postcss.config.js`/diretivas `@tailwind base/components/utilities`. Agora é só o plugin `@tailwindcss/vite` + `@import "tailwindcss";` no CSS.
- O scaffold oficial do Vite (`npm create vite@latest`) também mudou bastante: veio com uma landing page de exemplo cheia de imagens/ícones em vez do clássico contador — removi tudo isso (`App.css`, `src/assets`, `public/icons.svg`) antes de escrever o app de verdade.
- Decisão: proxy `/api` -> `http://localhost:3333` no `vite.config.ts`, em vez de habilitar CORS no backend. Mais simples, e evita o navegador enxergar dois domínios diferentes.
- Como validei: `npm run build` (tsc + vite build) sem erros, depois subi backend e frontend juntos de verdade e conferi via `curl` no `http://localhost:5173/api/feedbacks` que o proxy repassa pro backend e devolve os 12 feedbacks reais.

### 2026-08-26 | Fase 6 — paleta de marca
- Pedi: extrair a paleta de cores da logo real da Falaê! (enviei a imagem) e aplicar no frontend, em vez de escolher cores "no olho".
- IA sugeriu: usar Python/PIL pra amostrar os pixels reais da logo (não estimar visualmente), identificando o teal principal (`#0288a1`), o laranja (`#fe8f00`) e o cinza (`#a9a9a9`) usados na marca, e derivar tons de hover/tint programaticamente a partir desses valores.
- Decisão: como o projeto usa Tailwind CSS 4 (CSS-first, sem `tailwind.config.js`), as cores foram registradas via bloco `@theme` no `src/index.css` (`--color-brand-teal`, `--color-brand-orange`, etc.), gerando classes utilitárias como `bg-brand-teal` automaticamente.
- Como validei: rodei `npm run build` e conferi no CSS compilado (`grep` no `dist/assets/*.css`) que `bg-brand-teal` gera exatamente `#0288a1` (a cor real extraída da logo, não um valor aproximado).
- Observação: só a paleta foi extraída e aplicada — o arquivo da logo em si não foi incorporado ao projeto (não foi pedido).

### 2026-08-26 | Fase 7 — listagem, indicadores e estados (loading/vazio/erro)
- Pedi: consumir a API de listagem no frontend, mostrando a barra de indicadores e a lista de feedbacks, com os três estados (carregando, vazio, erro) já usando a paleta da marca.
- IA gerou: hook `useFeedbacks` (state machine loading/error/success, com `filtersKey` serializado como dependência do efeito pra não refazer a busca por causa de uma nova referência de objeto, `reload()` via contador, e guarda de cancelamento no unmount pra evitar `setState` depois de desmontar); componentes `StarRating`, `ChannelBadge`, `StatusBadge` (cores por status usando os tokens da paleta), `IndicatorsBar` (total, nota média com vírgula decimal, positivos em verde, críticos em laranja da marca) e `FeedbackListItem`.
- Como validei: `npx tsc --noEmit` e `npm run build` sem erros; depois subi backend e frontend reais juntos e tirei um screenshot real da tela (Playwright/Chromium) contra os 12 feedbacks seedados, conferindo visualmente: header teal, indicadores corretos (12 total, 3,1 de média, 5 positivos, 5 críticos — bate com o cálculo manual), estrelas e "Críticos" em laranja, status "Concluído" em verde, badges de canal, datas formatadas em pt-BR.
- Pendente pras próximas fases: filtros/busca ainda não têm UI (Fase 8), detalhe+anotações (Fase 9), alteração de status (Fase 10).

### 2026-08-27 | Fase 7 — dificuldade real minha: erro 500 e depois "conexão recusada" ao rodar o projeto localmente (⭐ dificuldade pessoal pro AI_USAGE.md)
- O que aconteceu: fechei todos os terminais pra reiniciar o ambiente do zero e, ao abrir o projeto de novo, a tela mostrou "Erro interno no servidor" (500) na chamada `GET /api/feedbacks`. Depois de mexer, apareceu um segundo erro diferente: `ERR_CONNECTION_REFUSED`.
- Minha dificuldade: não sabia de cara se o problema era no código, no banco, ou só no jeito que eu estava rodando os dois servidores (backend na porta 3333, frontend na 5173, com proxy `/api` de um pro outro configurado no `vite.config.ts`).
- Como investiguei (com a IA me orientando a isolar o problema, mas os comandos e a leitura dos erros foram minhas): em vez de mexer no código direto, testei o backend sozinho primeiro (`http://localhost:3333/api/feedbacks` direto no navegador, sem passar pelo frontend) pra descobrir se o problema estava ali ou no proxy do Vite. Assim percebi duas causas diferentes, uma depois da outra:
  1. O 500 era o backend mesmo: o client do Prisma tinha ficado desatualizado e o banco (`dev.db`) não estava migrado/seedado nesse ambiente, provavelmente por causa do `npm ci` que eu tinha rodado antes pra desfazer o estrago do `npm audit fix --force`. Resolvi rodando de novo `npx prisma generate`, `npx prisma migrate deploy` e `npm run prisma:seed`.
  2. Depois disso o backend sozinho já respondia certo, mas pelo frontend deu `ERR_CONNECTION_REFUSED` — entendi que esse erro é diferente do 500: significa que não tinha nada rodando na porta 3333 naquele momento (eu tinha fechado o terminal do backend depois de testar). Corrigi mantendo os dois terminais abertos ao mesmo tempo, um com `npm run dev` do backend e outro do frontend.
- Como validei: com os dois servidores rodando juntos, `localhost:5173` carregou a lista completa com os 12 feedbacks e os indicadores corretos, sem nenhum erro no console.
- O que aprendi: `500` = servidor rodando mas com erro interno (nesse caso, banco/Prisma fora de sincronia); `ERR_CONNECTION_REFUSED` = servidor nem está de pé. São causas bem diferentes, e o primeiro passo pra debugar isso é sempre isolar — testar o backend direto antes de desconfiar do frontend/proxy.

### 2026-08-27 | Fase 8 — filtros e busca combinados
- Pedi: ligar busca (nome/comentário) + filtros de canal/status/nota na UI, combinando entre si, com os indicadores respeitando os filtros ativos (já era assim na API desde a Fase 3).
- IA gerou: `FiltersBar` (busca + 3 selects + botão "Limpar filtros", que só aparece quando algum filtro está ativo) e `useDebouncedValue` (debounce de 350ms só no campo de busca, pra não disparar uma requisição a cada tecla — os selects aplicam na hora, já que são cliques discretos). `FeedbackDashboard` monta o objeto de filtros combinando o valor debounced da busca com os selects via `useMemo`, reaproveitando os labels de canal/status já existentes (`CHANNEL_LABELS`/`STATUS_LABELS`, exportados dos badges pra não duplicar).
- Pequeno ajuste que fiz: a mensagem de lista vazia agora diferencia "Nenhum feedback encontrado." (sem filtro) de "Nenhum feedback encontrado com os filtros aplicados." (com filtro ativo) — feedback melhor pro usuário, dentro do escopo da própria funcionalidade sendo construída.
- Como validei: `npx tsc --noEmit` e `npm run build` sem erros; depois subi backend+frontend reais e testei via `curl` (proxy `/api`) canal+status combinados, nota exata, e busca acentuada — todos bateram com o esperado. Também tirei 3 screenshots reais (Playwright) confirmando visualmente: filtros combinados (iFood + Em análise) reduzindo a lista pra 2 itens com indicadores recalculados (total 2, média 3,0, 1 positivo, 1 crítico), e busca "REGIAO" (maiúsculo, sem acento) encontrando "Melhor restaurante da região!" (minúsculo, acentuado).

### 2026-08-27 | Fase 9 — detalhes do feedback + anotações internas
- Pedi: ao clicar num feedback da lista, abrir um modal com o detalhe completo e as anotações internas, com formulário pra adicionar nova anotação, feedback de sucesso/erro e atualização sem reload da página.
- IA gerou: `useFeedbackDetail` (mesmo padrão de state machine do `useFeedbacks`, mas pra um único feedback, com `reload()` pra reatualizar depois de criar uma anotação); `FeedbackDetailModal` (overlay + painel, fecha com Esc ou clique fora, mostra nome/nota/canal/status/comentário/data, lista de anotações — ou "Nenhuma anotação ainda." — e formulário com textarea, botão desabilitado enquanto vazio/enviando, e mensagem de erro inline se a criação falhar). `FeedbackListItem` virou um botão clicável (era só uma `<li>` estática) que abre o modal pelo id.
- Decisão: usei o `GET /:id` (que já retorna o feedback com as notas inclusas, mais novas primeiro) pra carregar o modal inteiro de uma vez, em vez de duas chamadas separadas — mais simples, já que o endpoint de detalhe já traz tudo. Depois de criar uma nota, só recarrego o detalhe (`reload()`) — não a lista de fora, já que anotações não aparecem nem afetam a lista/indicadores.
- Status foi deixado só como badge (leitura), sem botão de alterar ainda — isso é a Fase 10, separada.
- Como validei: `npx tsc --noEmit` e `npm run build` sem erros; depois um teste E2E real com Playwright: abri o modal de um feedback com uma nota existente, adicionei uma nova via formulário e confirmei visualmente que ela apareceu no topo da lista (mais nova primeiro, igual ao backend) sem recarregar a página, com o campo de texto limpo depois do envio.

### 2026-08-27 | Fase 11 (parcial) — README.md
- Pedi: escrever o README.md final documentando todas as fases já concluídas.
- IA gerou: README com apresentação, tecnologias, estrutura do repo, passo a passo de instalação (backend e frontend), configuração de banco, variáveis de ambiente, tabela de comandos, decisões técnicas (resumo do `docs/01-planejamento.md`), funcionalidades concluídas e pendências reais (alteração de status na UI ainda falta — Fase 10 — e o `AI_USAGE.md` final).
- Como validei (e não só lendo o texto): simulei uma instalação do zero de verdade, num diretório limpo — `rm -rf node_modules/dist/generated/dev.db/.env`, depois segui exatamente o passo a passo do README (`npm install`, copiar `.env.example`, `prisma generate`, `npm run prisma:migrate`, `npm run prisma:seed`, `npm run dev`) pro backend, e o mesmo pro frontend. Confirmei que o backend sobe, `/health` responde, os 12 feedbacks do seed aparecem, o frontend sobe e o proxy `/api` funciona — e que `npm test` roda os 31 testes também numa instalação limpa. Só documentei como "verificado" depois de ver funcionar do zero, não presumi que os comandos estavam certos só porque fazem sentido.

### 2026-08-27 | Fase 10 — alteração de status + regra do crítico na UI (⭐ bom exemplo de sugestão incompleta pro AI_USAGE.md)
- Pedi: adicionar no modal de detalhe um jeito de trocar o status do feedback, mostrando o erro da regra do crítico (422) na tela quando bloqueado, com feedback de sucesso/erro e sem reload da página.
- IA gerou: select de status + botão "Salvar status" no modal (desabilitado quando a seleção é igual ao status atual ou durante o envio), reaproveitando `FEEDBACK_STATUSES`/`STATUS_LABELS` já existentes. Depois de salvar, chama `reload()` do próprio modal e um `onStatusChanged` que também recarrega a lista de fora — pra tudo ficar consistente sem reload da página.
- **Sugestão incompleta que um teste E2E meu pegou:** a primeira versão do `useFeedbackDetail` recarregava o detalhe voltando pro estado `"loading"` a cada `reload()`. Isso fazia o modal inteiro sumir e mostrar só "Carregando…" por um instante toda vez que eu salvava uma anotação ou trocava o status — inclusive apagando a mensagem "Status atualizado com sucesso." antes de eu conseguir vê-la, porque o efeito que sincroniza o select também resetava a mensagem de sucesso a cada mudança de estado (não só quando o status realmente mudava).
- Como percebi: rodei o fluxo de verdade com Playwright (tentar concluir crítico sem nota → 422 na tela; adicionar nota; concluir de novo → sucesso) e reparei que a mensagem verde não aparecia no screenshot final, mesmo o status tendo mudado certo no banco.
- Corrigido para: o hook agora só mostra "Carregando…" na primeira busca — num reload, mantém os dados antigos na tela até os novos chegarem (sem piscar). E o efeito que sincroniza o select passou a depender só do valor do status (não do objeto inteiro), então só reresolve a mensagem de sucesso quando o usuário troca a seleção de novo, não a cada atualização em segundo plano.
- Como validei: refiz o teste E2E completo com Playwright — feedback crítico sem nota mostrando a mensagem exata do backend ("Adicione pelo menos uma anotação antes de concluir um feedback crítico."), depois com nota concluindo com sucesso, mensagem verde visível, badge atualizado no modal E na lista de fora (sem reload da página). Também rodei os 31 testes automatizados de novo (sem regressão) e testei a regra do zero via `curl` direto na API.

### 2026-08-27 | Auditoria final contra o documento original do desafio
- Pedi: verificar se o projeto está 100% de acordo com o documento completo do desafio (eu tinha colado só um resumo antes; Pedro colou o texto completo agora).
- Revisei item por item as seções 5 a 7, 10 e 15 (checklist oficial) contra o que foi implementado.
- **Gap real encontrado:** a seção 6.5 exige explicitamente "A interface deverá informar se a anotação foi cadastrada com sucesso." O formulário de anotação (Fase 9) só mostrava erro — a anotação aparecer na lista era a única confirmação implícita, sem mensagem explícita de sucesso (diferente da troca de status, que já tinha isso desde a Fase 10).
- Corrigido para: adicionei `submitSuccess` no `FeedbackDetailModal`, com a mensagem "Anotação cadastrada com sucesso." aparecendo depois do cadastro (mesmo padrão da mensagem de status), e resetando ao digitar de novo no campo.
- Como validei: `npx tsc --noEmit` + `npm run build` sem erros, teste E2E com Playwright confirmando a mensagem aparecendo depois de cadastrar uma anotação real, e os 31 testes automatizados de novo sem regressão.
- Resto da auditoria (schema de dados, rotas e formato de body exatos da seção 7, `.gitignore` sem vazar `.env`/`*.db`/client gerado do Prisma, seção 4 dizendo explicitamente que não havia projeto base): tudo confere com o que foi construído.

### 2026-08-27 | Fase 11 — AI_USAGE.md final
- Pedi: escrever o `AI_USAGE.md` final, verificar antes que não existia um parecido, e revalidar contra a documentação do desafio.
- Confirmado: não havia nenhum `AI_USAGE.md` nem arquivo parecido no repositório antes desta fase.
- IA montou o documento seguindo exatamente a estrutura da seção 9 do desafio (7 seções, mesmos títulos, mesma ordem), puxando o conteúdo deste log: ferramentas utilizadas, como a IA foi usada, 3 exemplos reais de interação, a situação da busca acentuada como sugestão incorreta principal (mais duas menores), os métodos de validação usados ao longo do projeto, duas decisões técnicas com alternativas comparadas (400/422 e banco real vs. mock), e domínio da solução.
- Como validei: conferi cada afirmação do documento contra este log e contra o código real (nenhuma alegação inventada — tudo rastreável a uma fase específica), e conferi os 7 títulos do documento contra os 7 títulos exigidos na seção 9, na mesma ordem.
- Observação: a seção "Domínio da solução" é uma reflexão pessoal — revisar antes da entrevista técnica, já que é exatamente o tipo de pergunta que pode ser feita na conversa técnica (seção 14 do desafio).

<!-- Continue adicionando uma entrada por decisão/dúvida relevante nas próximas fases.
     Preste atenção especial a qualquer sugestão que precisar corrigir - isso vira
     a seção "Sugestão incorreta ou incompleta" do AI_USAGE.md. -->
