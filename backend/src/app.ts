import express from "express";
import { feedbackRouter } from "./modules/feedback/feedback.routes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/feedbacks", feedbackRouter);

app.use(errorHandler);
