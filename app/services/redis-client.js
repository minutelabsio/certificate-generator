var redis = require('redis-url')
    ,client
    ;

module.exports = function( uri ){

    if ( uri || !client ){
        client = redis.connect( uri );
    }
    
    return client;
};