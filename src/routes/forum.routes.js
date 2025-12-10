
const { Router } = require('express');
const forumController = require('../controllers/forum.controller');
const isAuth = require('../middlewares/isAuth');
const authController = require('../controllers/auth.controller');
const isAdmin = require('../middlewares/isAdmin');
const isProfessor = require('../middlewares/isProfessor');
const upload = require('../middlewares/multer.js');

const forumRouter = Router();

forumRouter.get('/', isAuth, forumController.home);
forumRouter.get('/topico/:id', isAuth, forumController.mostrarTopico);
forumRouter.get('/discussao/:id', isAuth, forumController.mostrarDiscussao);

forumRouter.get('/fecharDiscussao/:id', isAuth, forumController.fecharForum);
forumRouter.get('/abrirDiscussao/:id', isAuth, forumController.abrirForum);
forumRouter.get("/gerarResumo/:id", isAuth, isAdmin, forumController.gerarResumoDiscussao);


forumRouter.get('/criarTopico', isAuth, isProfessor, forumController.mostrarCadastroTopico);
forumRouter.get('/criarDiscussao', isAuth, forumController.mostrarCadastroDiscussao);

forumRouter.post('/pinar/:id', isAuth, isProfessor, forumController.pinarDiscussao);
forumRouter.post('/despinar/:id', isAuth, isProfessor, forumController.despinarDiscussao);

forumRouter.post('/pinarTopico/:id', isAuth, isProfessor, forumController.pinarTopico);
forumRouter.post('/despinarTopico/:id', isAuth, isProfessor, forumController.despinarTopico);

forumRouter.post('/cadastrarTopico', isAuth, isProfessor, forumController.cadastrarTopico);
forumRouter.post('/cadastrarDiscussao', isAuth, upload.single('forum'), forumController.cadastrarDiscussao);
forumRouter.post('/cadastrarMensagem', isAuth, forumController.cadastrarMensagem);

forumRouter.post('/editarMensagem/:id', isAuth, forumController.editarMensagem);
forumRouter.post('/deletarMensagem/:id', isAuth, forumController.deletarMensagem);

module.exports = forumRouter;