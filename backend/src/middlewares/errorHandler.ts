import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Corpo JSON malformado (gerado pelo express.json()).
  if (err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400) {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição." });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno no servidor." });
}
