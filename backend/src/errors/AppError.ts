export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/** Entrada malformada/ausente (ex.: status fora do enum, descrição vazia). */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/** Requisição bem-formada, mas que viola uma regra de negócio (ex.: 6.7 do desafio). */
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422);
    this.name = "BusinessRuleError";
  }
}
