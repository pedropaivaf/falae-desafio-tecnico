import { useCallback, useEffect, useState } from "react";
import { ApiError, getFeedback } from "../api/feedbacks";
import type { FeedbackDetail } from "../types/feedback";

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: FeedbackDetail };

export function useFeedbackDetail(feedbackId: number) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  // Recarrega o detalhe (com as notas atualizadas) sem precisar de reload
  // da página — usado depois de criar uma anotação nova.
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    getFeedback(feedbackId)
      .then((data) => {
        if (cancelled) return;
        setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof ApiError ? error.message : "Erro inesperado.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [feedbackId, reloadToken]);

  return { state, reload };
}
