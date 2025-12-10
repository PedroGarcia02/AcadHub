const db = require("../config/dbConnection");

const instituicoesDAO = {

    async findAll() {
        const sql = "SELECT id, nome FROM instituicoes";

        const dados = await db.execute(sql);

        return dados[0];
    },

    async findById(id) {
        const sql = "SELECT * FROM instituicoes WHERE id = ?";

        const dados = await db.execute(sql, [id]);

        return dados[0];
    },

    async findByUsuarioID(usuario_id) {
        const sql = `
    SELECT 
        instituicoes.id AS id,
        usuarios.curso_id as curso
    FROM instituicoes
    JOIN usuarios ON usuarios.instituicao_id = instituicoes.id
    WHERE usuarios.id = ?
`;

        const dados = await db.execute(sql, [usuario_id]);

        return dados[0];
    },

    async findCursoByInstituicaoID(instituicao_id) {
        const sql = `
    SELECT 
        *
    FROM cursos
    WHERE instituicao_id = ?
`;

        const dados = await db.execute(sql, [instituicao_id]);

        return dados[0];
    },

    async findCursoById(id) {
        const sql = "SELECT * FROM cursos WHERE id = ?";
        const dados = await db.execute(sql, [id]);
        return dados[0][0];
    },

    async cadastrarCurso(curso) {
        const sql = `INSERT INTO cursos (id, nome, semestres, instituicao_id) VALUES (?, ?, ?, ?)`;
        return db.execute(sql, [curso.id, curso.nome, curso.semestres, curso.instituicao_id]);
    },

    async cadastrarInstituicao(instituicao) {
        const sql = `
      INSERT INTO instituicoes (id, nome, estado, cidade)
      VALUES (?, ?, ?, ?)
    `;
        return db.execute(sql, [instituicao.id, instituicao.nome, instituicao.estado, instituicao.cidade]);
    },

    async atualizarInstituicaoUsuario(usuario_id, instituicao_id) {
        const sql = `UPDATE usuarios SET instituicao_id = ? WHERE id = ?`;
        return db.execute(sql, [instituicao_id, usuario_id]);
    },


}
module.exports = instituicoesDAO;