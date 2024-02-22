let autenticacion = (req, res, next) => {
    if (req.session && req.session.usuario)
        return next();
    else
        res.redirect('/auth/login');
};

module.exports = {
    autenticacion: autenticacion
};