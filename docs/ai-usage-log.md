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

<!-- Continue adicionando uma entrada por decisão/dúvida relevante nas próximas fases.
     Preste atenção especial a qualquer sugestão que precisar corrigir - isso vira
     a seção "Sugestão incorreta ou incompleta" do AI_USAGE.md. -->
