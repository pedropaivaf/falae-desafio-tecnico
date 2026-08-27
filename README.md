# Falaê! — Painel de Feedbacks

Desafio técnico para a vaga de desenvolvedor(a) estagiário(a) na Falaê!: uma aplicação para acompanhar feedbacks de clientes de um restaurante, com listagem, filtros, indicadores, anotações internas e controle de status — incluindo a regra de que um feedback crítico só pode ser concluído com pelo menos uma anotação.

## Tecnologias

**Backend:** Node.js, TypeScript, Express 5, Prisma 7 (com driver adapter `@prisma/adapter-better-sqlite3`), SQLite, Vitest.

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4.

Requisitos para rodar localmente: Node.js 20 ou superior (desenvolvido e testado com Node 22) e npm.

## Estrutura do repositório

```
falae/
├── backend/    # API REST (Express + Prisma + SQLite)
├── frontend/   # SPA (React + Vite + Tailwind)
├── docs/       # Planejamento, checklist e log de uso de IA (material de apoio, não faz parte do desafio)
├── README.md
└── AI_USAGE.md
```

## Como rodar o projeto

### 1. Backend

```bash
cd backend
npm install

# copie o arquivo de variáveis de ambiente
# (Windows: copy .env.example .env | Linux/Mac: cp .env.example .env)

npx prisma generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

O servidor sobe em `http://localhost:3333`. O `prisma:seed` popula o banco com 12 feedbacks de exemplo (críticos, positivos e neutros, nos 3 canais) e algumas anotações, já respeitando a regra do feedback crítico.

### 2. Frontend

Em outro terminal, com o backend já rodando:

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`. As chamadas para `/api` são redirecionadas para o backend via proxy do Vite (configurado em `vite.config.ts`), então não é preciso configurar CORS nem nenhuma variável de ambiente no frontend.

## Configuração do banco de dados

O banco é SQLite (arquivo local, sem necessidade de servidor externo), gerenciado pelo Prisma. O caminho do arquivo é definido pela variável `DATABASE_URL` e as migrações ficam versionadas em `backend/prisma/migrations`.

## Variáveis de ambiente

Arquivo `backend/.env` (baseado em `backend/.env.example`):

| Variável | Descrição | Valor padrão |
|---|---|---|
| `DATABASE_URL` | Caminho do arquivo SQLite | `file:./dev.db` |
| `PORT` | Porta em que a API sobe | `3333` |

O frontend não usa variáveis de ambiente — o endereço do backend é resolvido pelo proxy do Vite.

## Comandos disponíveis

**Backend** (`backend/`):

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API em modo desenvolvimento (watch) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Roda a API já compilada (`dist/server.js`) |
| `npm run prisma:migrate` | Aplica as migrações do Prisma |
| `npm run prisma:seed` | Popula o banco com os dados de exemplo |
| `npm test` | Roda a suíte de testes automatizados (Vitest) |

**Frontend** (`frontend/`):

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a aplicação em modo desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Roda o linter (oxlint) |

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Banco de dados | SQLite + Prisma 7 | Não exige instalar/configurar um servidor de banco separado — qualquer avaliador roda o projeto sem dependência externa |
| Canal/status | Campos `String` + constantes TypeScript, em vez de `enum` do Prisma | SQLite não suporta `enum` nativo no Prisma; a validação é feita manualmente na camada de validação |
| Busca por texto | Filtrada em JavaScript (normalizada, sem acento) em vez de `LIKE` do SQLite | O SQLite só ignora maiúscula/minúscula em caracteres ASCII por padrão — como o app é em português, a busca acentuada (é, ç, ã...) ficaria incorreta |
| Erros da API | `ValidationError` (400) para entrada mal formada vs. `BusinessRuleError` (422) para entrada válida que viola uma regra de negócio | Distinção padrão de REST; deixa a resposta da API mais precisa |
| Indicadores | Calculados junto da listagem (`GET /api/feedbacks`), já refletindo os filtros ativos | Evita uma segunda requisição e qualquer dessincronia entre lista e indicadores |
| Detalhe do feedback | Modal, em vez de uma página própria | Ponto explicitamente livre no desafio; modal mantém a navegação mais simples para esse escopo |
| CORS | Proxy `/api` do Vite, em vez de middleware de CORS no backend | Mais simples para desenvolvimento local, sem múltiplas origens |
| Estilo | Tailwind CSS puro (v4, config via `@theme` no CSS) | Sem dependência de biblioteca de componentes; paleta de cores extraída da logo real da Falaê! |
| Testes | Vitest, contra um banco SQLite de teste isolado (não mockado) | Para o tamanho do projeto, testar contra um banco real é mais simples e já encontrou um bug real (busca acentuada) que um mock não pegaria |

Mais detalhes de cada decisão, incluindo dificuldades reais encontradas no processo e como foram resolvidas, estão documentados no [`AI_USAGE.md`](./AI_USAGE.md).

## Funcionalidades concluídas

- [x] Listagem de feedbacks com indicadores (total, nota média, positivos, críticos)
- [x] Filtros combináveis: busca por nome/comentário, canal, status e nota — indicadores respeitam os filtros ativos
- [x] Detalhe do feedback em modal, com anotações internas
- [x] Cadastro de anotação interna, com atualização na tela sem reload
- [x] Regra de negócio: feedback crítico (nota 1 ou 2) só pode ser concluído com pelo menos uma anotação — validada na API (nunca só no frontend)
- [x] API completa: listagem+filtros, detalhe, anotações (listar/criar), alteração de status
- [x] Testes automatizados (31 testes: regras de negócio e validações)

## Pendências

- [ ] Alteração de status pela interface (a API já suporta e já é testada; falta o botão/seletor na tela)
- [ ] `AI_USAGE.md` final (o log de decisões já está sendo mantido em [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) ao longo do desenvolvimento)

## Uso de IA no desenvolvimento

Este projeto foi desenvolvido com apoio de IA. Os detalhes de como, onde e por quê estão em [`AI_USAGE.md`](./AI_USAGE.md).
