var _ = require('lodash')
    ;

function objFilter( val, key ){
    
    return ['__v'].indexOf( key ) < 0;
}

exports.clean = function( obj ){

    if (obj.toObject){

        obj = obj.toObject();
    }

    var type = typeof obj;
    
    if ( type === 'array' || obj.length ){
        
        return _.map( obj, this.clean );

    } else if ( obj.length === 0 ){

        return [];

    } else if ( type === 'object' ){

        return _.pick( obj, objFilter );

    }

    return obj;
};