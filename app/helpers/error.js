var http = require('http');

// helper for creating errors
module.exports = function( msg, code ){

    if ( typeof msg === 'number' ){
        code = msg;
        msg = http.STATUS_CODES[ code ];
    }
    
    var err = new Error( msg );
    err.status = code || 500;
    return err;
};