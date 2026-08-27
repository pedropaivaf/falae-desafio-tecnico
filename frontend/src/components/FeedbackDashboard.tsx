import { useMemo, useState } from "react";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { IndicatorsBar } from "./IndicatorsBar";
import { FeedbackListItem } from "./FeedbackListItem";
import { FiltersBar, EMPTY_FILTERS_VALUE, type FiltersBarValue } from "./FiltersBar";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import type { FeedbackFilters } from "../types/feedback";

const SEARCH_DEBOUNCE_MS = 350;

export function FeedbackDashboard() {
  const [filtersInput, setFiltersInput] = useState<FiltersBarValue>(EMPTY_FILTERS_VALUE);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(filtersInput.search, SEARCH_DEBOUNCE_MS);

  // Filtros de texto/canal/status/nota já ligados na API real (Fase 8).
  const filters = useMemo<FeedbackFilters>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      channel: filtersInput.channel || undefined,
      status: filtersInput.status || undefined,
      rating: filtersInput.rating === "" ? undefined : filtersInput.rating,
    }),
    [debouncedSearch, filtersInput.channel, filtersInput.status, filtersInput.rating]
  );

  const hasActiveFilters = Boolean(
    filters.search || filters.channel || filters.status || filters.rating
  );

  const state = useFeedbacks(filters);

  return (
    <div className="mx-auto max-w-4xl">
      <FiltersBar value={filtersInput} onChange={setFiltersInput} />

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
          <p className="p-8 text-center text-slate-500">
            {hasActiveFilters
              ? "Nenhum feedback encontrado com os filtros aplicados."
              : "Nenhum feedback encontrado."}
          </p>
        )}

        {state.status === "success" && state.data.length > 0 && (
          <ul>
            {state.data.map((feedback) => (
              <FeedbackListItem
                key={feedback.id}
                feedback={feedback}
                onClick={() => setSelectedFeedbackId(feedback.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {selectedFeedbackId !== null && (
        <FeedbackDetailModal
          feedbackId={selectedFeedbackId}
          onClose={() => setSelectedFeedbackId(null)}
          onStatusChanged={state.reload}
        />
      )}
    </div>
  );
}
