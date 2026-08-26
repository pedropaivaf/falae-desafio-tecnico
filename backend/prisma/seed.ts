import { prisma } from "../src/db/prisma";

function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

async function main() {
  await prisma.feedbackNote.deleteMany();
  await prisma.feedback.deleteMany();

  const diego = await prisma.feedback.create({
    data: {
      customerName: "Diego Martins",
      rating: 1,
      comment: "Encontrei um cabelo na comida.",
      channel: "GOOGLE",
      status: "CONCLUIDO",
      createdAt: daysAgo(9),
    },
  });

  const rafael = await prisma.feedback.create({
    data: {
      customerName: "Rafael Duarte",
      rating: 2,
      comment: "Comida boa mas demorou muito para chegar.",
      channel: "PESQUISA",
      status: "CONCLUIDO",
      createdAt: daysAgo(1),
    },
  });

  const helena = await prisma.feedback.create({
    data: {
      customerName: "Helena Rocha",
      rating: 2,
      comment: "Preço alto para o que oferece.",
      channel: "GOOGLE",
      status: "NOVO",
      createdAt: daysAgo(2),
    },
  });

  await prisma.feedback.createMany({
    data: [
      { customerName: "Ana Souza", rating: 5, comment: "Atendimento excelente, comida impecável!", channel: "GOOGLE", status: "NOVO", createdAt: daysAgo(0) },
      { customerName: "Carlos Lima", rating: 2, comment: "Pedido chegou frio e atrasado.", channel: "IFOOD", status: "EM_ANALISE", createdAt: daysAgo(3) },
      { customerName: "Beatriz Alves", rating: 4, comment: "Muito bom, só demorou um pouco.", channel: "PESQUISA", status: "CONCLUIDO", createdAt: daysAgo(5) },
      { customerName: "Fernanda Costa", rating: 3, comment: null, channel: "IFOOD", status: "NOVO", createdAt: daysAgo(4) },
      { customerName: "Gustavo Pereira", rating: 5, comment: "Melhor restaurante da região!", channel: "PESQUISA", status: "CONCLUIDO", createdAt: daysAgo(6) },
      { customerName: "Igor Santos", rating: 4, comment: "Boa experiência, voltarei.", channel: "IFOOD", status: "EM_ANALISE", createdAt: daysAgo(7) },
      { customerName: "Julia Fernandes", rating: 1, comment: "Atendimento muito ruim, não recomendo.", channel: "PESQUISA", status: "EM_ANALISE", createdAt: daysAgo(8) },
      { customerName: "Marcos Vieira", rating: 3, comment: "Experiência mediana.", channel: "GOOGLE", status: "NOVO", createdAt: daysAgo(10) },
      { customerName: "Patrícia Gomes", rating: 5, comment: null, channel: "IFOOD", status: "NOVO", createdAt: daysAgo(11) },
    ],
  });

  await prisma.feedbackNote.createMany({
    data: [
      { feedbackId: diego.id, description: "Cliente contatado, pedimos desculpas e oferecemos desconto na próxima compra." },
      { feedbackId: rafael.id, description: "Conversamos com a cozinha sobre o tempo de preparo; cliente foi compensado." },
      { feedbackId: helena.id, description: "Aguardando retorno do cliente para entender melhor a reclamação." },
      { feedbackId: helena.id, description: "Segunda tentativa de contato realizada por telefone." },
    ],
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
