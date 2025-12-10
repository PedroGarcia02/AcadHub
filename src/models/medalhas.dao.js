const db = require("../config/dbConnection");

const medalhasDAO = {

async inserirPontos(pontos) {
    const sql = 'INSERT INTO usuario_pontos (id, pontos, tipo, usuario_id) VALUES (?, ?, ?, ?)';

    const values = [pontos.id, pontos.quantidade_pontos, pontos.tipo, pontos.user_id];
    await db.execute(sql, values);
},

async deletarPontos(pontos) {
    const sql = 'DELETE FROM usuario_pontos WHERE usuario_id = ? AND pontos = ? LIMIT 1';

    const values = [pontos.user_id, pontos.quantidade_pontos];
    
    await db.execute(sql, values);
}

}
module.exports = medalhasDAO;