var restify = require('restify')
    ,url = require('url')
    ,_ = require('lodash')
    ,when = require('when')
    ;

var client = function( opts ){

    opts.name = opts.name || 'restify';
    opts.type = opts.type || 'application/octet-stream';
    opts.log = opts.log || restify.bunyan.createLogger(opts.name);
    opts.type = 'json';

    this.basePath = opts.basePath || '';
    this.data = opts.data || {};
    
    restify.JsonClient.call(this, opts);
};

client.prototype = _.extend(new restify.createJsonClient(), {

    parsePath: function( path, data ){

        var urlObj = url.parse( path, true );
        urlObj.query = _.extend({}, this.data, urlObj.query, data);
        urlObj.pathname = this.basePath + urlObj.pathname;
        
        return url.format({ pathname: urlObj.pathname, query: urlObj.query });
    },

    /**
     * Page through results of a GET request
     * @param  {String}   path     Starting Path
     * @param  {Object}   obj      Query string params as object
     * @param  {Function} callback The iterator. Should return path of next page. otherwise iteration will stop
     * @return {Promise}
     */
    paginate: function( path, obj, callback ){

        var self = this
            ,dfd = when.defer()
            ;

        if (!callback){
            callback = obj;
            obj = null;
        }

        // send a request with the provided path
        self.get( path, obj, function(err, req, res, data){

            var nextPath;

            // if there's an error, fail
            if (err){
                return dfd.reject(err);
            }

            // call the callback
            nextPath = callback.call(self, req, res, data);

            // accomodate the possibility of async returns
            when( nextPath, function( nextPath ){

                // if the path is not a string, stop traversing
                // also prevent infinite loop
                if ( typeof nextPath !== 'string' || nextPath === path ){

                    return dfd.resolve({ req: req, res: res });
                }

                // recurse down the pages...
                self.paginate( nextPath, callback ).then( dfd.resolve, dfd.reject );

            }, dfd.reject);
        });

        return dfd.promise;
    }
});

var queryWrapFn = function( fn, path, data, callback ){

    if (!callback){
        callback = data;
        data = null;
    }

    return fn.call(this, this.parsePath(path, data), callback);
};

var dataWrapFn = function( fn, path, data, callback ){

    if (!callback){
        callback = data;
        data = null;
    }

    return fn.call(this, path, _.extend({}, this.data, data), callback);
};

client.prototype.get = _.wrap(client.prototype.get, queryWrapFn);
client.prototype.head = _.wrap(client.prototype.head, queryWrapFn);
client.prototype.del = _.wrap(client.prototype.del, queryWrapFn);

client.prototype.put = _.wrap(client.prototype.put, dataWrapFn);
client.prototype.post = _.wrap(client.prototype.post, dataWrapFn);

module.exports = client;
