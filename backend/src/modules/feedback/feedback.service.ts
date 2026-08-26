import { prisma } from "../../db/prisma";
import { FEEDBACK_STATUSES, FeedbackStatus } from "../../constants/feedback";
import { NotFoundError, ValidationError, BusinessRuleError } from "../../errors/AppError";

const CRITICAL_RATINGS = [1, 2];
const POSITIVE_RATINGS = [4, 5];

export type FeedbackFilters = {
  search?: string;
  channel?: string;
  status?: string;
  rating?: number;
};

export async function listFeedbacks(filters: FeedbackFilters) {
  const feedbacks = await prisma.feedback.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
  });

  return {
    data: feedbacks,
    indicators: buildIndicators(feedbacks),
  };
}

function buildWhere(filters: FeedbackFilters) {
  const where: Record<string, unknown> = {};

  if (filters.channel) {
    where.channel = filters.channel;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.rating !== undefined) {
    where.rating = filters.rating;
  }

  if (filters.search) {
    where.OR = [
      { customerName: { contains: filters.search } },
      { comment: { contains: filters.search } },
    ];
  }

  return where;
}

function buildIndicators(feedbacks: { rating: number }[]) {
  const total = feedbacks.length;

  if (total === 0) {
    return { total: 0, averageRating: 0, positiveCount: 0, criticalCount: 0 };
  }

  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  const averageRating = Math.round((sum / total) * 10) / 10;
  const positiveCount = feedbacks.filter((f) => POSITIVE_RATINGS.includes(f.rating)).length;
  const criticalCount = feedbacks.filter((f) => CRITICAL_RATINGS.includes(f.rating)).length;

  return { total, averageRating, positiveCount, criticalCount };
}

export async function getFeedbackById(id: number) {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });

  if (!feedback) {
    throw new NotFoundError("Feedback não encontrado.");
  }

  return feedback;
}

export async function getFeedbackNotes(feedbackId: number) {
  await ensureFeedbackExists(feedbackId);

  return prisma.feedbackNote.findMany({
    where: { feedbackId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFeedbackNote(feedbackId: number, description: string) {
  await ensureFeedbackExists(feedbackId);

  const trimmed = description.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("A descrição da anotação não pode estar vazia.");
  }

  return prisma.feedbackNote.create({
    data: { feedbackId, description: trimmed },
  });
}

export async function changeFeedbackStatus(feedbackId: number, status: string) {
  if (!FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
    throw new ValidationError(
      `Status inválido. Use um dos valores: ${FEEDBACK_STATUSES.join(", ")}.`
    );
  }

  const feedback = await ensureFeedbackExists(feedbackId);
  const isCritical = CRITICAL_RATINGS.includes(feedback.rating);

  if (status === "CONCLUIDO" && isCritical) {
    const notesCount = await prisma.feedbackNote.count({ where: { feedbackId } });

    if (notesCount === 0) {
      throw new BusinessRuleError(
        "Adicione pelo menos uma anotação antes de concluir um feedback crítico."
      );
    }
  }

  return prisma.feedback.update({
    where: { id: feedbackId },
    data: { status },
  });
}

async function ensureFeedbackExists(feedbackId: number) {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });

  if (!feedback) {
    throw new NotFoundError("Feedback não encontrado.");
  }

  return feedback;
}
