import type {
  Feedback,
  FeedbackDetail,
  FeedbackFilters,
  FeedbackListResponse,
  FeedbackNote,
  FeedbackStatus,
} from "../types/feedback";

const BASE_URL = "/api/feedbacks";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se o backend está rodando.",
      0
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && String(body.error)) ||
      "Erro inesperado ao comunicar com a API.";
    throw new ApiError(message, response.status);
  }

  return body as T;
}

function buildQuery(filters: FeedbackFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.channel) params.set("channel", filters.channel);
  if (filters.status) params.set("status", filters.status);
  if (filters.rating !== undefined) params.set("rating", String(filters.rating));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listFeedbacks(filters: FeedbackFilters): Promise<FeedbackListResponse> {
  return request<FeedbackListResponse>(`${BASE_URL}${buildQuery(filters)}`);
}

export function getFeedback(id: number): Promise<FeedbackDetail> {
  return request<FeedbackDetail>(`${BASE_URL}/${id}`);
}

export function getFeedbackNotes(id: number): Promise<FeedbackNote[]> {
  return request<FeedbackNote[]>(`${BASE_URL}/${id}/notes`);
}

export function createFeedbackNote(id: number, description: string): Promise<FeedbackNote> {
  return request<FeedbackNote>(`${BASE_URL}/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export function updateFeedbackStatus(id: number, status: FeedbackStatus): Promise<Feedback> {
  return request<Feedback>(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
