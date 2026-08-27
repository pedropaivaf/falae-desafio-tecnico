import type { FeedbackIndicators } from "../types/feedback";

export function IndicatorsBar({ indicators }: { indicators: FeedbackIndicators }) {
  const items: { label: string; value: string | number; accent?: string }[] = [
    { label: "Total de feedbacks", value: indicators.total },
    { label: "Nota média", value: indicators.averageRating.toFixed(1).replace(".", ",") },
    { label: "Positivos (4-5)", value: indicators.positiveCount, accent: "text-green-600" },
    { label: "Críticos (1-2)", value: indicators.criticalCount, accent: "text-brand-orange" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${item.accent ?? "text-slate-900"}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
