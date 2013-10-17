var error = require('../helpers/error')
    ;


function debug(req, res){
    res.set('Content-Type', 'text/plain');
    res.send(
        'Accessed route ' + req.path + '\n\n' + 
        'Request query: ' + JSON.stringify(req.query, false, 4) + '\n\n' +
        'Request body: ' + JSON.stringify(req.body, false, 4)
    );
}

module.exports = function(app){

    function mapRoutes(obj, route){
        var val;
        route = route || '';
        for (var key in obj) {
            val = obj[ key ];
            switch (typeof val) {
                case 'object':
                    if (val instanceof Array){
                        if (typeof val[0] === 'function'){
                            // get: [function(){}, function(){}, ...]
                            app[ key ](route, val);
                        } else {
                            // { '/path': [{use: ...}, {get: ...}, ...] }
                            for ( var i = 0, l = val.length; i < l; ++i ){
                                
                                mapRoutes(val[ i ], route + key);
                            }
                        }
                    } else {
                        // { '/path': { ... }}
                        mapRoutes(val, route + key);
                    }
                break;
                // get: function(){ ... }
                case 'function':
                    app[ key ](route, val);
                break;
            }
        }
    }

    var handleErrors = function (err, req, res, next){
        
        if (!err) {
            return next();
        }

        var status = err.status || 500;

        if (status !== 404){
            // log it if it's not a 404
            console.error(err.stack);
        }

        if (err.name === 'ValidationError'){

            status = 409;
        }

        res.status(status).send({
            error: {
                status: status,
                message: err.toString && err.toString() || err.message
            }
        });
    };

    // Route map
    mapRoutes({
        '/robots.txt': {
            get: function( req, res ){

                res.set('Content-Type', 'text/plain');
                res.send(app.get('robots.txt'));
            }
        },

        /**
         * Begin user-facing site navigation
         */
        
        // home page
        '/': { 
            get: function(req, res){
                res.render('index.html');
            }
        }
    });
};
