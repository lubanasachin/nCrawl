'use strict'

var cluster = require('cluster'),
	args = process.argv;

if(args[2] == undefined || args[2] == '') {
	console.log("Usage node index.js 'http://xyz.com'");
	return;
}

if (cluster.isMaster) {

	var cpuCount = require('os').cpus().length;
	console.log('Total CPU Cores - ', cpuCount);

	//fork worker processes based on cores in the system
    for (var i = 0; i < cpuCount; i += 1) {
    	startWorker();
    }

    function startWorker() {
        var worker = cluster.fork();
    }

	//on worker process exit, refork it again
	cluster.on('exit', function (worker) {
		console.log('Worker ' + worker.id + ' died :(');
		startWorker();
	});

	//on worker process started
	cluster.on('listening', (worker, address) => {
		console.log(`Worker Started with PID: ${worker.process.pid} PORT: ${address.port}`);
	});


} else {
	var express 	= require('express'),
		app 		= express(),
		http 		= require('http'),
		path		= require('path'),
		crawl		= require('./crawl'),
		port 		= normalizePort(8000),
		croutes		= require('./routes/index'),
		server 		= http.createServer(app),
        bodyParser  = require('body-parser');

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
	app.set('port', port);
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
	app.use('/crawl', croutes);

    //crawl report related routes
    app.use('/crawl/*', function send(req, res) {
        res.json(res.response);
    });

	//normalize port number
	function normalizePort(val) {
		var port = parseInt(val, 10);
		if(isNaN(port)) return val;
		if(port >= 0) return port;
		return false;
	}

	//on create http server error
	function onError(error) {
		if(error.syscall !== 'listen') {
			throw error;
		}
  		var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
      			process.exit(1);
      			break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	//on create http server listening
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		crawl.init(args[2]);
	}

	module.exports = app;
 
}
