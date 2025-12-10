const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const createDefaultAdmin = require('./services/createAdmin');

(async () => {
    await createDefaultAdmin();
})();

// SESSION
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,      
    saveUninitialized: true,
    // cookie: { secure: true }
}));

app.use((req, res, next) => { res.locals.session = req.session; next(); });

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// RENDERIZAÇÃO DO TEMPLATE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ROTAS
const usersRouter = require('./routes/users.routes');
app.use(usersRouter);

const instituicoesRouter = require('./routes/instituicoes.routes');
app.use(instituicoesRouter);

const forumRouter = require('./routes/forum.routes');
app.use('/forum', forumRouter);

const repositorioRouter = require('./routes/repositorio.routes');
app.use('/repo', repositorioRouter);

const cron = require("node-cron");
const { gerarResumoParaDiscussao } = require('./jobs/resumo.jobs');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

cron.schedule("0 12 * * *", async () => {
  console.log("⏳ Iniciando job de resumo automático...");
  await gerarResumoParaDiscussao();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});