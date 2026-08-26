import {
  FEEDBACK_CHANNELS,
  FeedbackChannel,
  FEEDBACK_STATUSES,
  FeedbackStatus,
} from "../../constants/feedback";
import { ValidationError } from "../../errors/AppError";
import { FeedbackFilters } from "./feedback.service";

export function parseFeedbackId(rawId: unknown): number {
  if (typeof rawId !== "string") {
    throw new ValidationError("Id de feedback inválido.");
  }

  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Id de feedback inválido.");
  }

  return id;
}

export function parseFeedbackFilters(query: Record<string, unknown>): FeedbackFilters {
  const filters: FeedbackFilters = {};

  if (typeof query.search === "string" && query.search.trim().length > 0) {
    filters.search = query.search.trim();
  }

  if (query.channel !== undefined) {
    const channel = String(query.channel);
    if (!FEEDBACK_CHANNELS.includes(channel as FeedbackChannel)) {
      throw new ValidationError(
        `Canal inválido. Use um dos valores: ${FEEDBACK_CHANNELS.join(", ")}.`
      );
    }
    filters.channel = channel;
  }

  if (query.status !== undefined) {
    const status = String(query.status);
    if (!FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
      throw new ValidationError(
        `Status inválido. Use um dos valores: ${FEEDBACK_STATUSES.join(", ")}.`
      );
    }
    filters.status = status;
  }

  if (query.rating !== undefined) {
    const rating = Number(query.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("O filtro de nota deve ser um número inteiro entre 1 e 5.");
    }
    filters.rating = rating;
  }

  return filters;
}

export function parseNoteDescription(body: Record<string, unknown>): string {
  if (typeof body.description !== "string") {
    throw new ValidationError("O campo 'description' é obrigatório e deve ser um texto.");
  }

  return body.description;
}

export function parseStatusBody(body: Record<string, unknown>): string {
  if (typeof body.status !== "string") {
    throw new ValidationError("O campo 'status' é obrigatório e deve ser um texto.");
  }

  return body.status;
}
