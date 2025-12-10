
const { Router } = require('express');
const repositorioController = require('../controllers/repositorio.controller');
const isAuth = require('../middlewares/isAuth');
const authController = require('../controllers/auth.controller');
const isAdmin = require('../middlewares/isAdmin');
const isProfessor = require('../middlewares/isProfessor');
const upload = require('../middlewares/multer.js');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');
const resolveCursoFromMateria = require('../middlewares/resolveCursoFromMateria');

const repositorioRouter = Router();


repositorioRouter.get('/', isAuth, repositorioController.home);
repositorioRouter.get('/disciplina/:id', isAuth, repositorioController.mostrarDisciplina);
repositorioRouter.get('/tarefa/:id', isAuth, repositorioController.mostrarTarefa);


repositorioRouter.get('/criarDisciplina/:id', isAuth, isProfessor, repositorioController.mostrarCadastroDisciplina);
repositorioRouter.get('/criarMateria/:id', isAuth, isProfessor, repositorioController.mostrarCadastroMateria);
repositorioRouter.get('/criarConteudo/:id', isAuth, isProfessor, repositorioController.mostrarCadastroConteudo);
repositorioRouter.get('/criarTarefa/:id', isAuth, isProfessor, repositorioController.mostrarCadastroTarefa);

repositorioRouter.post('/tarefa/:id/enviar', isAuth, (req, res, next) => { req.tarefa_id = req.params.id; next();}, upload.single('arquivo'), repositorioController.enviarTarefa);

repositorioRouter.post("/cadastrarDisciplina", isAuth, repositorioController.cadastrarDisciplina);
repositorioRouter.post("/cadastrarMateria", isAuth, isProfessor, repositorioController.cadastrarMateria);
repositorioRouter.post("/cadastrarConteudo", isAuth, isProfessor, resolveCursoFromMateria, upload.single('conteudos'), repositorioController.cadastrarConteudo);
repositorioRouter.post("/cadastrarTarefa", isAuth, isProfessor, upload.single('tarefa'), repositorioController.cadastrarTarefa);
repositorioRouter.post('/tarefa/:id/avaliar/:envioId', isAuth, isProfessor, repositorioController.avaliarTarefa);

repositorioRouter.post('/lerConteudo/:id', isAuth, repositorioController.lerConteudo);
repositorioRouter.post('/desLerConteudo/:id', isAuth, repositorioController.desLerConteudo);

repositorioRouter.use(methodOverride('_method'));
repositorioRouter.delete('/conteudo/:id', isAuth, isProfessor, repositorioController.deletarConteudo);

repositorioRouter.get('/aiSuggestion/:disciplinaId', isAuth, repositorioController.sugerirConteudoIA);


repositorioRouter.get('/tarefa/:id/download/:arquivo', isAuth, (req, res) => {
  const { id, arquivo } = req.params;
  const filePath = path.join(__dirname, '../../uploads/tarefas', id, arquivo);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo não encontrado");
  }

  res.download(filePath);
});

repositorioRouter.get('/conteudo/:id/download/:arquivo', isAuth, (req, res) => {
    const { id, arquivo } = req.params;
    const filePath = path.join(__dirname, '../../uploads/conteudos', id, arquivo);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Arquivo não encontrado");
    }

    res.download(filePath);
});

module.exports = repositorioRouter;