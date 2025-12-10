const db = require("../config/dbConnection");

const repositorioDAO = {

 async findDisciplinasByCurso(curso_id) {
    const sql = "SELECT * FROM disciplinas WHERE curso_id = ?";
    const dados = await db.execute(sql, [curso_id]);
    return dados[0];
  },

  async cadastraDisciplina(disciplina) {
    const sql = `
      INSERT INTO disciplinas (id, nome, semestre, curso_id) VALUES (?, ?, ?, ?)
      `;
      
    const values = [disciplina.id, disciplina.nome, disciplina.semestre, disciplina.curso_id]
    await db.execute(sql, values);
  },

  async cadastraMateria(materia) {
    const sql = `
      INSERT INTO materia (id, nome, disciplina_id) VALUES (?, ?, ?)
      `;
      
    const values = [materia.id, materia.nome, materia.disciplina_id]
    await db.execute(sql, values);
  },

  async findDisciplinaById(id) {
    const sql = "SELECT * FROM disciplinas WHERE id = ?";

    const dados = await db.execute(sql, [id]);
    return dados[0][0];
  },

  async findMateriasByDisciplina(disciplina_id) {
    const sql = "SELECT * FROM materia WHERE disciplina_id = ?";

    const dados = await db.execute(sql, [disciplina_id]);
    return dados[0];
  },

  async findConteudosByMateria(materia_id) {
    const sql = "SELECT conteudo.id as id, nome, tipo, arquivo, materia_id, conteudo_visualizado.usuario_id, conteudo_visualizado.conteudo_id FROM conteudo LEFT JOIN conteudo_visualizado ON conteudo_visualizado.conteudo_id = conteudo.id   WHERE materia_id = ?";

    const dados = await db.execute(sql, [materia_id]);
    return dados[0];
  },

  async findTarefasByMateria(materia_id) {
    const sql = "SELECT * FROM tarefa WHERE materia_id = ?";
    const dados = await db.execute(sql, [materia_id]);
    return dados[0];
  },

  async cadastraConteudo(conteudo) {
  const sql = `
    INSERT INTO conteudo (id, descricao, nome, tipo, arquivo, materia_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    conteudo.id,
    conteudo.descricao,
    conteudo.nome,
    conteudo.tipo,
    conteudo.arquivo,
    conteudo.materia_id
  ];

  await db.execute(sql, values);
},

 async cadastraTarefa(tarefa) {
  const sql = `
    INSERT INTO tarefa (id, materia_id, titulo, descricao, data_entrega, valor, arquivo) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    tarefa.id,
    tarefa.materia_id,
    tarefa.titulo,
    tarefa.descricao,
    tarefa.data_entrega,
    tarefa.valor,
    tarefa.arquivo
  ];

  await db.execute(sql, values);
},

async findDisciplinaByMateria(materia_id) {
  const sql = `
    SELECT * 
    FROM disciplinas
    JOIN materia ON materia.disciplina_id = disciplinas.id
    WHERE materia.id = ?
  `;
  
  const dados = await db.execute(sql, [materia_id]);
  return dados[0][0];
},

async findConteudoById(id) {
  const sql = "SELECT * FROM conteudo WHERE id = ?";
  const dados = await db.execute(sql, [id]);
  return dados[0][0];
},

async deletaConteudo(id) {
  const sql = "DELETE FROM conteudo WHERE id = ?";
  await db.execute(sql, [id]);
},

async findByCursoId(curso_id) {
  try {
    const sql = `
      SELECT 
        conteudo.id,
        conteudo.nome AS conteudo_nome,
        conteudo.tipo,
        conteudo.arquivo,
        conteudo.materia_id,
        materia.nome AS materia_nome,
        disciplinas.id AS disciplina_id,
        disciplinas.nome AS disciplina_nome,
        cursos.id AS curso_id,
        cursos.nome AS curso_nome
      FROM conteudo
      JOIN materia ON conteudo.materia_id = materia.id
      JOIN disciplinas ON materia.disciplina_id = disciplinas.id
      JOIN cursos ON disciplinas.curso_id = cursos.id
      WHERE cursos.id = ?
      ORDER BY conteudo.nome ASC
    `;

    const dados = await db.execute(sql, [curso_id]);
    return dados[0];
  } catch (error) {
    console.error("Erro ao buscar conteúdos por curso:", error);
    throw error;
  }
},

async findTarefaById(id) {
  const sql = "SELECT * FROM tarefa WHERE id = ?";
  const dados = await db.execute(sql, [id]);
  return dados[0][0];
},

async findEnvioAluno(tarefa_id, aluno_id) {
  const sql = `
    SELECT * FROM tarefa_envio 
    WHERE tarefa_id = ? AND aluno_id = ?
  `;
  const dados = await db.execute(sql, [tarefa_id, aluno_id]);
  return dados[0][0];
},

async findEnviosByTarefa(tarefa_id) {
  const sql = `
    SELECT te.*, u.nome AS aluno_nome
    FROM tarefa_envio te
    JOIN usuarios u ON te.aluno_id = u.id
    WHERE te.tarefa_id = ?
    ORDER BY te.data_envio DESC
  `;
  const dados = await db.execute(sql, [tarefa_id]);
  return dados[0];
},

async registrarEnvio(envio) {
  const sql = `
    INSERT INTO tarefa_envio (id, tarefa_id, aluno_id, arquivo, nome_original)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [envio.id, envio.tarefa_id, envio.aluno_id, envio.arquivo, envio.nome_original];
  await db.execute(sql, values);
},

async atualizarNotaEFeedback(envioId, nota, feedback) {
  const sql = `
    UPDATE tarefa_envio
    SET nota = ?, feedback = ?
    WHERE id = ?
  `;
  await db.execute(sql, [nota, feedback, envioId]);
},

async leConteudo(conteudo) {
  const sql = 'INSERT INTO conteudo_visualizado (id, usuario_id, conteudo_id) VALUES (?, ?, ?)'

  const values = [conteudo.id ,conteudo.user_id, conteudo.conteudo_id];

  await db.execute(sql, values);
},

async desleConteudo(usuario_id, conteudo_id) {
  const sql = "DELETE FROM conteudo_visualizado WHERE usuario_id = ? AND conteudo_id = ?";
  await db.execute(sql, [usuario_id, conteudo_id]);
},



}
module.exports = repositorioDAO;