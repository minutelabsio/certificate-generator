var rest = require('../helpers/rest')
    ,error = require('../helpers/error')
    ,cache = require('../services/cache')
    ,when = require('when')
    ,_ = require('lodash')
    ;

var Controller = function Controller( config, ext ){

    var self = this;

    if ( ext ){

        _.extend( this, ext );
    }

    _.bindAll( this );

    config = config || {};
    this.model = config.model;

    if (!this.model){
        throw 'No model specified';
    }

    this.indexQuery = _.extend({}, config.indexQuery);
    this.kind = this.model.modelName.toLowerCase();
    this.populate = config.populate || '';
    this.schemaKeys = _(this.model.schema.paths).keys().without('_id', '__v').value();

    _.each([ 'index', 'create', 'read', 'update', 'del' ].concat(_.keys(ext)), function( key ){

        var fn = this[ key ];

        // create a function that will just send the results of this method
        fn.andSend = function(req, res, next){

            fn( req, res, function (err, result){

                if (err){
                    return next( err );
                }

                res.send( result );
            });
        }.bind(this);

    }, this);

    // enable cache for document list
    this.getDocumentList = cache(this.getDocumentList, function(){

        return 'controller-list-' + self.kind + ':' + JSON.stringify(Array.prototype.slice.call( arguments ));

    }, 60 * 60, this).fresh(); // 1 hour cache

    if ( this.init ){
        this.init();
    }
};

// filter out body parameters that aren't in the model schema
Controller.prototype.filterPaths = function ( obj, keys ) {
    return _.pick(obj, keys || this.schemaKeys);
};

Controller.prototype.getDocumentList = function(){

    var self = this
        ,query = self.indexQuery
        ;
    
    return when(
        self.model
            .find(query)
            .populate( self.populate )
            .exec()
    );
};

Controller.prototype.clearCache = function(){

    if (this.getDocumentList.clear){
        this.getDocumentList.clear(true);
    }
};

// list all non-hidden documents
Controller.prototype.index = function (req, res, next) {

    var self = this;
    
    self.getDocumentList().then(function( data ){

        next( null, data );

    }, next);
};

// create a new document
Controller.prototype.create = function (req, res, next) {
    
    var self = this
        ,thing = new self.model( self.filterPaths( req.body, this.createKeys ) )
        ;

    thing.save(function(err, doc){

        if (err){
            return next( err );
        }

        // clear cache
        self.clearCache();

        next( null, rest.clean( doc ) );
    });
};

// read a target document 
Controller.prototype.read = function (req, res, next) {

    var self = this;

    next(null, rest.clean( req[ self.kind ] ) );
};

// update a target document
Controller.prototype.update = function (req, res, next) {
    
    var self = this
        ,props = self.filterPaths( req.body, this.updateKeys )
        ;
        
    req[ self.kind ]
        .set( props )
        .save(function(err, doc){

            if (err){
                return next( err );
            }

            // clear cache
            self.clearCache();

            next( null, rest.clean( doc ) );
        })
        ;
};

// delete a target document
Controller.prototype.del = function (req, res, next) {
    
    var self = this;

    req[ self.kind ].remove(function(err, doc){

            if (err){
                return next( err );
            }

            // clear cache
            self.clearCache();

            next( null, 204 );
        })
        ;
};

// load a target document
Controller.prototype.load = function (req, res, next, id) {
        
    var self = this;

    self.model
        .findOne({ _id: id })
        .populate( self.populate )
        .exec(function (err, doc){

            if (err || !doc){
                return next( error('Could not find ' + self.kind, 404) );
            }

            req[ self.kind ] = doc;

            next();
        })
        ;
};

module.exports = Controller;
