import type { FeedbackStatus } from "../types/feedback";

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONCLUIDO: "Concluído",
};

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  NOVO: "bg-brand-teal-tint text-brand-teal-dark",
  EM_ANALISE: "bg-brand-orange-tint text-brand-orange-hover",
  CONCLUIDO: "bg-green-50 text-green-700",
};

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
