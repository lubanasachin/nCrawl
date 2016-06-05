var express		= require('express'),
    router 		= express.Router();
    config		= require("../config.json"),
    redis		= require('redis'),
    redisClient	= redis.createClient(config.redis.port,config.redis.host,{no_ready_check:true});

router.get('/',
	getReportFromRedis
);

function getReportFromRedis(req,res,next) {
    redisClient.lrange('static', 0, -1, function (error, items) {
        if (error) {
			res.response = {
				"status": "error",
				"descr": "something went wrong!",
			};
	
		} else {
			res.response = {
				"status": "success",
				"descr": "Get report success!",
				"data": items
			};
		}
    	next();
    });	
}

module.exports = router;
