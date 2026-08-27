import { useState } from "react";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { IndicatorsBar } from "./IndicatorsBar";
import { FeedbackListItem } from "./FeedbackListItem";
import type { FeedbackFilters } from "../types/feedback";

export function FeedbackDashboard() {
  // Os filtros de verdade (busca/canal/status/nota) entram na próxima fase;
  // por enquanto a lista completa já vem com indicadores e os 3 estados.
  const [filters] = useState<FeedbackFilters>({});
  const state = useFeedbacks(filters);

  return (
    <div className="mx-auto max-w-4xl">
      {state.status === "success" && <IndicatorsBar indicators={state.indicators} />}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        {state.status === "loading" && (
          <p className="p-8 text-center text-slate-500">Carregando feedbacks…</p>
        )}

        {state.status === "error" && (
          <div className="p-8 text-center">
            <p className="font-medium text-red-600">Não foi possível carregar os feedbacks.</p>
            <p className="mt-1 text-sm text-slate-500">{state.message}</p>
            <button
              type="button"
              onClick={state.reload}
              className="mt-4 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-hover"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {state.status === "success" && state.data.length === 0 && (
          <p className="p-8 text-center text-slate-500">Nenhum feedback encontrado.</p>
        )}

        {state.status === "success" && state.data.length > 0 && (
          <ul>
            {state.data.map((feedback) => (
              <FeedbackListItem key={feedback.id} feedback={feedback} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
