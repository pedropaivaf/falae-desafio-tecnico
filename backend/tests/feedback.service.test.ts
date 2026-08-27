import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/db/prisma";
import {
  listFeedbacks,
  getFeedbackById,
  getFeedbackNotes,
  createFeedbackNote,
  changeFeedbackStatus,
} from "../src/modules/feedback/feedback.service";
import { NotFoundError, ValidationError, BusinessRuleError } from "../src/errors/AppError";

async function seedFixtures() {
  await prisma.feedbackNote.deleteMany();
  await prisma.feedback.deleteMany();

  await prisma.feedback.createMany({
    data: [
      {
        id: 1,
        customerName: "Cliente Positivo",
        rating: 5,
        comment: "Ótimo!",
        channel: "GOOGLE",
        status: "NOVO",
        createdAt: new Date("2026-08-01"),
      },
      {
        id: 2,
        customerName: "Cliente Critico Sem Nota",
        rating: 1,
        comment: "Péssimo.",
        channel: "IFOOD",
        status: "NOVO",
        createdAt: new Date("2026-08-02"),
      },
      {
        id: 3,
        customerName: "Cliente Critico Com Nota",
        rating: 2,
        comment: "Ruim.",
        channel: "PESQUISA",
        status: "EM_ANALISE",
        createdAt: new Date("2026-08-03"),
      },
      {
        id: 4,
        customerName: "Cliente Neutro",
        rating: 3,
        comment: null,
        channel: "GOOGLE",
        status: "NOVO",
        createdAt: new Date("2026-08-04"),
      },
    ],
  });

  await prisma.feedbackNote.create({
    data: { feedbackId: 3, description: "Já entramos em contato com o cliente." },
  });
}

beforeEach(async () => {
  await seedFixtures();
});

describe("listFeedbacks", () => {
  it("aplica filtros e calcula os indicadores só sobre o resultado filtrado", async () => {
    const result = await listFeedbacks({ channel: "GOOGLE" });

    expect(result.data).toHaveLength(2);
    expect(result.indicators).toEqual({
      total: 2,
      averageRating: 4, // (5 + 3) / 2
      positiveCount: 1,
      criticalCount: 0,
    });
  });

  it("retorna indicadores coerentes quando não há resultados (nunca NaN)", async () => {
    const result = await listFeedbacks({ channel: "GOOGLE", rating: 1 });

    expect(result.indicators).toEqual({
      total: 0,
      averageRating: 0,
      positiveCount: 0,
      criticalCount: 0,
    });
  });

  it("busca por nome ou comentário sem diferenciar maiúsculas/minúsculas", async () => {
    const result = await listFeedbacks({ search: "PÉSSIMO" });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].customerName).toBe("Cliente Critico Sem Nota");
  });

  it("ordena do feedback mais recente para o mais antigo", async () => {
    const result = await listFeedbacks({});
    const timestamps = result.data.map((f) => f.createdAt.getTime());

    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });
});

describe("createFeedbackNote", () => {
  it("rejeita descrição vazia", async () => {
    await expect(createFeedbackNote(1, "")).rejects.toThrow(ValidationError);
  });

  it("rejeita descrição contendo só espaços", async () => {
    await expect(createFeedbackNote(1, "    ")).rejects.toThrow(ValidationError);
  });

  it("cria a anotação removendo espaços das pontas", async () => {
    const note = await createFeedbackNote(1, "  Retorno dado ao cliente  ");
    expect(note.description).toBe("Retorno dado ao cliente");
  });

  it("lança NotFoundError para feedback inexistente", async () => {
    await expect(createFeedbackNote(9999, "teste")).rejects.toThrow(NotFoundError);
  });
});

describe("changeFeedbackStatus — regra do feedback crítico (seção 6.7)", () => {
  it("rejeita um status fora do enum", async () => {
    await expect(changeFeedbackStatus(1, "FINALIZADO")).rejects.toThrow(ValidationError);
  });

  it("bloqueia concluir feedback crítico (nota 1 ou 2) sem nenhuma anotação", async () => {
    await expect(changeFeedbackStatus(2, "CONCLUIDO")).rejects.toThrow(BusinessRuleError);
    await expect(changeFeedbackStatus(2, "CONCLUIDO")).rejects.toThrow(
      "Adicione pelo menos uma anotação antes de concluir um feedback crítico."
    );
  });

  it("permite concluir feedback crítico quando já existe anotação", async () => {
    const updated = await changeFeedbackStatus(3, "CONCLUIDO");
    expect(updated.status).toBe("CONCLUIDO");
  });

  it("permite concluir feedback não crítico mesmo sem anotação", async () => {
    const updated = await changeFeedbackStatus(1, "CONCLUIDO");
    expect(updated.status).toBe("CONCLUIDO");
  });

  it("lança NotFoundError para feedback inexistente", async () => {
    await expect(changeFeedbackStatus(9999, "CONCLUIDO")).rejects.toThrow(NotFoundError);
  });
});

describe("getFeedbackById / getFeedbackNotes", () => {
  it("retorna o feedback junto com suas anotações", async () => {
    const feedback = await getFeedbackById(3);
    expect(feedback.notes).toHaveLength(1);
    expect(feedback.notes[0].description).toContain("contato");
  });

  it("lança NotFoundError para id inexistente", async () => {
    await expect(getFeedbackById(9999)).rejects.toThrow(NotFoundError);
    await expect(getFeedbackNotes(9999)).rejects.toThrow(NotFoundError);
  });
});
