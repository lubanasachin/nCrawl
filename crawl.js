var request 		= require("request"),
	config 			= require("./config.json"),
	redis   		= require('redis'),
	cheerio 		= require("cheerio"),
	async 			= require('async'),
	redisClient 	= redis.createClient(config.redis.port,config.redis.host,{no_ready_check:true}),
	multi 			= redisClient.multi(),
	seen			= [],
	base_url		= '',
	regtest;

/**
 * init crawling process 
 * @param string crawlme (website to be crawled)
*/
exports.init = function(crawlme) {

	redisClient.on("error", function (err) {
		console.log("Redis connection failed");
		process.exit();
	});

	var urlData     = crawlme.match(/^(http(s?)):\/\/(.*)?/),
		scheme      = urlData[1],
		host        = urlData[3],
		pattern     = "^http(s?)\:\/\/"+host;

		base_url 	= scheme+"://"+host;
		regtest 	= new RegExp(pattern);

	checkIfAlreadySeen([crawlme]);
	setTimeout(getPendingLinks,2000);
}

/**
 * Get pending links from redis queue 
 * @param
*/
function getPendingLinks() {
	redisClient.rpoplpush('pending','processed', function (error, item) {
		if (error) {
			console.log("Get links failed- ", err);
			return;
		}
		if(item) getLinks(item);		
		else {
			console.log('No links to crawl!');
			setTimeout(getPendingLinks,5000);
		}
	});
}

/**
 * Get links from url source code 
 * @param string tlink
*/
function getLinks(tlink) {
	request(tlink, function (error, response, body) {
	  	if (error) {
			console.log("Couldn’t get page because of error: " + error);
			return;
		}

		var $ = cheerio.load(body),
			links = $("a"),
			linkArr = [];
		links.each(function (i, link) {
			var url = $(link).attr("href");
			if(url == undefined || url === '') return;
			if(seen.indexOf(url) != -1) return;
			seen.push(url);
			url.trim();
			if(url.substr(0,2) == '//' || url.substr(0,7) == 'mailto:') return 0;
			url = modifyUrl(url);
			if(url == '' || !regtest.test(url)) return 0;
			linkArr.push(url);
		});
		getStaticContent(tlink,$);
		checkIfAlreadySeen(linkArr);
	});
}

/**
 * Modify link 
 * @param string url
*/
function modifyUrl(url) {
	if(url.substr(0,1) == '.') url = url.substr(1); 
	if(url.substr(0,1) == '/') url = base_url+url;
	if(url.indexOf("#") != '-1') url = url.substr(0,url.indexOf("#"));
	url = url.replace(/\/+$/,'');
	return url;
}

/**
 * Get static contents from url source 
 * @param string url, object dom reference $
*/
function getStaticContent(url,$) {
	var images	= $("img"),
		styles	= $("link"),
		script	= $("script"),
		dataObj	= [],
		outObj	= {};

		outObj[url] = {'images': [], 'css': [], 'script': []};

	//get images
	images.each(function(i,img) {
		var src = $(img).attr("src");
		if(src == '' || src == undefined) return;
		src = modifyUrl(src);
		dataObj.push(src);
	});
	outObj[url]['images'] = dataObj;
	dataObj = [];

	//get css stylesheets attached
	styles.each(function(i,sty) {
		var rel = $(sty).attr("rel");
		if(rel == 'stylesheet') {
			var src = $(sty).attr("href");
			if(src == '' || src == undefined) return;
			src = modifyUrl(src);
			dataObj.push(src);
		}
	});
	outObj[url]['css'] = dataObj;
	dataObj = [];

	//get javascripts attached
	script.each(function(i,js) {
		var src = $(js).attr("src");
		if(src == '' || src == undefined) return;
		src = modifyUrl(src);
		dataObj.push(src);
	});
	outObj[url]['script'] = dataObj;

	multi.rpush('static',JSON.stringify(outObj));
	multi.exec(function(err,response) {
		if(err) return;
	});
}

/**
 * Check if url is already seen (either processed or pending)
 * @param array linkArr
*/
function checkIfAlreadySeen(linkArr) {
	var checkLinks = [];
	checkLinks = linkArr.map(function(url) {
		return function(callback) {
			var urlData = url.match(/^(http(s?)):\/\/(.*)?/);
			var curscheme  = urlData[1];
			var altscheme = (curscheme === 'https') ? 'http' : 'https';
			var alturl = url.replace(curscheme,altscheme);
            isAlreadyProcessed(url, alturl, function(err,response) {
                if(err) return callback(err);
                if(response == 1) return callback(null);
                else if(response == 2) { 
                	addToPending(url,alturl,function(err, response) {
                		if(err) return callback(err);
                		if(response == 1) return callback(null);
                		else if(response == 2) { 
							console.log('PD: '+url);
							return callback(null);
						}
					});
				}
            });
		};
	});
	async.series(checkLinks, callback);
	function callback(err) {
		if (err) console.error(err);
		setTimeout(getPendingLinks,1000);
	}
}

/**
 * Add link to pending queue, if not present
 * @param string link, altlink, callback function
*/
function addToPending(link,altlink,callback) {
	redisClient.lrange('pending', 0, -1, function (error, items) {
    	if (error) return callback(error,null);
		if(items.indexOf(link) != -1 || items.indexOf(altlink) != -1) return callback(null,1);
		multi.rpush('pending',link);
		multi.exec(function(err,response) {
			if(err) return;
			return callback(null,2);
		});
	});
}

/**
 * Check if link is already processed
 * @param string link, altlink, callback function
*/
function isAlreadyProcessed(link,altlink,callback) {
	redisClient.lrange('processed', 0, -1, function (error, items) {
    	if (error) return callback(error,null);
		if(items.indexOf(link) != -1 || items.indexOf(altlink) != -1) return callback(null,1);
		return callback(null,2);
	});
}
