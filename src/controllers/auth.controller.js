const bcrypt = require("bcrypt");
const usersDAO = require("../models/users.dao");
const instituicoesDAO = require("../models/instituicoes.dao");


const authController = {
    async login(req, res) {

        const { email, senha } = req.body;
        const user = await usersDAO.findByEmail(email);

        if (user.length < 1) {
            return res.render('login', { error: 'Login Incorreto', formData: req.body });
        }

        if (email == user[0].email && await bcrypt.compare(senha, user[0].senha)) {
            
            req.session.isAuth = true;
            
            const instituicao = await instituicoesDAO.findById(user[0].instituicao_id);

            const sessionUser = {
                id: user[0].id,
                email: user[0].email,
                tipo: user[0].tipo,
                nome: user[0].nome,
                curso_id: user[0].curso_id,
                instituicao_id: user[0].instituicao_id,
                instituicao_nome: instituicao[0].nome,
                instituicao_foto: instituicao[0].foto
            }

            req.session.user = sessionUser;
            res.redirect("/");
        } else {
            return res.render('login', { error: 'Login Incorreto', formData: req.body });
        }
    },

    async logoff(req, res) {
        req.session.destroy();
        res.redirect("/");
    }
}

module.exports = authController;