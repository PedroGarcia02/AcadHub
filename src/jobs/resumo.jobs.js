const forumDAO = require("../models/forum.dao");
const { gerarResumo } = require("../services/ai.service");

async function gerarResumoParaDiscussao() {
  console.log("⏳ Gerando resumos automáticos de discussões abertas...");

  const abertas = await forumDAO.findDiscussoesAbertas();

  for (const discussao of abertas) {
    const mensagens = await forumDAO.findMensagensSimplesByDiscussao(discussao.id);
    if (mensagens.length < 3) continue;

    const resumo = await gerarResumo(mensagens);
    await forumDAO.atualizaResumoDiscussao(discussao.id, resumo);

  }
}

module.exports = { gerarResumoParaDiscussao };
