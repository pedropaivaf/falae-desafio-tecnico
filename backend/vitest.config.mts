import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Os arquivos de teste compartilham o mesmo tests/test.db (recriado no
    // setup). Rodando em paralelo, dois arquivos recriam o banco ao mesmo
    // tempo e um deles falha com "table already exists" — mais visível no
    // Windows, onde o SO trava o arquivo com mais rigor. Roda em série.
    fileParallelism: false,
  },
});
