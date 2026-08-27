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

  // Recarrega o detalhe (com as notas/status atualizados) sem precisar de
  // reload da página — usado depois de criar uma anotação ou trocar o status.
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    // Só mostra a tela de "Carregando…" na primeira busca. Num reload
    // (depois de salvar algo) mantém os dados anteriores na tela em vez de
    // trocar tudo por um esqueleto de carregamento — evita o piscar da UI.
    setState((prev) => (prev.status === "success" ? prev : { status: "loading" }));

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
