var AppStore = require('appStore');
var SetupMan = require('setupMan');
var express = require('express');
var rest = require('restler');
var crypto = require('crypto');

exports.testSetupOk = function(test) {
	
	var app = express.createServer();
	app.use(express.bodyParser());
	app.listen(5051, function() {
		
		var appStore = new AppStore();
		var setupMan = new SetupMan(app, appStore);

		rest.post('http://localhost:5051/setup', {

			data: {url: 'http://url'}
		}).on('complete', function(data) {
			
			test.ok(data.password);
			test.equal(data.appId, md5('http://url'));
			test.equal(data.url, 'http://url');
			app.close();
			test.done();
		});
	});
};

exports.testSetupNoUrl = function(test) {
	
	var app = express.createServer();
	app.use(express.bodyParser());
	app.listen(5051, function() {
		
		var appStore = new AppStore();
		var setupMan = new SetupMan(app, appStore);

		rest.post('http://localhost:5051/setup', {
		}).on('complete', function(data) {
			
			test.ok(data.error);
			app.close();
			test.done();
		});
	});
};

function md5(str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	return md5sum.digest('hex');
}