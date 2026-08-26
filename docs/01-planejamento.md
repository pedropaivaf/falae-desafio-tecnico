# Planejamento — Falaê Feedback Challenge

## Estrutura do repositório
```
falae/
├── backend/
│   ├── src/
│   │   ├── db/prisma.ts
│   │   ├── constants/feedback.ts       # channels/status + validação
│   │   ├── modules/feedback/
│   │   │   ├── feedback.routes.ts
│   │   │   ├── feedback.controller.ts
│   │   │   ├── feedback.service.ts
│   │   │   └── feedback.validation.ts
│   │   ├── middlewares/errorHandler.ts
│   │   ├── errors/AppError.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/schema.prisma, migrations/, seed.ts
│   ├── generated/prisma/       # client gerado pelo Prisma (gitignored)
│   ├── tests/feedback.service.test.ts
│   ├── prisma.config.ts
│   ├── .env.example
│   └── package.json / tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/feedbacks.ts
│   │   ├── types/feedback.ts
│   │   ├── hooks/useFeedbacks.ts, useFeedbackDetail.ts
│   │   ├── components/ (FeedbackList, FeedbackFilters, Indicators, FeedbackDetailModal, NoteForm, StatusSelect...)
│   │   └── App.tsx / main.tsx
│   └── package.json / vite.config.ts / tailwind.config.js
├── docs/                # planejamento interno (não exigido pelo desafio)
├── README.md
├── AI_USAGE.md
└── .gitignore
```

## Decisões técnicas
| Decisão | Escolha | Motivo |
|---|---|---|
| Backend | Express 5 + TypeScript | Stack já dominada; Express 5 é a versão estável atual |
| ORM/Banco | Prisma 7.10.0 + SQLite | Zero config para quem avaliar |
| Enums | `String` no schema + constantes TS (não `enum` do Prisma) | SQLite não suporta enum nativo no Prisma |
| Prisma Client | Via driver adapter (`@prisma/adapter-better-sqlite3`) | Obrigatório no Prisma 7; client é gerado em `generated/prisma`, não em `node_modules` |
| Config do Prisma | `prisma.config.ts` (datasource url + caminho do seed) | Prisma 7 moveu essa config para fora do `schema.prisma`/`package.json` |
| Validação | Funções manuais, sem lib externa | Regras simples, sem dependência extra |
| Indicadores | Junto de `GET /api/feedbacks` (`indicators`) | Evita 2ª requisição e dessincronia com filtros |
| Detalhe do feedback | Modal | Prioriza simplicidade (6.4 do desafio deixa livre) |
| Frontend state | useState/useEffect + hooks próprios | App pequena, fácil de explicar |
| CORS | Proxy do Vite (`/api`) | Evita middleware extra e configuração de origem |
| Estilo | Tailwind puro | Rápido, sem lib de componentes |
| Testes | Vitest, unitários no service | Cobre a regra crítica sem subir servidor |

## Modelo de dados (Prisma)
Enum lógico da aplicação (TypeScript, não Prisma): `FeedbackChannel = GOOGLE | IFOOD | PESQUISA`, `FeedbackStatus = NOVO | EM_ANALISE | CONCLUIDO`.

```
model Feedback { id, customerName, rating(Int), comment(String?), channel(String), status(String), createdAt, notes[] }
model FeedbackNote { id, feedbackId, description, createdAt }
```

## Rotas
```
GET    /api/feedbacks              -> lista + filtros (search, channel, status, rating) + indicators
GET    /api/feedbacks/:id          -> detalhe
GET    /api/feedbacks/:id/notes    -> anotações
POST   /api/feedbacks/:id/notes    -> cria anotação
PATCH  /api/feedbacks/:id/status   -> troca status (valida enum + regra do crítico, 422 se bloqueado)
```

## Regra de negócio
Feedback com `rating` 1 ou 2 só pode virar `CONCLUIDO` se possuir >= 1 `FeedbackNote`.
Validação obrigatória no service (nunca só no frontend).

## Seed
`prisma/seed.ts` cria 12 feedbacks (5 críticos, 5 positivos, 2 neutros; distribuídos nos 3 canais; datas espalhadas nos últimos 11 dias) e 4 anotações. Os 2 críticos já `CONCLUIDO` possuem anotação, respeitando a regra de negócio.
