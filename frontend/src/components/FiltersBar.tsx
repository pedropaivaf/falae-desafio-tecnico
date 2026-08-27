import type { ChangeEvent } from "react";
import { FEEDBACK_CHANNELS, FEEDBACK_STATUSES } from "../types/feedback";
import type { FeedbackChannel, FeedbackStatus } from "../types/feedback";
import { CHANNEL_LABELS } from "./ChannelBadge";
import { STATUS_LABELS } from "./StatusBadge";

export type FiltersBarValue = {
  search: string;
  channel: FeedbackChannel | "";
  status: FeedbackStatus | "";
  rating: "" | 1 | 2 | 3 | 4 | 5;
};

export const EMPTY_FILTERS_VALUE: FiltersBarValue = {
  search: "",
  channel: "",
  status: "",
  rating: "",
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

const selectClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-600";

type FiltersBarProps = {
  value: FiltersBarValue;
  onChange: (value: FiltersBarValue) => void;
};

export function FiltersBar({ value, onChange }: FiltersBarProps) {
  const hasActiveFilters =
    value.search !== "" || value.channel !== "" || value.status !== "" || value.rating !== "";

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, search: event.target.value });
  }

  function handleChannelChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...value, channel: event.target.value as FeedbackChannel | "" });
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...value, status: event.target.value as FeedbackStatus | "" });
  }

  function handleRatingChange(event: ChangeEvent<HTMLSelectElement>) {
    const raw = event.target.value;
    onChange({ ...value, rating: raw === "" ? "" : (Number(raw) as 1 | 2 | 3 | 4 | 5) });
  }

  function handleClear() {
    onChange(EMPTY_FILTERS_VALUE);
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="filter-search" className={labelClass}>
          Buscar
        </label>
        <input
          id="filter-search"
          type="text"
          value={value.search}
          onChange={handleSearchChange}
          placeholder="Nome ou comentário..."
          className={`w-full ${selectClass}`}
        />
      </div>

      <div>
        <label htmlFor="filter-channel" className={labelClass}>
          Canal
        </label>
        <select
          id="filter-channel"
          value={value.channel}
          onChange={handleChannelChange}
          className={selectClass}
        >
          <option value="">Todos</option>
          {FEEDBACK_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {CHANNEL_LABELS[channel]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className={labelClass}>
          Status
        </label>
        <select
          id="filter-status"
          value={value.status}
          onChange={handleStatusChange}
          className={selectClass}
        >
          <option value="">Todos</option>
          {FEEDBACK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-rating" className={labelClass}>
          Nota
        </label>
        <select
          id="filter-rating"
          value={value.rating}
          onChange={handleRatingChange}
          className={selectClass}
        >
          <option value="">Todas</option>
          {RATING_OPTIONS.map((rating) => (
            <option key={rating} value={rating}>
              {rating} {rating === 1 ? "estrela" : "estrelas"}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md px-3 py-2 text-sm font-medium text-brand-teal hover:bg-brand-teal-tint"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
