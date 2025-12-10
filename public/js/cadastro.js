document.addEventListener("DOMContentLoaded", () => {
  const dados = document.getElementById('dados');

  const cursosPorInstituicao = JSON.parse(dados.dataset.cursos);
  const userTipo = dados.dataset.usertipo;
  const formCurso = dados.dataset.formcurso;

  const selectInstituto = document.getElementById('instituto');
  const selectCurso = document.getElementById('curso');
  const selectTipo = document.getElementById('tipo');

  function atualizarCursos(instId) {
    selectCurso.innerHTML = '<option value="" disabled selected hidden>Selecione um curso</option>';

    if (instId && cursosPorInstituicao[instId]) {
      cursosPorInstituicao[instId].forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nome;

        if (c.id === formCurso) opt.selected = true;

        selectCurso.appendChild(opt);
      });
    }
  }

  function verificarTipo() {
    const tipo = selectTipo.value;

    if (tipo === 'admin' || tipo === 'diretor') {
      selectCurso.style.display = 'none';
      selectCurso.value = '';
    } else {
      selectCurso.style.display = 'block';
    }
  }

  new SlimSelect({
    select: '#instituto',
    placeholder: 'Digite para buscar...',
    showSearch: true
  });

  if (userTipo === 'admin') {
    if (selectInstituto.value) {
      atualizarCursos(selectInstituto.value);
    }

    selectInstituto.addEventListener('change', () => {
      atualizarCursos(selectInstituto.value);
      verificarTipo();
    });
  }

  if (userTipo === 'diretor') {
    const instId = Object.keys(cursosPorInstituicao)[0];
    atualizarCursos(instId);
  }

  verificarTipo();
  selectTipo.addEventListener('change', verificarTipo);
});
