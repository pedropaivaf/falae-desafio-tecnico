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

<!-- Continue adicionando uma entrada por decisão/dúvida relevante nas próximas fases.
     Preste atenção especial a qualquer sugestão que precisar corrigir - isso vira
     a seção "Sugestão incorreta ou incompleta" do AI_USAGE.md. -->
