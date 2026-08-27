import type { Feedback } from "../types/feedback";
import { StarRating } from "./StarRating";
import { ChannelBadge } from "./ChannelBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../utils/formatDate";

export function FeedbackListItem({ feedback }: { feedback: Feedback }) {
  return (
    <li className="flex flex-col gap-2 border-b border-slate-200 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900">{feedback.customerName}</span>
          <StarRating rating={feedback.rating} />
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">
          {feedback.comment ?? "Sem comentário."}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <ChannelBadge channel={feedback.channel} />
        <StatusBadge status={feedback.status} />
        <span className="text-xs whitespace-nowrap text-slate-400">
          {formatDate(feedback.createdAt)}
        </span>
      </div>
    </li>
  );
}
