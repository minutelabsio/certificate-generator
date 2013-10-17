var express = require('express')
    ,http = require('http')
    ,os = require('os')
    ,path = require('path')
    // ,mongoose = require('mongoose')
    // ,passport = require('passport')
    ,connect = require('connect')
    ,dust = require('dustjs-linkedin')
    ,_dusthlp = require('dustjs-helpers')
    ,flash = require('connect-flash')
    // ,RedisStore = require('connect-redis')(express)
    ,app = express()
    ,config = require('./package.json')
    // ,redisClient = require('./app/services/redis-client')
    ;

// password for staging server 
function initBasicAuth(){
    app.use(connect.basicAuth(function(user, pass, fn){
        if (user === process.env.HTTP_USER && pass === process.env.HTTP_PASSWORD){

            fn(null, true);
        } else {

            fn(new Error('Not Authorized'));
        }
    }));
    app.use(function(req, res, next){

        if (req.user === true){
            req.user = null;
        }

        next();
    });
}

app.configure('development', function(){
    app.set('hostname', process.env.HOSTNAME || 'localhost');
    app.set('port', process.env.PORT || 3000);
    app.set('basename', 'http://' + (process.env.HOSTNAME || ('localhost:' + app.get('port'))));
    app.set('libdir', 'browser/library');
    app.set('robots.txt', 'User-agent: *\nDisallow: /');
    app.set('ganalytics', false);

    if (process.env.HTTP_USER){
        initBasicAuth();
    }
});

app.configure('staging', function(){
    var hostname = process.env.HOSTNAME;
    if (!hostname) throw 'env.HOSTNAME not set!';

    app.set('hostname', process.env.HOSTNAME);
    app.set('port', process.env.PORT || 3000);
    app.set('basename', 'http://' + app.get('hostname'));
    app.set('libdir', 'browser/library-build');
    app.set('view cache', true);
    app.set('robots.txt', 'User-agent: *\nDisallow: /');
    app.set('ganalytics', false);

    if (process.env.HTTP_USER){
        initBasicAuth();
    }
});

app.configure('production', function(){
    var hostname = process.env.HOSTNAME;
    if (!hostname) throw 'env.HOSTNAME not set!';

    app.set('hostname', process.env.HOSTNAME);
    app.set('port', process.env.PORT || 3000);
    app.set('basename', 'http://' + app.get('hostname'));
    app.set('libdir', 'browser/library-build');
    app.set('view cache', true);
    app.set('robots.txt', '');
    app.set('ganalytics', true);

    app.use(function(req, res, next){

        // check that we're on the correct domain
        // if not redirect
        if (req.host !== app.get('hostname')){
            
            return res.redirect(301, req.protocol + '://' + app.get('hostname') + req.path);
        }

        next();
    });
});

// General config
app.configure(function(){

    var root = '';
    
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'dust');
    app.engine('html', require('consolidate').dust);

    // app.set('mongoUri', 
    //     process.env.MONGODB_URL || 
    //     'mongodb://'+ app.get('hostname') +'/DBNAME'
    // );

    // app.set('redisUri',
    //     process.env.REDIS_URL ||
    //     'redis://localhost:6379'
    // );

    // app.set('oauthProviders', [
    //     'google'//,
    //     // 'facebook',
    //     // 'twitter'
    // ]);

    app.locals({
        version: config.version,
        canonical: app.get('basename'), // overridden by middleware
        paths: {
            'library': root + '/library'
        }
    });

    app.use(express.logger('dev'));

    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
          return /json|text|javascript|css|tpl/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // client-side resources
    app.use( app.locals.paths.library, express.static(path.join(__dirname, app.get('libdir')), { maxAge: 60 * 60 * 24 * 2 }) ); // two week cache
    // connect flash for flash messages
    app.use(flash());

    // bootstrap redis connection
    // var redis = redisClient(app.get('redisUri'));

    // app.use(express.favicon(path.join(__dirname, app.get('libdir'), '/images/favicon.ico'))); 
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    // app.use(express.cookieParser('qwerty'));

    // store the session in redis. Comes in handy when load balancing...
    // app.use(express.session({
    //     secret: 'qwerty',
    //     cookie: {  maxAge: Date.now() + 7200000 },
    //     store: new RedisStore({
    //         client: redis
    //     })
    // }));
    
    // use passport session
    // app.use(passport.initialize());
    // app.use(passport.session());
});

app.configure('development', function(){
    // app.use(express.errorHandler());
});

// Bootstrap db connection
// mongoose.connect(app.get('mongoUri'));

// init cron jobs
// require('./app/services/cron')(app);

// init authorization
// require('./app/services/auth')(app);

// setup middleware 
require('./app/middlewares/variables')(app);

app.use(app.router);
// init controllers
require('./app/controllers/controllers')(app);

// assume "not found" in the error msgs
// is a 404. this is somewhat silly, but
// valid, you can do whatever you like, set
// properties, use instanceof etc.
app.use(function(err, req, res, next){
    // treat as 404
    if (~~err.status === 404) return next();

    // log it
    console.error(err.stack);

    // error page
    res.status(500).render('500.html', { error: err });
});

// 404
app.use(function(req, res, next){
    res.status(404).render('404.html');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
