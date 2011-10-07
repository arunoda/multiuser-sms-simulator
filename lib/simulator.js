var express = require('express');
var logger = require('winstoon').createLogger('simulator');

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

	server.post('/sms', function(req, res) {

		req.body = (req.body)? req.body: {};
		if(req.remoteUser != "fail") {
			
			var appId = req.remoteUser.appId;
			var message = req.body.message;
			var address = req.body.address;

			if(message && address) {
				
				logger.info('receiving MT', {appId: appId, message: message, address: address});
				var addressParts = address.split(':');
				eventBus.emit('sms', appId, addressParts[1], message);
				res.send(getResponse(correlator++, 'SBL-SMS-MT-2000', 'Success'));

			} else {
				//no valid address or message
				logger.error('receiving MT - invalid address or message', {url: url});
				res.send(getResponse(correlator++, 'SBL-SMS-MT-5000', 'Invalid Params'));
			}

		} else {
			//send Error 400
			res.send(getResponse(correlator++, 400, 'Unauthorized'));
		}
		
	});
}

function getResponse(correlator, code, message) {
	
	message = (message)? message: code;

	var xml = "<mchoice_sdp_sms_response>" + 
		"<version>1.0</version>" + "<correlator>" + correlator + "</correlator>" + "<status_code>" + code + "</status_code>" + "<status_message>" + message + "</status_message>" + "</mchoice_sdp_sms_response>";

	return xml;
}
