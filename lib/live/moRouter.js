var appzone = require('appzone');
var logger = require('winstoon').createLogger('moRouter');
var request = require('request');
/**
	moRouter will take the MO's commig from the users and route them to 
	defined application
*/

module.exports = MoRouter;

/**
	@param port - where MO router should start
	@param model - model
*/
function MoRouter(appzoneConfig, port, model) {
	
	var receiver = appzone.receiver(port);
	var sender = appzone.sender(appzoneConfig.url, appzoneConfig.appId, appzoneConfig.password);

	logger.info('Starting MoRouter', {port: port});
	receiver.onSms(function(sms) {
		
		var message = sms.message;
		var parts = message.trim().split(' ');
		if(parts[1] && parts[1].substring(0, 1) == '#') {
			
			//setup user for the app
			var appCode = parts[1].substring(1);
			model.registerPhone(sms.address, appCode, afterPhoneRegisterd);

		} else if(message.trim().toLowerCase().split(' ')[0] == "unreg") {
			
			//regegister phone when user un registered
			model.deregisterPhone(sms.address, afterPhoneDeRegistered);

		} else {
			
			//route request to the defined app
			//get the appurl
			model.getAppUrlByPhone(sms.address, afterUrlFetched);
		}


		function afterPhoneRegisterd(err, resp) {
			
			if(!err) {
				
				if(resp) {
					//succeessfull registered
					sender.sendSms(sms.address, "You have successfully register with the app");

				} else {
					//appCode not exists
					sender.sendSms(sms.address, "There is no such appCode exists");
				}

			} else {
				sender.sendSms(sms.address, "Something goes wrong. We are working on it");
			}
		}

		function afterUrlFetched(err, url) {
			
			if(!err) {
				
				if(url) {
					
					logger.info('forwarding MO to the app', {appUrl: url});
					//TODO add filters
					request({
						method: 'POST',
						uri: url,
						body: getPostBody(sms),
						headers: {'Content-Type': 'application/x-www-form-urlencoded'}
					}, function(error, response, body) {
						
						if(!error) {
							
							if(response.statusCode != 200) {
								logger.error('invalid url calling', {statusCode: response.statusCode, body: body});
							}

						} else {
							
							logger.error('error when forwading MO', {error: error});
						}
					});

				} else {
					sender.sendSms(sms.address, "You have not registerd with an app");	
				}

			} 
		}

		function afterPhoneDeRegistered(err) {
	
			if(!err) {
				logger.info('user deregistered', {address: sms.address});
			} else {
				logger.error('user deregistration error', {address: sms.address});
			}
		}

	});

	this.close = function close() {
		receiver.close();	
	};
}

function getPostBody(obj) {
	
	var str = null;
	for(var key in obj) {
		
		var part = key + '=' + escape(obj[key]);
		if(str) {
			str += '&' + part;	
		} else {
			str = part;
		}
	}

	return str;
}

/**
	Filter Messsage text to provide additional functionalities
*/
function filterMessage(input) {
	
}