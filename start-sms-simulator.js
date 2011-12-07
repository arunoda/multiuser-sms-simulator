//load nconf
var nconf = require('nconf');
nconf.add('file', {file: './conf/config.json'});
nconf.load();

//load winstoon
var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console, {timestamp: true});
var logger = winstoon.createLogger('start');

//port loader
var apiPort = nconf.get('ports:api');
var simulatorPort = nconf.get('ports:simulator');
var clientPort = nconf.get('ports:client');

//loadEventBus
var EventEmitter = require('events').EventEmitter;
var eventBus = new EventEmitter();

//load appstore
var AppStore = require('./lib/appStore');
var appStore = new AppStore();

////// load live test //////

//load mongo
var mongo = require('mongoskin');
var mongoConfig = nconf.get('live:mongo');

var appCollection = mongo.db(mongoConfig.url).collection(mongoConfig.collections.app);
var phoneCollection = mongo.db(mongoConfig.url).collection(mongoConfig.collections.phone);

//load the model
var Model = require('./lib/live/model');
var liveModel = new Model(appCollection, phoneCollection);

//load Routers
var appzoneConfig = nconf.get('live:appzone');
var ports = nconf.get('live:ports');

var MtRouter = require('./lib/live/mtRouter');
var mtRouter = new MtRouter(appzoneConfig, liveModel, eventBus);

var MoRouter = require('./lib/live/moRouter');
var moRouter = new MoRouter(appzoneConfig, ports.mo, liveModel, eventBus);

///// End loading live test /////

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
var setupMan = new SetupMan(apiServer, appStore, liveModel);

//load Simulator
var Simulator = require('./lib/simulator');
var simulator = new Simulator(simulatorServer, appStore, eventBus);

var clientServer = express.createServer();
clientServer.use(express.bodyParser());
clientServer.listen(clientPort);
logger.info('Client Server started', {port: clientPort})

//Client Handler
var ClientHandler = require('./lib/clientHandler');
var clientHandler = new ClientHandler(clientServer, eventBus, apiPort);

/////////////////////////////////////////////

