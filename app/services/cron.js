var config = require('../config/app.conf.json')
    ,cron = require('cron')
    ,when = require('when')
    ,cache = require('../services/cache')
    ,dataSync = require('../services/data-sync')
    ,jobs = {}
    ;

function job(name, crontime, onTick){

    if (!name || !crontime || !onTick){
        return;
    }

    if (name in jobs){
        // stop the job if already added
        jobs[ name ].cron.stop();
        jobs[ name ].fn.clear( true );
    }

    var reg = {}
        ,cronTime = new cron.CronTime( crontime )
        ,action = function(){
            var ret = onTick();
            if (when.isPromise(ret)){
                return ret;
            }
            return when(true);
        }
        // build a cached function that won't run more often than necessary
        // this deals with possibility of this script running on multiple processes
        ,fn = cache( action, name, ~~(cronTime.getTimeout() / 1000) )
        ;

    reg.fn = fn;
    reg.cron = new cron.CronJob({
        cronTime: crontime,
        start: true,
        onTick: fn
    });

    jobs[ name ] = reg;
}

module.exports = function( app ){
    
    // job('jobid', '* * * * *', function(){
    //     return when(true);
    // });
};
