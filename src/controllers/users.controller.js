const bcrypt = require('bcrypt');
const usersDAO = require("../models/users.dao");
const crypto = require('crypto');
const instituicoesDAO = require("../models/instituicoes.dao");
const path = require('path');
const fs = require('fs');

const usersController = {

    getAll: (req, res) => {
        const page = parseInt(req.query.pagina) || 1;
        const limit = 5;
        const filter = req.query.filter || '';

        const resultado = usersDAO.findAll(page, limit, filter);

        res.render('lista', {
            users: resultado.users,
            currentPage: page,
            totalPages: resultado.totalPages,
            filter
        });
    },

    async home(req, res) {
        res.render('home');
    },

async mostrarCadastro(req, res) {
  try {
    const userTipo = req.session.user.tipo;
    let instituicoes = [];
    let cursosPorInstituicao = {};

    if (userTipo === 'admin') {
      instituicoes = await instituicoesDAO.findAll();
      for (const inst of instituicoes) {
        cursosPorInstituicao[inst.id] = await instituicoesDAO.findCursoByInstituicaoID(inst.id);
      }
    } else if (userTipo === 'diretor') {
      const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
      instituicoes = inst;
      cursosPorInstituicao[inst[0].id] = await instituicoesDAO.findCursoByInstituicaoID(inst[0].id);
    }

    res.render('admin/cadastro', {
      instituicoes,
      cursosPorInstituicao,
      userTipo,
      error: res.locals.error || null,
      formData: res.locals.formData || {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar página de cadastro.");
  }
},

async registrarUsuario(req, res) {
  try {
    const user = req.body;
    const userTipoLogado = req.session.user.tipo;

    if (userTipoLogado === 'diretor') {
      const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
      user.instituto = inst[0].id;
    }

    if (!user.nome || !user.email || !user.senha || !user.tipo) {
      res.locals.error = "Preencha todos os campos obrigatórios.";
      res.locals.formData = user;
      return await this.mostrarCadastro(req, res);
    }

    if ((user.tipo === 'professor' || user.tipo === 'aluno') && !user.curso) {
      res.locals.error = "Selecione um curso para este usuário.";
      res.locals.formData = user;
      return await this.mostrarCadastro(req, res);
    }

    const emailExistente = await usersDAO.findByEmail(user.email);
    if (emailExistente.length > 0) {
      res.locals.error = "Este email já está cadastrado.";
      res.locals.formData = user;
      return await this.mostrarCadastro(req, res);
    }

    if (userTipoLogado === 'diretor' && user.tipo === 'admin') {
      res.locals.error = "Diretor não pode cadastrar admin.";
      res.locals.formData = user;
      return await this.mostrarCadastro(req, res);
    }

    user.senha = await bcrypt.hash(user.senha, 10);
    user.id = crypto.randomUUID();

    await usersDAO.registraUsuario(user);
    res.redirect("/login");

  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.locals.error = "Ocorreu um erro ao cadastrar o usuário.";
    res.locals.formData = req.body;
    await this.mostrarCadastro(req, res);
  }
},

    async mostrarLogin(req, res) {
        res.render('login', {
            error: null,
            formData: {}
        });;
    },

    async mostrarUpdate(req, res) {
        const userId = req.params.id;
        const sessionUser = req.session.user;

        const user = await usersDAO.findById(userId);

        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        if (sessionUser.tipo !== 'ADMIN' && sessionUser.id != user[0].id) {
            return res.status(403).send('Acesso negado');
        }

        res.render('update', {user});
    },

    async mostrarUpdateSenha(req, res) {
        res.render('updateSenha', {
            error: null,
            success: null,
            formData: {}
        });;
    },

    async mostrarPainel(req, res) {
        res.render('admin/painel');
    },

    async update(req, res) {
        const { id } = req.params;
        const { nome, email } = req.body;
        const userSession = req.session.user;

        if (!userSession || (userSession.tipo !== 'ADMIN' && userSession.id != id)) {
            return res.status(403).send('Acesso negado');
        }

        const user = await usersDAO.findById(id);
        if (!user) return res.status(404).send("Usuário não encontrado");

        let novaFoto = user[0].foto || null;

        if (req.file) {
        novaFoto = req.file.filename;

        if (user[0].foto) {
            const oldPath = path.join(__dirname, "..", "..", "public", "images", "users", user[0].foto);
            fs.unlink(oldPath, err => {
                if (err) console.log("Erro ao excluir foto antiga:", err);
            });
            }
        }
        await usersDAO.updateById(id, { nome, email, foto: novaFoto });
        res.redirect(`/user/${id}`);
    },

    async updateSenha(req, res) {
    try {
        const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;
        const sessionUser = req.session.user;

        if (novaSenha !== confirmarNovaSenha) {
            return res.render('updateSenha', {
                error: "A nova senha e a confirmação não coincidem.",
                formData: {}
            });
        }
        const usuarios = await usersDAO.findById(sessionUser.id);
        if (!usuarios || usuarios.length === 0) {
            return res.render('updateSenha', {
                error: "Usuário não encontrado.",
                formData: {}
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaCorreta) {
            return res.render('updateSenha', {
                error: "Senha atual incorreta.",
                formData: {}
            });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        await usersDAO.updateSenhaById(sessionUser.id, novaSenhaHash);

        res.render('updateSenha', {
            error: null,
            success: "Senha atualizada com sucesso!",
            formData: {}
        });

    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        res.status(500).render('updateSenha', {
            error: "Ocorreu um erro ao atualizar a senha.",
            formData: {}
        });
    }
    },

    async delete(req, res) {
        const id = req.params.id

        try {
            usersDAO.deleteById(id);
            res.redirect('/users');
        } catch (error) {
            res.status(500).send("Erro ao tentar deletar o usuário.");
        }
    },

    async perfil(req, res) {
  try {
    const userData = await usersDAO.findById(req.params.id);

    if (!userData || userData.length === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    const user = userData[0];
    const pontosTotais = await usersDAO.buscarPontosPorUsuario(user.id);
    const medalhas = await usersDAO.buscarMedalhasPorUsuario(user.id);

    const pontosPorTipo = await usersDAO.buscarPontosPorUsuarioPorTipo(user.id);

    res.render('perfil', {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        foto: user.foto,
        pontos: pontosTotais || 0,
        medalhas: medalhas || [],
        pontosPorTipo
      },
      sessionUser: req.session.user
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).send("Erro ao carregar perfil do usuário.");
  }
},


};

module.exports = usersController;