var config = require('../config/oauth-providers')
   ,User = require('../models/user')
   ,passport = require('passport')
   ,LocalStrategy = require('passport-local').Strategy
   ,TwitterStrategy = require('passport-twitter').Strategy
   ,FacebookStrategy = require('passport-facebook').Strategy
   ,GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
   ;

function getUserFactoryCallback( provider ){

    return function (token, tokenSecret, profile, done) {

        var hasEmail = profile.emails && profile.emails.length;
        var query = {};
        query[ provider + '.id' ] = profile.id;
        
        if (hasEmail){
            query = { $or: [query] };
            query.$or.push({
                'email': profile.emails[0].value
            });
        }

        // find by provider id or email
        User.findOne(query, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // create a new user
                user = new User({
                    name: profile.displayName,
                    username: profile.username
                });
                user[ provider ] = profile._json;

                if (hasEmail){
                    user.email = profile.emails[0].value;
                }

                user.providers.addToSet( provider );
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    return done(err, user);
                });
            } else if (!user[ provider ] || !user[ provider ].id) {
                // set provider data
                user[ provider ] = profile._json;
                user.providers.addToSet( provider );
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    };
}

module.exports = function(app){

    var basename = app.get('basename');
    
    // serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id })
            .populate('stories', null, null,
                {
                    limit: 1,
                    sort: {
                        startTime: -1
                    }
                }
            )
            .exec(function (err, user) {
                done(err, user);
            })
            ;
    });

    // use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },

        function (email, password, done) {
            User.findOne({
                email: email
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                return done(null, user);
            });
        }
    ));

    // use twitter strategy
    passport.use(new TwitterStrategy({
            consumerKey: config.twitter.clientID,
            consumerSecret: config.twitter.clientSecret,
            callbackURL: basename + config.twitter.callbackPath
        },

        getUserFactoryCallback('twitter')
    ));

    // use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: basename + config.facebook.callbackPath
        },

        getUserFactoryCallback('facebook')
    ));

    // use google strategy
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: basename + config.google.callbackPath
        },

        getUserFactoryCallback('google')
    ));
};
