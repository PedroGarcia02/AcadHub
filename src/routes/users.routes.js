
const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const repositorioController = require('../controllers/repositorio.controller');
const isAuth = require('../middlewares/isAuth');
const authController = require('../controllers/auth.controller');
const isAdmin = require('../middlewares/isAdmin');
const isDiretor = require('../middlewares/isDiretor');
const upload = require('../middlewares/multer.js');
const path = require('path');
const fs = require('fs');

const usersRouter = Router();

usersRouter.get('/', isAuth, usersController.home);
usersRouter.get('/users', isAuth, usersController.getAll);
usersRouter.get('/login', usersController.mostrarLogin);
usersRouter.post('/logar',  authController.login);
usersRouter.get('/logout', isAuth, authController.logoff);
usersRouter.get('/user/:id', isAuth, usersController.perfil);
usersRouter.get('/deleteUser/:id', isAdmin, usersController.delete);
usersRouter.post('/updateUser/:id', isAuth, upload.single('user'), usersController.update);
usersRouter.get('/updateUser/:id', isAuth, usersController.mostrarUpdate);
usersRouter.get('/updateSenha', isAuth, usersController.mostrarUpdateSenha);
usersRouter.post('/updateSenha', isAuth, usersController.updateSenha);

usersRouter.post('/cadastrar', isAuth, isDiretor, usersController.registrarUsuario);
usersRouter.get('/cadastro', isAuth, isDiretor, usersController.mostrarCadastro);
usersRouter.get('/painel', isAuth, isDiretor, usersController.mostrarPainel);


module.exports = usersRouter;