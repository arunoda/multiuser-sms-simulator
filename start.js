//load winstoon
var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console, {timestamp: true, colorize: true});
var logger = winstoon.createLogger('start');

//port loader
var apiPort = process.argv[2];
var simulatorPort = process.argv[3];

//loadEventBus
var EventEmitter = require('events').EventEmitter;
var eventBus = new EventEmitter();

//load appstore
var AppStore = require('./lib/appStore');
var appStore = new AppStore();

//load apiServer
var express = require('express');
var apiServer = express.createServer();
apiServer.use(express.bodyParser());

apiServer.listen(apiPort);
logger.info('API Server started', {port: apiPort});

//load simulatorServer
var simulatorServer = express.createServer();
simulatorServer.use(express.bodyParser());

simulatorServer.listen(simulatorPort);
logger.info('Simulator Server started', {port: simulatorPort})

////////////////////////////////////////////////////////////////////

//load SetupMan
var SetupMan = require('./lib/setupMan');
var setupMan = new SetupMan(apiServer, appStore);

//load Simulator
var Simulator = require('./lib/simulator');
var simulator = new Simulator(simulatorServer, appStore, eventBus);

//Client Handler
var ClientHandler = require('./lib/clientHandler');
var clientHandler = new ClientHandler(apiServer, eventBus, apiPort);

// var jqtpl = require('jqtpl');
// var fs = require('fs');
// var filename = __dirname + '/views/index.html';
// var view = fs.readFileSync(filename, 'utf8');
// console.log(filename);
// var data = jqtpl.tmpl(view, {port: apiPort});
// apiServer.get('/view', function(req, res) {

// 	console.log(apiServer);
// 	res.send(data);
// });