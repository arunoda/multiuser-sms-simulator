var logger = require('winstoon').createLogger('setupMan');
var crypto = require('crypto');

module.exports = SetupMan;

function SetupMan(server, appStore, model) {
	
	server.post('/setup', function(req, res) {
		
		res.contentType('application/json');

		if(req.body && req.body.url) {
			//url exists	

			var url = req.body.url;
			logger.info('setup request', {url: url});
			var appId = generateAppId(url);
			var password = md5(Math.random() + appId);

			appStore.saveEntry(appId, password, url);

			res.send(JSON.stringify({
				"appId": appId,
				"password": password,
				"url": url
			}));

		} else {
			//no url exists

			logger.error('setup request with no url');
			res.send(JSON.stringify({error: "NO_URL"}));			
		}

	});

	server.post('/code', function(req, res) {
		
		res.contentType('application/json');
		var appCode = guidGenerator();

		var appId = (req.body)? req.body.appId : null;
		var appUrl = (req.body)? req.body.appUrl : null;

		if(appUrl) {
			logger.info('generating appId from the AppUrl');
			appId = generateAppId(appUrl);
		}

		appStore.getEntry(appId, function(err, app) {
			
			if(app) {
				
				logger.info('registering app', {appCode: appCode, appUrl: app.url});
				model.registerAppCode(appCode, app.url, appId, afterAppCodeRegistered);
			} else {
				res.send(JSON.stringify({error: "INVALID_APPID"}));	
			}
		});

		function afterAppCodeRegistered(err) {
					
			if(!err) {
				res.send(JSON.stringify({code: appCode}));
			} else {
				logger.error('error when registering appCode');
				res.send(JSON.stringify({error: "NO_URL"}));	
			}
		}
	});
}

function generateAppId(appUrl) {
	return md5(appUrl);
}

function md5(str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	return md5sum.digest('hex');
}

function guidGenerator() {
	var S4 = function() {
		return (((1+new Date().getTime() + Math.random())*0x10000)|0).toString(32).substring(1);
	};
	return (S4());
}