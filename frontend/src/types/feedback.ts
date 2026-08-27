export const FEEDBACK_CHANNELS = ["GOOGLE", "IFOOD", "PESQUISA"] as const;
export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];

export const FEEDBACK_STATUSES = ["NOVO", "EM_ANALISE", "CONCLUIDO"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type Feedback = {
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  channel: FeedbackChannel;
  status: FeedbackStatus;
  createdAt: string;
};

export type FeedbackNote = {
  id: number;
  feedbackId: number;
  description: string;
  createdAt: string;
};

export type FeedbackDetail = Feedback & { notes: FeedbackNote[] };

export type FeedbackIndicators = {
  total: number;
  averageRating: number;
  positiveCount: number;
  criticalCount: number;
};

export type FeedbackListResponse = {
  data: Feedback[];
  indicators: FeedbackIndicators;
};

export type FeedbackFilters = {
  search?: string;
  channel?: FeedbackChannel;
  status?: FeedbackStatus;
  rating?: number;
};
