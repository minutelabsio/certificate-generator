/*
 *  Generic require login routing middleware
 */

var _ = require('lodash')
    ,self = exports
    ;

exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        if (req.xhr){
            return res.status(401).send({
                error: {
                    status: 401,
                    message: 'Not Authenticated'
                }
            });
        }
        req.flash('error', 'You must log in to proceed.');
        return res.redirect('/login');
    }
    next();
};

/*
 * Check admin status
 */
exports.requiresAdmin = function (req, res, next){
    self.requiresLogin(req, res, function(){
        var user = req.user;
        if (!user.isAdmin){
            if (req.xhr){
                return res.status(401).send({
                    error: {
                        status: 401,
                        message: 'Not Authorized'
                    }
                });
            }
            req.flash('error', 'Not Authorized');
            return res.redirect('/login');
        }
        next();
    });
};

exports.requiresModerator = function (req, res, next){
    self.requiresLogin(req, res, function(){
        var user = req.user;
        if (!user.isModerator){
            if (req.xhr){
                return res.status(401).send({
                    error: {
                        status: 401,
                        message: 'Not Authorized'
                    }
                });
            }
            req.flash('error', 'Not Authorized');
            return res.redirect('/login');
        }
        next();
    });
};
