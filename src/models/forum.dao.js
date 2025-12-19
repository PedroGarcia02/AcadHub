const db = require("../config/dbConnection");

const forumDAO = {

async findAllTopicos() {
    const sql = "SELECT * FROM topicos";

    const dados = await db.execute(sql);

    return dados[0];
},

  async findTopicoByid(id) {
    const sql = "SELECT * FROM topicos WHERE id = ?";

    const dados = await db.execute(sql, [id]);

    return dados[0][0];
  },

  async findUserByDiscussao(id) {
    const sql = "SELECT usuario_id FROM discussao WHERE id = ?";

    const dados = await db.execute(sql, [id]);

    return dados[0][0];
  },

async findTopicosByInstituicao(instituicao_id, curso_id) {
    const sql = `
        SELECT 
            topicos.*,
            COUNT(discussao.id) AS qtd_discussoes
        FROM topicos
        LEFT JOIN discussao ON discussao.topico_id = topicos.id
        WHERE topicos.instituicao_id = ?
          AND (topicos.curso_id = ? OR topicos.curso_id IS NULL)
        GROUP BY topicos.id
        ORDER BY topicos.pinned DESC, topicos.created_at DESC
    `;

    const dados = await db.execute(sql, [instituicao_id, curso_id]);
    return dados[0];
},

async findTopicosByInstituicao(instituicao_id) {
    const sql = `
        SELECT 
            topicos.*,
            COUNT(discussao.id) AS qtd_discussoes
        FROM topicos
        LEFT JOIN discussao ON discussao.topico_id = topicos.id
        WHERE topicos.instituicao_id = ?
        GROUP BY topicos.id
        ORDER BY topicos.pinned DESC, topicos.created_at DESC
    `;

    const dados = await db.execute(sql, [instituicao_id]);
    return dados[0];
},

async findDiscussaoByTopico(topico_id) {
    const sql = `
        SELECT
            discussao.id AS discussao_id,
            discussao.titulo AS discussao_titulo,
            discussao.imagem AS discussao_imagem,
            discussao.texto_IA AS discussao_texto,
            discussao.created_at AS discussao_created_at,

            usuarios.id AS usuario_id,
            usuarios.nome AS usuario_nome,
            usuarios.email AS usuario_email,
            usuarios.foto AS usuario_foto,
            usuarios.tipo AS usuario_tipo,

            COUNT(mensagem.id) AS replies,
            discussao.pinned AS discussao_pinned
        FROM discussao
        JOIN usuarios ON discussao.usuario_id = usuarios.id
        LEFT JOIN mensagem ON mensagem.discussao_id = discussao.id
        WHERE discussao.topico_id = ?
        GROUP BY
            discussao.id, discussao.titulo, discussao.imagem, discussao.texto_IA, discussao.created_at,
            discussao.updated_at, usuarios.id, usuarios.nome, usuarios.email, usuarios.foto, usuarios.tipo, discussao.pinned
        ORDER BY discussao.pinned DESC, discussao.updated_at DESC
    `;

    const dados = await db.execute(sql, [topico_id]);

    return dados[0];
},

async findDiscussaoByTopicoPaged(topico_id, limit, offset) {
    const sql = `
        SELECT
            discussao.id AS discussao_id,
            discussao.titulo AS discussao_titulo,
            discussao.imagem AS discussao_imagem,
            discussao.texto_IA AS discussao_texto,
            discussao.created_at AS discussao_created_at,

            usuarios.id AS usuario_id,
            usuarios.nome AS usuario_nome,
            usuarios.email AS usuario_email,
            usuarios.foto AS usuario_foto,
            usuarios.tipo AS usuario_tipo,

            COUNT(mensagem.id) AS replies,
            discussao.pinned AS discussao_pinned
        FROM discussao
        JOIN usuarios ON discussao.usuario_id = usuarios.id
        LEFT JOIN mensagem ON mensagem.discussao_id = discussao.id
        WHERE discussao.topico_id = ?
        GROUP BY
            discussao.id, discussao.titulo, discussao.imagem, discussao.texto_IA, discussao.created_at,
            usuarios.id, usuarios.nome, usuarios.email, usuarios.foto, usuarios.tipo, discussao.pinned
        ORDER BY discussao.pinned DESC, discussao.updated_at DESC
        LIMIT ? OFFSET ?;
    `;
    
    const dados = await db.execute(sql, [topico_id.toString(), limit.toString(), offset.toString()]);
    return dados[0];
},

async findMensagemByDiscussao(discussao_id) {
    const sql = `
        SELECT
    discussao.id AS discussao_id,
    discussao.titulo AS discussao_titulo,
    discussao.texto AS discussao_texto,
    discussao.imagem AS discussao_imagem,
    discussao.texto_IA AS discussao_texto_IA,
    discussao.fechado AS discussao_fechado,
    discussao.created_at AS discussao_created_at,

    criador.id AS criador_id,
    criador.nome AS criador_nome,
    criador.email AS criador_email,
    criador.foto AS criador_foto,
    criador.tipo AS criador_tipo,

    mensagem.id AS mensagem_id,
    mensagem.conteudo AS mensagem_conteudo,
    mensagem.editada AS mensagem_editada,
    mensagem.created_at AS mensagem_created_at,

    usuarios.id AS usuario_id,
    usuarios.nome AS usuario_nome,
    usuarios.email AS usuario_email,
    usuarios.foto AS usuario_foto,
    usuarios.tipo AS usuario_tipo

FROM discussao
JOIN usuarios AS criador ON discussao.usuario_id = criador.id
LEFT JOIN mensagem ON discussao.id = mensagem.discussao_id
LEFT JOIN usuarios ON mensagem.usuario_id = usuarios.id
WHERE discussao.id = ?
ORDER BY mensagem.updated_at DESC;
`;

    const dados = await db.execute(sql, [discussao_id]);
    return dados[0];
},

async findMensagemByDiscussaoPaged(discussao_id, page, limit) {
    const offset = (page - 1) * limit;

    const sql = `
        SELECT
            discussao.id AS discussao_id,
            discussao.titulo AS discussao_titulo,
            discussao.texto AS discussao_texto,
            discussao.imagem AS discussao_imagem,
            discussao.texto_IA AS discussao_texto_IA,
            discussao.fechado AS discussao_fechado,
            discussao.created_at AS discussao_created_at,

            criador.id AS criador_id,
            criador.nome AS criador_nome,
            criador.email AS criador_email,
            criador.foto AS criador_foto,
            criador.tipo AS criador_tipo,

            mensagem.id AS mensagem_id,
            mensagem.conteudo AS mensagem_conteudo,
            mensagem.editada AS mensagem_editada,
            mensagem.created_at AS mensagem_created_at,

            usuarios.id AS usuario_id,
            usuarios.nome AS usuario_nome,
            usuarios.email AS usuario_email,
            usuarios.foto AS usuario_foto,
            usuarios.tipo AS usuario_tipo,

            conteudo.id AS conteudo_id,
            conteudo.nome AS conteudo_nome,
            conteudo.tipo AS conteudo_tipo,
            conteudo.arquivo AS conteudo_arquivo,
            conteudo.materia_id AS conteudo_materia_id,

            medalhas.nome AS medalha_nome,
            medalhas.imagem AS medalha_imagem

        FROM discussao
        JOIN usuarios AS criador ON discussao.usuario_id = criador.id
        LEFT JOIN mensagem ON discussao.id = mensagem.discussao_id
        LEFT JOIN usuarios ON mensagem.usuario_id = usuarios.id
        LEFT JOIN usuario_medalha ON usuario_medalha.usuario_id = usuarios.id
        LEFT JOIN medalhas ON usuario_medalha.medalha_id = medalhas.id
        LEFT JOIN conteudo ON mensagem.conteudo_id = conteudo.id
        WHERE discussao.id = ?
        ORDER BY mensagem.updated_at DESC
        LIMIT ? OFFSET ?;
    `;

    const dados = await db.execute(sql, [discussao_id.toString(), limit.toString(), offset.toString()]);
    return dados[0];
},

  async findInstituicaoByDiscussaoId(discussao_id) {
    const sql = `
        SELECT 
            topicos.instituicao_id AS instituicao_id,
            topicos.curso_id AS curso_id,
            topicos.id as topico_id
        FROM discussao
        JOIN topicos ON discussao.topico_id = topicos.id
        WHERE discussao.id = ?;
    `;

    const dados = await db.execute(sql, [discussao_id]);

    return dados[0][0];
  },


async verificaDiscussaoFechada(id) {
    try {
        const sql = `SELECT fechado FROM discussao WHERE id = ?`;

        const dados = await db.execute(sql, [id]);
        return dados[0][0].fechado;
  
      } catch (error) {
        console.error("Erro ao buscar:");
        throw error;
      }
},

async cadastraTopico(topico) {
try {
      const sql = `INSERT INTO topicos (id, titulo, descricao, instituicao_id, curso_id) VALUES (?, ?, ?, ?, ?)`;
      const values = [topico.id, topico.titulo, topico.descricao, topico.instituicao_id, topico.curso_id]

      const result = await db.execute(sql, values);

      return { success: true, insertId: result.insertId };

    } catch (error) {
      console.error("Erro ao criar topico:");
      throw error;
    }
},

async cadastraDiscussao(discussao) {
try {
      const sql = `INSERT INTO discussao (id, titulo, texto, imagem, usuario_id, topico_id) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [discussao.id, discussao.titulo, discussao.texto, discussao.imagem, discussao.usuario_id, discussao.topico_id]

      const result = await db.execute(sql, values);

      return { success: true, insertId: result.insertId };

    } catch (error) {
      console.error("Erro ao criar discussão:");
      throw error;
    }
},

async cadastraMensagem(mensagem) {
    try {
          const sql = `INSERT INTO mensagem (id, conteudo, usuario_id, discussao_id, conteudo_id) VALUES (?, ?, ?, ?, ?)`;
          const values = [mensagem.id, mensagem.conteudo, mensagem.usuario_id, mensagem.discussao_id, mensagem.conteudo_id || null];
    
          const result = await db.execute(sql, values);

          const sqlUpdateDiscussao = `UPDATE discussao SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
          await db.execute(sqlUpdateDiscussao, [mensagem.discussao_id]);
    
          return { success: true, insertId: result.insertId };
    
        } catch (error) {
          console.error("Erro ao criar mensagem:");
          throw error;
        }
},

async editaMensagem(mensagem) {
  try {
    const sql = `UPDATE mensagem 
                 SET conteudo = ? , editada = 1 
                 WHERE id = ?`;
    const values = [mensagem.conteudo, mensagem.id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao editar mensagem:", error);
    throw error;
  }
},

async deletaMensagem(mensagem) {
  try {
    const sql = `DELETE FROM mensagem WHERE id = ?`;
    const values = [mensagem.id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    throw error;
  }
},


async fechaDiscussao(id) {
    try {
      const sql = `UPDATE discussao SET fechado = 1 WHERE id = ?`;
      const values = [id];

      const result = await db.execute(sql, values);

      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error("Erro ao fechar discussão:");
      throw error;
    }
},

async abreDiscussao(id) {
    try {
      const sql = `UPDATE discussao SET fechado = 0 WHERE id = ?`;
      const values = [id];

      const result = await db.execute(sql, values);

      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error("Erro ao abrir discussão:");
      throw error;
    }
},

async pinaDiscussao(id) {
  try {
    const sql = `UPDATE discussao SET pinned = 1 WHERE id = ?`;
    const values = [id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao fixar discussão:", error);
    throw error;
  }
},

async despinaDiscussao(id) {
  try {
    const sql = `UPDATE discussao SET pinned = 0 WHERE id = ?`;
    const values = [id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao desfixar discussão:", error);
    throw error;
  }
},

async pinaTopico(id) {
  try {
    const sql = `UPDATE topicos SET pinned = 1 WHERE id = ?`;
    const values = [id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao fixar topico:", error);
    throw error;
  }
},

async despinaTopico(id) {
  try {
    const sql = `UPDATE topicos SET pinned = 0 WHERE id = ?`;
    const values = [id];

    const result = await db.execute(sql, values);

    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao desfixar topico:", error);
    throw error;
  }
},

async findDiscussoesAbertas() {
  try {
    const sql = "SELECT id, titulo FROM discussao WHERE fechado = 0";
    const result = await db.execute(sql);
    return result[0];
  } catch (error) {
    console.error("Erro ao buscar discussões abertas:", error);
    throw error;
  }
},

async findMensagensSimplesByDiscussao(id) {
  try {
    const sql = "SELECT conteudo FROM mensagem WHERE discussao_id = ? ORDER BY created_at ASC";
    const result = await db.execute(sql, [id]);
    return result[0];
  } catch (error) {
    console.error("Erro ao buscar mensagens da discussão:", error);
    throw error;
  }
},

async atualizaResumoDiscussao(id, textoIA) {
  try {
    const sql = "UPDATE discussao SET texto_IA = ? WHERE id = ?";
    const values = [textoIA, id];
    const result = await db.execute(sql, values);
    return { success: result[0].affectedRows > 0 };
  } catch (error) {
    console.error("Erro ao atualizar resumo da discussão:", error);
    throw error;
  }
},


}

module.exports = forumDAO;
