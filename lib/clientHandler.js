var logger = require('winstoon').createLogger('clientHandler');
var jqtpl = require('jqtpl');
var path = require('path');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');
var nconf = require('nconf');
var EventEmitter = require('events').EventEmitter;

module.exports = ClientHandler;

function ClientHandler(server, eventBus, apiServerPort) {

	var connections = new EventEmitter();
	connections.setMaxListeners(0); //allows to add unlimited amount of listeners

	//sending MT messages to the mobile
	eventBus.on('sms', function(appId, address, message) {

		logger.info('distributing MT to clients', {appId: appId, address: address, message: message});
		connections.emit(appId, address, message);
	});

	//connect to the socket IO
	io = io.listen(server, {'log level': 2});
	io.configure(function () {
	  io.set('transports', ['flashsocket', 'xhr-polling']);
	});

	io.sockets.on('connection', function (socket) {

		//sending MO Messages to the Application
		socket.on('MO', function(address, message) {
			
			logger.info('sending MO to simulator', {appId: socket.appId, address: address, message: message});
			//simulator will cache this MO event and proceed accordingly
			eventBus.emit('MO', socket.appId, address, message);
		});

		socket.on('appId', function(appId){
			logger.info('registering to receive MTs', {appId: appId});
			socket.appId = appId;
			connections.on(appId, sendMtToClient);
		});

		function sendMtToClient(address, message) {
			
			logger.info('sending MT to client', {appId: socket.appId, address: address, message: message});
			socket.emit('MT', address, message);
		}

		socket.on('disconnect', function() {
			
			logger.info('deregistering of receiving MTs', {appId: socket.appId});
			connections.removeListener(socket.appId, sendMtToClient);
		});
	});


	//serving the page 
	var publicFolder = path.resolve(__dirname, '../public');
	var oneDay = 86400000;
	server.use(express.static(publicFolder, { maxAge: oneDay }));

	var indexFile = path.resolve(__dirname, '../views/index.html');

	server.get('/view/:appId', function(req, res) {
		
		fs.readFile(indexFile, 'utf8', function(err, view) {

			var tmplData = {
				port: apiServerPort,
				appId: req.params.appId,
				hostname: nconf.get('hostname'),
				m_start: '{{', //clientside mustasche start tag
				m_end: '}}' //clientsside mustasche end tag
			};
			var data = jqtpl.tmpl(view, tmplData);
			res.send(data);
		});
	});
}