const isDiretor = (req, res, next) => {
    if (req.session.isAuth && req.session.user.tipo == 'diretor' || req.session.isAuth && req.session.user.tipo == 'admin') return next();

    res.send("NAO AUTENTICADO");
}

module.exports = isDiretor;