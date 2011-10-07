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