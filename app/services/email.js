var nodemailer = require('nodemailer')
    ,path = require('path')
    ,error = require('../helpers/error')
    ,consolidate = require('consolidate')
    ,config = require('../config/app.conf.json')
    ,_ = require('lodash')
    ,smtpTransport = nodemailer.createTransport('SMTP', config.mail.smtp)
    ,defaults = {
        to: null,
        from: config.mail.from,
        replyTo: config.mail.replyTo,
        subject: config.mail.subject,

        template: null,
        text: null
    }
    ;

exports.send = function( options, data, callback ){
    
    _.defaults( options, defaults );

    if ( typeof data === 'function' ){
        callback = data;
        data = null;
    }

    callback = callback || function(){};

    if ( !options.to ) {
        return callback(error('No recipients defined in the .to parameter'));
    }

    if ( data ){

        if (!options.template){
            return callback(error('No template provided to render data'));
        }

        data.settings = { strip: false };

        consolidate.dust( 
            path.join(
                __dirname, 
                '../../', 
                config.mail.templateBase, 
                options.template
            ),
            data,
            function (err, text) {

                if (err){
                    return callback(err);
                }
            
                options.text = text;
                smtpTransport.sendMail( options, callback );
            }
        );   
    } else {

        smtpTransport.sendMail( options, callback );
    }
};