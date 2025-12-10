const mysql = require('mysql2/promise');
require('dotenv').config();

// Cria a conexão com o banco de dados
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 60,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000
});

// Conecta ao banco de dados
(async () => {
  try {
    const conn = await connection.getConnection();
    console.log('Conectado com sucesso ao banco de dados');
    conn.release();
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  }
})();

module.exports = connection;