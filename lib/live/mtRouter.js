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
function MtRouter(appzoneConfig, model, eventBus) {
	
	var sender = appzone.sender(appzoneConfig.url, appzoneConfig.appId, appzoneConfig.password);
	var correlator = 0;


	eventBus.on('MT-PHONE', function(appId, address, message) {
		
		if(address == 'all_registered') {

			//when ask for the broadcasts
			model.getPhonesByAppId(appId, function(err, phones) {
				
				if(!err) {
					sendBulkSms(phones, message);
				} else {
					logger.error('error when getting phones', {error: err});
				}
			});
			
		} else {
			//when ask for the normal mt 
			//only sends if already registered only
			model.getAppUrlByPhone(address, function(err, url) {
				
				if(!err && url) {
					sender.sendSms(address, message);
				} else {
					logger.warn('not registered yet', {error: err});
				}
			});
		}

	});

	logger.info('Starting MtRouter');

	this.close = function close() {
		
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


