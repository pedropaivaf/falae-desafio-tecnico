import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, createFeedbackNote } from "../api/feedbacks";
import { useFeedbackDetail } from "../hooks/useFeedbackDetail";
import { formatDate } from "../utils/formatDate";
import { StarRating } from "./StarRating";
import { ChannelBadge } from "./ChannelBadge";
import { StatusBadge } from "./StatusBadge";

type FeedbackDetailModalProps = {
  feedbackId: number;
  onClose: () => void;
};

export function FeedbackDetailModal({ feedbackId, onClose }: FeedbackDetailModalProps) {
  const { state, reload } = useFeedbackDetail(feedbackId);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fecha com Esc, igual qualquer modal padrão.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmitNote(event: FormEvent) {
    event.preventDefault();
    if (noteText.trim().length === 0 || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createFeedbackNote(feedbackId, noteText.trim());
      setNoteText("");
      reload(); // atualiza a lista de anotações sem recarregar a página
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro inesperado.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {state.status === "loading" && (
          <p className="p-8 text-center text-slate-500">Carregando…</p>
        )}

        {state.status === "error" && (
          <div className="p-8 text-center">
            <p className="font-medium text-red-600">Não foi possível carregar o feedback.</p>
            <p className="mt-1 text-sm text-slate-500">{state.message}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-hover"
            >
              Fechar
            </button>
          </div>
        )}

        {state.status === "success" && (
          <>
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {state.data.customerName}
                  </h2>
                  <StarRating rating={state.data.rating} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ChannelBadge channel={state.data.channel} />
                  <StatusBadge status={state.data.status} />
                  <span className="text-xs text-slate-400">
                    {formatDate(state.data.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-700">
                {state.data.comment ?? "Sem comentário."}
              </p>

              <h3 className="mt-6 text-sm font-semibold text-slate-900">Anotações internas</h3>

              {state.data.notes.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Nenhuma anotação ainda.</p>
              ) : (
                <ul className="mt-2 space-y-3">
                  {state.data.notes.map((note) => (
                    <li key={note.id} className="rounded-md bg-slate-50 p-3">
                      <p className="text-sm text-slate-700">{note.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmitNote} className="mt-4">
                <label htmlFor="note-description" className="sr-only">
                  Nova anotação
                </label>
                <textarea
                  id="note-description"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Adicionar anotação..."
                  rows={2}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none"
                />
                {submitError && <p className="mt-1 text-sm text-red-600">{submitError}</p>}
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={noteText.trim().length === 0 || submitting}
                    className="rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Adicionando…" : "Adicionar anotação"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
