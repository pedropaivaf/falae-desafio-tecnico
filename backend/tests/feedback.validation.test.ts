import { describe, expect, it } from "vitest";
import {
  parseFeedbackId,
  parseFeedbackFilters,
  parseNoteDescription,
  parseStatusBody,
} from "../src/modules/feedback/feedback.validation";
import { ValidationError } from "../src/errors/AppError";

describe("parseFeedbackId", () => {
  it("aceita um id numérico válido", () => {
    expect(parseFeedbackId("42")).toBe(42);
  });

  it.each(["abc", "-1", "0", "1.5", undefined])("rejeita id inválido: %s", (value) => {
    expect(() => parseFeedbackId(value)).toThrow(ValidationError);
  });
});

describe("parseFeedbackFilters", () => {
  it("monta os filtros a partir de query params válidos", () => {
    const filters = parseFeedbackFilters({
      channel: "GOOGLE",
      status: "NOVO",
      rating: "2",
      search: "  atendimento  ",
    });

    expect(filters).toEqual({
      channel: "GOOGLE",
      status: "NOVO",
      rating: 2,
      search: "atendimento",
    });
  });

  it("ignora filtros não enviados", () => {
    expect(parseFeedbackFilters({})).toEqual({});
  });

  it("rejeita canal fora do enum (ex.: WHATSAPP)", () => {
    expect(() => parseFeedbackFilters({ channel: "WHATSAPP" })).toThrow(ValidationError);
  });

  it("rejeita status fora do enum", () => {
    expect(() => parseFeedbackFilters({ status: "PENDENTE" })).toThrow(ValidationError);
  });

  it("rejeita nota fora do intervalo 1-5", () => {
    expect(() => parseFeedbackFilters({ rating: "6" })).toThrow(ValidationError);
    expect(() => parseFeedbackFilters({ rating: "0" })).toThrow(ValidationError);
  });
});

describe("parseNoteDescription", () => {
  it("rejeita quando o campo não é enviado", () => {
    expect(() => parseNoteDescription({})).toThrow(ValidationError);
  });

  it("rejeita quando o campo não é string", () => {
    expect(() => parseNoteDescription({ description: 123 })).toThrow(ValidationError);
  });

  it("aceita string (validação de vazio/espaço fica por conta do service)", () => {
    expect(parseNoteDescription({ description: "ok" })).toBe("ok");
  });
});

describe("parseStatusBody", () => {
  it("rejeita quando o campo não é enviado", () => {
    expect(() => parseStatusBody({})).toThrow(ValidationError);
  });

  it("aceita string (validação do enum fica por conta do service)", () => {
    expect(parseStatusBody({ status: "CONCLUIDO" })).toBe("CONCLUIDO");
  });
});
