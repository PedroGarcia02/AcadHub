const pageData = document.getElementById("pageData");
const userTipo = pageData.dataset.userTipo;
const disciplinaId = pageData.dataset.disciplinaId;

function toggleDropdown(id) {
  document.getElementById(id).classList.toggle("hidden");
}

async function toggleConteudo(conteudoId, marcado, disciplinaId) {
  const rota = marcado
    ? `/repo/lerConteudo/${conteudoId}`
    : `/repo/desLerConteudo/${conteudoId}`;

  const corpo = new URLSearchParams();
  corpo.append("diciplina_id", disciplinaId);

  const label = document.getElementById(`label-${conteudoId}`);

  try {
    const resposta = await fetch(rota, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
    });

    if (!resposta.ok) throw new Error();

    const check = document.getElementById(`check-${conteudoId}`);
    check.classList.add("scale-110");
    setTimeout(() => check.classList.remove("scale-110"), 200);

    label.textContent = marcado ? "Desmarcar" : "Marcar como lido";
    label.classList.toggle("text-gray-700", !marcado);
    label.classList.toggle("text-green-600", marcado);
  } catch (e) {
    alert("Erro ao atualizar leitura.");
    document.getElementById(`check-${conteudoId}`).checked = !marcado;
  }
}

async function generateAiSuggestion(disciplinaId) {
  const btn = document.getElementById("btnSugestaoIA");
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Gerando sugestão...";

    const response = await fetch(`/repo/aiSuggestion/${disciplinaId}`);
    const data = await response.json();

    btn.disabled = false;
    btn.textContent = "💡 Sugestão da IA";

    if (data.error) {
      showAiModal("Erro ao gerar sugestão.");
      return;
    }

    showAiModal(data.suggestion);
  } catch (error) {
    console.error(error);
    btn.disabled = false;
    btn.textContent = "💡 Sugestão da IA";
    showAiModal("Erro inesperado ao gerar sugestão.");
  }
}

function showAiModal(text) {
  document.getElementById("aiSuggestionText").innerText = text;
  document.getElementById("aiModal").classList.remove("hidden");
}

function closeAiModal() {
  document.getElementById("aiModal").classList.add("hidden");
}
