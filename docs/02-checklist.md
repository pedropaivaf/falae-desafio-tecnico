# Checklist (seção 15 do desafio) x Fases

- [x] Backend inicia corretamente (`/health` responde) -> Fase 1 (setup)
- [ ] Frontend inicia corretamente             -> Fase 6
- [x] Banco configurável via README             -> Fase 1 (setup) + Fase 11 (README)
- [x] API de listagem de feedbacks funciona (`GET /api/feedbacks`, testado via curl) -> Fase 4 (falta o frontend consumir, Fase 7)
- [x] API de filtros combináveis funciona (channel+status+rating+search, testado via curl) -> Fase 4 (falta o frontend, Fase 8)
- [x] Indicadores respeitam filtros ativos (testado via curl e com script direto no service) -> Fase 3 + Fase 4
- [x] API de detalhes de um feedback funciona -> Fase 4 (falta o frontend, Fase 9)
- [x] API de cadastro de anotação funciona (valida vazio/espaço, 201 ao criar) -> Fase 4 (falta o frontend, Fase 9)
- [ ] Nova anotação aparece na UI sem reload manual      -> Fase 9
- [x] API de alteração de status funciona (valida enum) -> Fase 4 (falta o frontend, Fase 10)
- [x] Regra de feedback crítico validada no backend (testado end-to-end via curl: 422 sem anotação, 200 com anotação) -> Fase 3 + Fase 4
- [ ] README.md completo                          -> Fase 11
- [ ] AI_USAGE.md preenchido                       -> Fase 11
- [ ] Nenhuma credencial real publicada             -> Fase 11 (revisão final)
