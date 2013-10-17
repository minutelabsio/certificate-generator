/**
 * General utility functions
 */
var sanitize = require('validator').sanitize
    ,check = require('validator').check
    ,S = require('string')
    ,url = require('url')
    ,_ = require('lodash')
    ,mongoose = require('mongoose')
    ;

module.exports.parseBool = function( val ){

    if (val !== undefined){
        
        if (val === true || val === 'true'){
            
            return true;

        } else if (val === false || val === 'false'){

            return false;
        }
    }

    return !!val;
};

module.exports.validObjectId = function ( str ){

    if (!str){
        return false;
    }

    if ( str instanceof mongoose.Types.ObjectId ){
        return true;
    }

    if (str.toString){
        str = str.toString();
    }

    if (typeof str !== 'string'){
        return false;
    }

    return !!(str && str.match(/^[0-9a-fA-F]{24}$/));
};

module.exports.isValidEmail = function( str ){

    try { 
        check( str ).isEmail();
    } catch( e ){
        return false;
    }

    return true;
};

module.exports.sanitizeUserInput = function( text ){

    var out = sanitize(text).xss();
    out = sanitize(out).trim();
    out = S(out).stripTags().s;
    out = out.replace(/(\r\n|\r|\n)/g, '<br/>');

    return out;
};

module.exports.rewriteUrl = function( path, query ){

    var urlObj = url.parse( path, true );
    urlObj.query = _.extend({}, urlObj.query, query);
    urlObj.pathname = urlObj.pathname;
    
    return url.format({ pathname: urlObj.pathname, query: urlObj.query });
};