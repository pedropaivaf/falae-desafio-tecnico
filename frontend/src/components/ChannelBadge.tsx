import type { FeedbackChannel } from "../types/feedback";

export const CHANNEL_LABELS: Record<FeedbackChannel, string> = {
  GOOGLE: "Google",
  IFOOD: "iFood",
  PESQUISA: "Pesquisa",
};

export function ChannelBadge({ channel }: { channel: FeedbackChannel }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {CHANNEL_LABELS[channel]}
    </span>
  );
}
