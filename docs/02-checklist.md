# Checklist (seção 15 do desafio) x Fases

- [x] Backend inicia corretamente (`/health` responde) -> Fase 1 (setup)
- [x] Frontend inicia corretamente             -> Fase 6
- [x] Banco configurável via README             -> Fase 1 (setup) + Fase 11 (README)
- [x] API de listagem de feedbacks funciona (`GET /api/feedbacks`, testado via curl + 31 testes automatizados) -> Fase 4/5, consumida na UI -> Fase 7
- [x] API de filtros combináveis funciona (channel+status+rating+search, com acento/maiúscula corrigido), UI de filtros ligada e testada -> Fase 4/5/8
- [x] Indicadores respeitam filtros ativos (testado e coberto por teste automatizado, renderizados na UI) -> Fase 3/4/5/7
- [x] API de detalhes de um feedback funciona, modal de detalhe na UI -> Fase 4/5/9
- [x] API de cadastro de anotação funciona (valida vazio/espaço, 201 ao criar), formulário na UI -> Fase 4/5/9
- [x] Nova anotação aparece na UI sem reload manual (testado com Playwright) -> Fase 9
- [x] API de alteração de status funciona (valida enum) -> Fase 4/5 (falta o frontend, Fase 10)
- [x] Regra de feedback crítico validada no backend (curl + testes automatizados) -> Fase 3/4/5
- [x] Testes automatizados (diferencial) -> Fase 5 — 31 testes (service + validation), Vitest
- [ ] README.md completo                          -> Fase 11
- [ ] AI_USAGE.md preenchido                       -> Fase 11
- [ ] Nenhuma credencial real publicada             -> Fase 11 (revisão final)
