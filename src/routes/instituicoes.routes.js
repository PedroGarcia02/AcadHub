
const { Router } = require('express');
const instituicoesController = require('../controllers/instituicoes.controller');
const isAuth = require('../middlewares/isAuth');
const authController = require('../controllers/auth.controller');
const isAdmin = require('../middlewares/isAdmin');
const isDiretor = require('../middlewares/isDiretor');

const instituicoesRouter = Router();

instituicoesRouter.get('/cadastroCursos', isAuth, isDiretor, instituicoesController.mostrarCadastrarCurso);
instituicoesRouter.post('/cadastroCursos', isAuth, isDiretor, instituicoesController.cadastrarCurso);

instituicoesRouter.get('/cadastroInstituicao', isAuth, isAdmin, instituicoesController.mostrarCadastrarInstituicao);
instituicoesRouter.post('/cadastroInstituicao', isAuth, isAdmin, instituicoesController.cadastrarInstituicao);

instituicoesRouter.get('/trocarInstituicao', isAuth, isAdmin, instituicoesController.mostrarTrocarInstituicao);
instituicoesRouter.post('/trocarInstituicao', isAuth, isAdmin, instituicoesController.trocarInstituicao);


module.exports = instituicoesRouter;