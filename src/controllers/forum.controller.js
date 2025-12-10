const forumDAO = require("../models/forum.dao");
const crypto = require('crypto');
const instituicoesDAO = require("../models/instituicoes.dao");
const fs = require('fs');
const path = require('path');
const { gerarResumo } = require("../services/ai.service");
const repositorioDAO = require("../models/repositorio.dao");
const medalhasDAO = require("../models/medalhas.dao");


const forumController = {

async apagarImagem(nomeArquivo, tipo) {
    const folder = tipo === 'forum' ? 'forum' : 'users';
    const filePath = path.join(__dirname, '..', '..', 'public', 'images', folder, nomeArquivo);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Erro ao apagar imagem:', err);
        } else {
            console.log('Imagem apagada com sucesso!');
        }
    });
},

async home(req, res) {
        const instituicao = await instituicoesDAO.findByUsuarioID(req.session.user.id);
        
        const topicos = await forumDAO.findTopicosByInstituicao(instituicao[0].id, instituicao[0].curso);

        res.render('forum/home', {
            topicos: topicos
        });     
},
    
async mostrarTopico(req, res) {
    const topico_id = res.locals.topico_id || req.params.id;
    
    const topico = await forumDAO.findTopicoByid(topico_id);

    if (!topico) {
        return res.redirect("/forum/");
    }

    if(topico.instituicao_id != req.session.user.instituicao_id) {
        return res.redirect("/forum/");
    }
    
    if(topico.curso_id !== null && topico.curso_id != req.session.user.curso_id) {
        return res.redirect("/forum/");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const totalDiscussoes = (await forumDAO.findDiscussaoByTopico(topico_id)).length;
    const totalPages = Math.ceil(totalDiscussoes / limit);

    const discussoes = await forumDAO.findDiscussaoByTopicoPaged(topico_id, limit, offset);

    res.render('forum/discussoes', {
        discussoes,
        topico_id,
        page,
        totalPages
    });
},

async mostrarDiscussao(req, res) {
    try {
        const discussao_id = res.locals.discussao_id || req.params.id;

        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const instituicao = await forumDAO.findInstituicaoByDiscussaoId(discussao_id);
        if(!instituicao) return res.redirect("/forum/");

        if (instituicao.instituicao_id != req.session.user.instituicao_id) {
            return res.redirect("/forum/");
        }
        if (instituicao.curso_id !== null && instituicao.curso_id != req.session.user.curso_id) {
            return res.redirect("/forum/");
        }

        const mensagens = await forumDAO.findMensagemByDiscussaoPaged(discussao_id, page, limit);

        const totalMensagens = (await forumDAO.findMensagemByDiscussao(discussao_id)).length;
        const totalPages = Math.ceil(totalMensagens / limit);

        const conteudosDoCurso = await repositorioDAO.findByCursoId(req.session.user.curso_id);

        res.render('forum/discussao', {
            mensagens,
            discussao: mensagens[0] || null,
            conteudosDoCurso,
            error: res.locals.error || null,
            formData: res.locals.formData || {},
            discussao_id,
            page,
            totalPages
        });

    } catch (error) {
        console.error("Erro ao mostrar discussão:", error);
        res.redirect("/forum/");
    }
},


async mostrarCadastroTopico(req, res) {

    const instituicao = await instituicoesDAO.findByUsuarioID(req.session.user.id);

    const cursos = await instituicoesDAO.findCursoByInstituicaoID(instituicao[0].id)

    res.render('forum/cadastrarTopico', {
        error: null,
        formData: {},
        instituicao_id: instituicao[0].id,
        cursos: cursos
    })
},

async cadastrarTopico(req, res) {
    if(req.session.user.tipo == 'aluno') {
        return res.redirect("/forum/");
    }

    const topico = req.body;
    topico.id = crypto.randomUUID();

    if(topico.curso_id == '') {
        topico.curso_id = null;
    } 

    await forumDAO.cadastraTopico(topico);
    res.redirect("/forum");
},

async mostrarCadastroDiscussao(req, res) {
    const topico_id = req.query.topico_id;

    res.render('forum/cadastrarDiscussao', {
        error: null,
        formData: {},
        topico_id
    })
},

async cadastrarDiscussao(req, res) {
    try {
        const discussao = req.body;
        discussao.id = crypto.randomUUID();
        discussao.usuario_id = req.session.user.id;

        discussao.imagem = req.file ? req.file.filename : null;

        await forumDAO.cadastraDiscussao(discussao);

        const pontos = {
      id: crypto.randomUUID(),
      tipo: 'forum',
      quantidade_pontos: 3,
      user_id: discussao.usuario_id
    }

    await medalhasDAO.inserirPontos(pontos);


        res.redirect("/forum/topico/" + discussao.topico_id);
    } catch (error) {
        console.error(error);
        res.render('forum/cadastrarDiscussao', { error: "Erro ao cadastrar discussão", formData: req.body, topico_id: req.body.topico_id });
    }
},

async cadastrarMensagem(req, res) {
    const mensagem = req.body;

    const fechado = await forumDAO.verificaDiscussaoFechada(mensagem.discussao_id);

    if(fechado) {
        res.locals.error = "Forum fechado.";
        res.locals.discussao_id = mensagem.discussao_id;
        return await forumController.mostrarDiscussao(req, res);
    }

    mensagem.id = crypto.randomUUID();

    mensagem.usuario_id = req.session.user.id;

    await forumDAO.cadastraMensagem(mensagem);

    const pontos = {
      id: crypto.randomUUID(),
      tipo: 'forum',
      quantidade_pontos: 1,
      user_id: mensagem.usuario_id
    }

    await medalhasDAO.inserirPontos(pontos);

    res.redirect("/forum/discussao/"+mensagem.discussao_id);
},

async editarMensagem(req, res) {
    const mensagem = req.body;

    mensagem.id = req.params.id;

    if(mensagem.usuario_id != req.session.user.id && req.session.user.tipo != "professor" && req.session.user.tipo != "diretor" && req.session.user.tipo != "admin" ) {
        return res.redirect("/forum/discussao/"+mensagem.discussao_id);
    }

    const fechado = await forumDAO.verificaDiscussaoFechada(mensagem.discussao_id);

    if(fechado) {
        res.locals.error = "Forum fechado.";
        res.locals.discussao_id = mensagem.discussao_id;
        return await forumController.mostrarDiscussao(req, res);
    }

    await forumDAO.editaMensagem(mensagem);

    res.redirect("/forum/discussao/"+mensagem.discussao_id);
},

async deletarMensagem(req, res) {
    const mensagem = req.body;

    mensagem.id = req.params.id;

    if(mensagem.usuario_id != req.session.user.id && req.session.user.tipo != "professor" && req.session.user.tipo != "diretor" && req.session.user.tipo != "admin" ) {
        return res.redirect("/forum/discussao/"+mensagem.discussao_id);
    }

    const fechado = await forumDAO.verificaDiscussaoFechada(mensagem.discussao_id);

    if(fechado) {
        res.locals.error = "Forum fechado.";
        res.locals.discussao_id = mensagem.discussao_id;
        return await forumController.mostrarDiscussao(req, res);
    }

    await forumDAO.deletaMensagem(mensagem);

    res.redirect("/forum/discussao/"+mensagem.discussao_id);
},

async fecharForum(req, res) {
    const id = req.params.id;

    const user = await forumDAO.findUserByDiscussao(id);

    if (user.usuario_id != req.session.user.id && req.session.user.tipo != 'professor' && req.session.user.tipo != 'admin' && req.session.user.tipo != 'diretor') {
        return res.redirect("/forum/discussao/" + id);
    }

    await forumDAO.fechaDiscussao(id);

    const mensagens = await forumDAO.findMensagensSimplesByDiscussao(id);

    if (mensagens.length > 0) {
        const resumo = await gerarResumo(mensagens);
        await forumDAO.atualizaResumoDiscussao(id, resumo);
    }

    res.redirect("/forum/discussao/"+id)
},

async abrirForum(req, res) {
    const id = req.params.id;

    const user = await forumDAO.findUserByDiscussao(id);

    if (user.usuario_id != req.session.user.id && req.session.user.tipo != 'professor' && req.session.user.tipo != 'admin' && req.session.user.tipo != 'diretor') {
        return res.redirect("/forum/discussao/" + id);
    }

    await forumDAO.abreDiscussao(id);
    res.redirect("/forum/discussao/" + id)
},

async pinarDiscussao(req, res) {
    const id = req.params.id;
    
    const topico_id = req.body['topico_id'];

    await forumDAO.pinaDiscussao(id);
    res.redirect("/forum/topico/" + topico_id)
},

async despinarDiscussao(req, res) {
    const id = req.params.id;

    const topico_id = req.body['topico_id'];

    await forumDAO.despinaDiscussao(id);
    res.redirect("/forum/topico/" + topico_id)
},

async pinarTopico(req, res) {
    const id = req.params.id;

    await forumDAO.pinaTopico(id);
    res.redirect("/forum/")
},

async despinarTopico(req, res) {
    const id = req.params.id;

    await forumDAO.despinaTopico(id);
    res.redirect("/forum/")
},

async gerarResumoDiscussao(req, res) {
  const id = req.params.id;

  const mensagens = await forumDAO.findMensagensSimplesByDiscussao(id);
  if (!mensagens.length) return res.redirect("/forum/discussao/" + id);

  const resumo = await gerarResumo(mensagens);
  await forumDAO.atualizaResumoDiscussao(id, resumo);

  res.redirect("/forum/discussao/" + id);
},



}
module.exports = forumController;