var express = require('express');
var logger = require('winstoon').createLogger('simulator');
var rest = require('restler');

module.exports = Simulator;

function Simulator(server, appStore, eventBus) {
	
	var correlator = 0;

	server.use(express.basicAuth(function(user, password, fn) {
		
		appStore.getEntry(user, function(err, entry) {
			
			if(entry && entry.appId == user && entry.password == password) {
				fn(null, entry);
			} else {
				logger.warn('failed user attemp', {user: user, password: password});
				fn(null, "fail");
			}
		});

	}));

	/**
		Handling Incoming MT Message and emit a message
	*/
	server.post('/sms', function(req, res) {

		req.body = (req.body)? req.body: {};
		if(req.remoteUser != "fail") {
			
			var appId = req.remoteUser.appId;
			var message = req.body.message;
			var address = req.body.address;

			if(message && address) {
				
				logger.info('receiving MT', {appId: appId, message: message, address: address});
				var addressParts = address.split(':');
				
				if (addressParts[0] == 'list') {
					//if this is an broadcast; send it to both UI and the Phone
					eventBus.emit('MT-PHONE', appId, addressParts[1], message);
					eventBus.emit('MT-UI', appId, addressParts[1], message);
						
				} else if (addressParts[1].length > 30) {
					//address from the appzone (indentified it using the length of the address)
					eventBus.emit('MT-PHONE', appId, addressParts[1], message);
				} else {
					//address from the simulator
					eventBus.emit('MT-UI', appId, addressParts[1], message);
				}

				res.send(getResponse(correlator++, 'SBL-SMS-MT-2000', 'Success'));

			} else {
				//no valid address or message
				logger.error('receiving MT - invalid address or message', {url: req.remoteUser.url});
				res.send(getResponse(correlator++, 'SBL-SMS-MT-5000', 'Invalid Params'));
			}

		} else {
			//send Error 400
			res.send(getResponse(correlator++, 400, 'Unauthorized'));
		}
		
	});

	/**
		Handling MO messages comming from eventBus and send them to the application
	*/
	eventBus.on('MO', function(appId, address, message) {
		
		logger.info('sending MO messages to the app', {appId: appId, address: address, message: message});
		appStore.getEntry(appId, function(err, entry) {
			
			if(entry) {
				rest.post(entry.url, {
					data: {
						version: "1.0",
						address: address,
						message: message,
						correlator: correlator++
					}
				}).on('complete', function(data) {

					logger.debug('sending MO completed', {url: entry.url, appId: appId, address: address, message: message});
				}).on('error', function(e, err) {

					logger.error('error MO to App', {appId: appId, address: address, message: message, url: entry.url, err: err});
				});
			} else {
				logger.warn('there is no such app but asks to MO', {appId: appId});
			}
		});
	});

}

function getResponse(correlator, code, message) {
	
	message = (message)? message: code;

	var xml = "<mchoice_sdp_sms_response>" + 
		"<version>1.0</version>" + "<correlator>" + correlator + "</correlator>" + "<status_code>" + code + "</status_code>" + "<status_message>" + message + "</status_message>" + "</mchoice_sdp_sms_response>";

	return xml;
}
