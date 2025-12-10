const bcrypt = require('bcrypt');
const usersDAO = require("../models/users.dao");
const crypto = require('crypto');

async function createDefaultAdmin() {
    try {
        const admins = await usersDAO.findByTipo("ADMIN");

        if (admins && admins.length > 0) {
            console.log("✔ Usuário ADMIN já existe.");
            return;
        }

        console.log("⚠ Nenhum ADMIN encontrado. Criando administrador padrão...");

        const adminUser = {
            id: crypto.randomUUID(),
            nome: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            tipo: "admin",
            senha: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
            instituto: '00000000-0000-0000-0000-000000000001'
        };

        await usersDAO.registraUsuario(adminUser);

        console.log("✔ ADMIN criado com sucesso:");
        console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`   Senha: (definida no .env)`);
    } catch (err) {
        console.error("Erro ao criar ADMIN padrão:", err);
    }
}

module.exports = createDefaultAdmin;
