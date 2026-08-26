import { Router } from "express";
import * as feedbackController from "./feedback.controller";

export const feedbackRouter = Router();

feedbackRouter.get("/", feedbackController.list);
feedbackRouter.get("/:id", feedbackController.getById);
feedbackRouter.get("/:id/notes", feedbackController.listNotes);
feedbackRouter.post("/:id/notes", feedbackController.createNote);
feedbackRouter.patch("/:id/status", feedbackController.updateStatus);
