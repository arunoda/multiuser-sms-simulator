var appzone = require('appzone');
var logger = require('winstoon').createLogger('mtRouter');
var request = require('request');
var express = require('express');
/**
	mtRouter will take the MT's commig from the app and route them to registered phone(s)
*/

module.exports = MtRouter;

/**
	@param port - where MO router should start
	@param model - model
*/
function MtRouter(appzoneConfig, port, model) {
	
	var sender = appzone.sender(appzoneConfig.url, appzoneConfig.appId, appzoneConfig.password);
	var correlator = 0;

	logger.info('Starting MtRouter', {port: port});
	var app = express.createServer();
	app.listen(port);
	app.use(express.bodyParser());

	//register the appCode
	app.post('/code', function(req, res) {
		
		var appCode = guidGenerator();
		var url = (req.body)? req.body.url : null;

		logger.info('registering app', {appCode: appCode, appUrl: url});
		model.registerAppCode(appCode, url, function(err) {
			
			if(!err) {
				sendSuccess(res, {code: appCode});
			} else {
				sendError(res, err);
			}
		});
	});

	//start the simulator functionalities
	app.post('/sim/:appCode', function(req, res) {
		
		var appCode = req.params.appCode;
		var message = req.body.message;
		var address = req.body.address;

		if(message && address) {
			
			logger.info('receiving MT', {message: message, address: address});
			var addressParts = address.split(':');

			if(addressParts[1] == 'all_registered') {

				//when ask for the broadcasts
				model.getPhonesByAppCode(appCode, function(err, phones) {
					
					if(!err) {
						sendBulkSms(phones, message);
						res.send(getResponse(correlator++, 'SBL-SMS-MT-2000', 'Success'));
					} else {
						logger.error('error when getting phones', {error: err});
						res.send(getResponse(correlator++, 'SBL-SMS-MT-5000', 'Internal Error'));
					}
				});
				
			} else {
				//when ask for the normal mt 
				//only sends if already registered only
				model.getAppUrlByPhone(addressParts[1], function(err, url) {
					
					if(!err && url) {
						sender.sendSms(addressParts[1], message);
						res.send(getResponse(correlator++, 'SBL-SMS-MT-2000', 'Success'));
					} else {
						logger.warn('not registered yet', {error: err});
						res.send(getResponse(correlator++, 'SBL-SMS-MT-5000', 'Not Registered Yet'));
					}
				});
			}

		} else {
			//no valid address or message
			logger.error('receiving MT - invalid address or message', {appCode: appCode});
			res.send(getResponse(correlator++, 'SBL-SMS-MT-5000', 'Invalid Params'));
		}

	});

	this.close = function close() {
		app.close();	
	};

	function sendBulkSms(addresses, message, callback) {
		
		(function startSending() {
			
			var address = addresses.shift();
			if(address) {
				
				sender.sendSms(address, message, function() {
					startSending();
				});
			} else {

				if(callback) callback();
			}

		})();				
	}
}

function getResponse(correlator, code, message) {
	
	message = (message)? message: code;

	var xml = "<mchoice_sdp_sms_response>" + 
		"<version>1.0</version>" + "<correlator>" + correlator + "</correlator>" + "<status_code>" + code + "</status_code>" + "<status_message>" + message + "</status_message>" + "</mchoice_sdp_sms_response>";

	return xml;
}

function sendError(res, err) {
		
	res.send(JSON.stringify({
		code: err.code, 
		message: err.message,
	}), 500);
}

function sendSuccess(res, values) {
	
	values = (values)? values: {success: true};
	res.contentType('application/json');
	res.send(JSON.stringify(values));
}

function guidGenerator() {
	var S4 = function() {
		return (((1+new Date().getTime() + Math.random())*0x10000)|0).toString(32).substring(1);
	};
	return (S4());
}