export const FEEDBACK_CHANNELS = ["GOOGLE", "IFOOD", "PESQUISA"] as const;
export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];

export const FEEDBACK_STATUSES = ["NOVO", "EM_ANALISE", "CONCLUIDO"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
