import { Request, Response } from "express";
import * as feedbackService from "./feedback.service";
import {
  parseFeedbackId,
  parseFeedbackFilters,
  parseNoteDescription,
  parseStatusBody,
} from "./feedback.validation";

export async function list(req: Request, res: Response) {
  const filters = parseFeedbackFilters(req.query as Record<string, unknown>);
  const result = await feedbackService.listFeedbacks(filters);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const id = parseFeedbackId(req.params.id);
  const feedback = await feedbackService.getFeedbackById(id);
  res.json(feedback);
}

export async function listNotes(req: Request, res: Response) {
  const id = parseFeedbackId(req.params.id);
  const notes = await feedbackService.getFeedbackNotes(id);
  res.json(notes);
}

export async function createNote(req: Request, res: Response) {
  const id = parseFeedbackId(req.params.id);
  const description = parseNoteDescription(req.body ?? {});
  const note = await feedbackService.createFeedbackNote(id, description);
  res.status(201).json(note);
}

export async function updateStatus(req: Request, res: Response) {
  const id = parseFeedbackId(req.params.id);
  const status = parseStatusBody(req.body ?? {});
  const feedback = await feedbackService.changeFeedbackStatus(id, status);
  res.json(feedback);
}
