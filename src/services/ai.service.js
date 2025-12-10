const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function gerarResumo(mensagens) {
  const textoCompleto = mensagens.map(m => m.conteudo).join("\n");

  const prompt = `
Resuma de forma clara e concisa a discussão abaixo, destacando os principais pontos debatidos,
conclusões e divergências. O resumo deve ser em português e ter no máximo 5 linhas.

Discussão:
${textoCompleto}
  `;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { gerarResumo };
