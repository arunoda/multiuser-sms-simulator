var logger = require('winstoon').createLogger('setupMan');
var crypto = require('crypto');

module.exports = SetupMan;

function SetupMan(server, apiStore) {
	
	server.post('/setup', function(req, res) {
		
		res.contentType('application/json');

		if(req.body && req.body.url) {
			//url exists	

			var url = req.body.url;
			logger.info('setup request', {url: url});
			var appId = md5(url);
			var password = md5(Math.random() + appId);

			apiStore.saveEntry(appId, password, url);

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
}

function md5(str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	return md5sum.digest('hex');
}