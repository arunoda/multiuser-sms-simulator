var logger = require('winstoon').createLogger('clientHandler');
var jqtpl = require('jqtpl');
var path = require('path');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');

module.exports = ClientHandler;

function ClientHandler(server, eventBus, apiServerPort) {

	//connect to the socket IO
	io = io.listen(server);
	io.sockets.on('connection', function (socket) {

		//sending MT messages to the mobile
		eventBus.on('sms', function(appId, address, message) {

			logger.info('sending MT to mobile', {appId: appId, address: address, message: message});
			//sending for the event appId
			//assuming each client is looking for this
			socket.emit(appId, address, message);
		});

		//sending MO Messages to the Application
		socket.on('MO', function(appId, address, message) {
			
			logger.info('sending MO to simulator', {appId: appId, address: address, message: message});
			//simulator will cache this MO event and proceed accordingly
			eventBus.emit('MO', appId, address, message);
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
				m_start: '{{', //clientside mustasche start tag
				m_end: '}}' //clientsside mustasche end tag
			};
			var data = jqtpl.tmpl(view, tmplData);
			res.send(data);
		});
	});
}