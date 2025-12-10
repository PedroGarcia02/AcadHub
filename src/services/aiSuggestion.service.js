const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSuggestion({ readContents, unreadContents }) {
  if (!unreadContents.length) {
    return "Todos os conteúdos já foram lidos.";
  }

  if (!readContents.length) {
    return "Você ainda não iniciou esta disciplina. Que tal começar pelo primeiro conteúdo?";
  }

  const prompt = `
O aluno já leu:
${readContents.map(c => `- ${c.name}: ${c.description}`).join("\n")}

E ainda não leu:
${unreadContents.map(c => `- ${c.name}: ${c.description}`).join("\n")}

Com base nisso, sugira qual conteúdo o aluno deve ler a seguir e por quê, em uma frase curta e clara.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { generateSuggestion };
