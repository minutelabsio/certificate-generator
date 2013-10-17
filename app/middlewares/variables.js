var config = require('../config/app.conf.json');

module.exports = function( app ){

    // expose variables to views
    app.use(function(req, res, next){

        res.locals.config = config;
        res.locals.user = req.user;
        res.locals.hostname = app.get('hostname');
        res.locals.basename = app.get('basename');
        res.locals.canonical = app.get('basename') + req.path;
        res.locals.path = req.path;
        // res.locals.signinFields = req.session.signinFields;
        next();
    });

    // assign flash messages
    // app.use(function(req, res, next){

    //     res.locals.errors = req.flash('error');
    //     res.locals.info = req.flash('info');
    //     res.locals.warn = req.flash('warn');
    //     next();
    // });
};