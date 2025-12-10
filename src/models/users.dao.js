const db = require("../config/dbConnection");

const usersDAO = {
  
  async findByTipo (tipo) {
    const sql = "SELECT * FROM usuarios WHERE tipo = ?;"

    const dados = await db.execute(sql, [tipo]);

    return dados[0];
  },

  async findByEmail(email) {
    const sql = "SELECT * FROM usuarios WHERE email = ? LIMIT 1;"

    const dados = await db.execute(sql, [email]);

    return dados[0];
  },

  async findById(id) {
    const sql = "SELECT * FROM usuarios WHERE id = ? LIMIT 1;"

    const dados = await db.execute(sql, [id]);

    return dados[0];
  },

  async deleteById (id)  {
    const deleteUserQuery = `DELETE FROM users WHERE id = ?`;
    
  },

  async updateById(id, { nome, email, foto }) {
  const query = `
    UPDATE usuarios
    SET nome = ?, email = ?, foto = ?
    WHERE id = ?
  `;

  return db.execute(query, [nome, email, foto, id]);
},

async updateSenhaById(id, novaSenhaHash) {
    const sql = `UPDATE usuarios SET senha = ? WHERE id = ?`;
    return db.execute(sql, [novaSenhaHash, id]);
},


  async registraUsuario(user) {
    try {
      const sql = `INSERT INTO usuarios (id, nome, email, senha, instituicao_id, tipo, curso_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [user.id, user.nome, user.email, user.senha, user.instituto || null, user.tipo, user.curso || null]

      const result = await db.execute(sql, values);

      return { success: true, insertId: result.insertId };

    } catch (error) {
      console.error("Erro ao criar usuario:");
      throw error;
    }
  },

  async buscarPontosPorUsuario(usuario_id) {
    const sql = `
      SELECT COALESCE(SUM(pontos), 0) AS total_pontos
      FROM usuario_pontos
      WHERE usuario_id = ?;
    `;
    const dados = await db.execute(sql, [usuario_id]);
    return dados[0][0].total_pontos || 0;
  },

  async buscarMedalhasPorUsuario(usuario_id) {
  const sql = `
    SELECT 
      medalhas.id AS id,
      medalhas.nome AS nome,
      medalhas.imagem AS imagem,
      medalhas.tipo AS tipo,
      medalhas.pontos AS pontos,
      usuario_medalha.data_conquista AS data_conquista
    FROM usuario_medalha
    JOIN medalhas ON medalhas.id = usuario_medalha.medalha_id
    WHERE usuario_medalha.usuario_id = ?
    ORDER BY medalhas.tipo, medalhas.pontos ASC;
  `;
  const dados = await db.execute(sql, [usuario_id]);
  return dados[0];
},

async buscarPontosPorUsuarioPorTipo(usuario_id) {
  const sql = `
    SELECT 
      tipo,
      COALESCE(SUM(pontos), 0) AS total
    FROM usuario_pontos
    WHERE usuario_id = ?
    GROUP BY tipo;
  `;

  const dados = await db.execute(sql, [usuario_id]);
  const resultados = dados[0];

  const pontosPorTipo = { forum: 0, conteudo: 0, tarefa: 0 };
  resultados.forEach(r => {
    pontosPorTipo[r.tipo] = r.total;
  });

  return pontosPorTipo;
},


}
module.exports = usersDAO;