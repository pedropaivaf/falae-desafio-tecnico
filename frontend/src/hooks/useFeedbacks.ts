import { useCallback, useEffect, useState } from "react";
import { ApiError, listFeedbacks } from "../api/feedbacks";
import type { Feedback, FeedbackFilters, FeedbackIndicators } from "../types/feedback";

type FeedbacksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Feedback[]; indicators: FeedbackIndicators };

export function useFeedbacks(filters: FeedbackFilters) {
  const [state, setState] = useState<FeedbacksState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  // Serializa os filtros pra não refazer a busca por causa de uma nova
  // referência de objeto a cada render (o valor em si pode não ter mudado).
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    listFeedbacks(JSON.parse(filtersKey))
      .then((result) => {
        if (cancelled) return;
        setState({ status: "success", data: result.data, indicators: result.indicators });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof ApiError ? error.message : "Erro inesperado.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [filtersKey, reloadToken]);

  return { ...state, reload };
}
