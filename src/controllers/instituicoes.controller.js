const instituicoesDAO = require("../models/instituicoes.dao");
const crypto = require('crypto');

const instituicoesController = {

    async mostrarCadastrarCurso(req, res) {
        try {
            let instituicoes = [];
            let userTipo = req.session.user.tipo;

            if (userTipo === 'admin') {
                instituicoes = await instituicoesDAO.findAll();
            } else if (userTipo === 'diretor') {
                const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
                instituicoes = inst;
            }

            res.render("admin/cadastrarCurso", {
                instituicoes,
                error: null,
                success: null,
                userTipo
            });
        } catch (error) {
            console.error("Erro ao carregar instituições:", error);
            res.status(500).send("Erro ao carregar instituições");
        }
    },

    async cadastrarCurso(req, res) {
        try {
            const { nome, semestres, instituicao_id } = req.body;
            const userTipo = req.session.user.tipo;

            let idInstituicao = instituicao_id;

            if (userTipo === 'diretor') {
                const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
                idInstituicao = inst[0].id;
            }

            if (!nome || !semestres || !idInstituicao) {
                let instituicoes = [];
                if (userTipo === 'admin') {
                    instituicoes = await instituicoesDAO.findAll();
                } else {
                    const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
                    instituicoes = inst;
                }

                return res.render("admin/cadastrarCurso", {
                    instituicoes,
                    error: "Preencha todos os campos.",
                    success: null,
                    userTipo
                });
            }

            const curso = {
                id: crypto.randomUUID(),
                nome,
                semestres: parseInt(semestres),
                instituicao_id: idInstituicao
            };

            await instituicoesDAO.cadastrarCurso(curso);

            let instituicoes = [];
            if (userTipo === 'admin') {
                instituicoes = await instituicoesDAO.findAll();
            } else {
                const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
                instituicoes = inst;
            }

            res.render("admin/cadastrarCurso", {
                instituicoes,
                error: null,
                success: "Curso cadastrado com sucesso!",
                userTipo
            });

        } catch (error) {
            console.error("Erro ao cadastrar curso:", error);

            let instituicoes = [];
            const userTipo = req.session.user.tipo;
            if (userTipo === 'ADMIN') {
                instituicoes = await instituicoesDAO.findAll();
            } else {
                const inst = await instituicoesDAO.findByUsuarioID(req.session.user.id);
                instituicoes = inst;
            }

            res.render("admin/cadastrarCurso", {
                instituicoes,
                error: "Ocorreu um erro ao cadastrar o curso.",
                success: null,
                userTipo
            });
        }
    },

    async mostrarCadastrarInstituicao(req, res) {
        try {
            res.render("admin/cadastrarInstituicao", {
                error: null,
                success: null
            });
        } catch (error) {
            console.error("Erro ao carregar página de cadastro:", error);
            res.status(500).send("Erro ao carregar página");
        }
    },

    async cadastrarInstituicao(req, res) {
        try {
            const { nome, estado, cidade } = req.body;

            if (!nome || !estado || !cidade) {
                return res.render("admin/cadastrarInstituicao", {
                    error: "Preencha todos os campos.",
                    success: null,
                    nome,
                    estado,
                    cidade
                });
            }

            const instituicao = {
                id: crypto.randomUUID(),
                nome,
                estado,
                cidade
            };

            await instituicoesDAO.cadastrarInstituicao(instituicao);

            res.render("admin/cadastrarInstituicao", {
                error: null,
                success: "Instituição cadastrada com sucesso!",
                nome: "",
                estado: "",
                cidade: ""
            });

        } catch (error) {
            console.error("Erro ao cadastrar instituição:", error);
            res.render("admin/cadastrarInstituicao", {
                error: "Ocorreu um erro ao cadastrar a instituição.",
                success: null,
                nome: req.body.nome,
                estado: req.body.estado,
                cidade: req.body.cidade
            });
        }
    },

    async mostrarTrocarInstituicao(req, res) {
        try {
            const instituicoes = await instituicoesDAO.findAll();
            res.render("admin/trocarInstituicao", {
                instituicoes,
                currentInstituicaoId: req.session.user.instituicao_id,
                error: null,
                success: null
            });
        } catch (error) {
            console.error("Erro ao carregar instituições:", error);
            res.status(500).send("Erro ao carregar instituições");
        }
    },

    async trocarInstituicao(req, res) {
        try {
            const { instituicao_id } = req.body;
            const usuario_id = req.session.user.id;

            if (!instituicao_id) {
                const instituicoes = await instituicoesDAO.findAll();
                return res.render("admin/trocarInstituicao", {
                    instituicoes,
                    currentInstituicaoId: req.session.user.instituicao_id,
                    error: "Selecione uma instituição.",
                    success: null
                });
            }

            await instituicoesDAO.atualizarInstituicaoUsuario(usuario_id, instituicao_id);

            req.session.user.instituicao_id = instituicao_id;

            const instituicoes = await instituicoesDAO.findAll();
            res.render("admin/trocarInstituicao", {
                instituicoes,
                currentInstituicaoId: instituicao_id,
                error: null,
                success: "Instituição atualizada com sucesso!"
            });

        } catch (error) {
            console.error("Erro ao atualizar instituição:", error);
            const instituicoes = await instituicoesDAO.findAll();
            res.render("admin/trocarInstituicao", {
                instituicoes,
                currentInstituicaoId: req.session.user.instituicao_id,
                error: "Ocorreu um erro ao atualizar a instituição.",
                success: null
            });
        }
    }

};

module.exports = instituicoesController;
