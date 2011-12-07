var AppStore = require('appStore');
var SetupMan = require('setupMan');
var express = require('express');
var rest = require('restler');
var crypto = require('crypto');
var nodemock = require('nodemock');

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

exports.testGetCode = function(test) {
	
	test.expect(2);

	var appId = 'appId';
	var appUrl = 'http://url.com';

	var app = express.createServer();
	app.use(express.bodyParser());
	app.listen(5051, function() {
		
		var modelMock = {
			registerAppCode: function(appCode, appUrl_, appId, callback) {
				test.equal(appUrl, appUrl_);
				process.nextTick(function() {
					callback(null);
				});
			}
		};

		var appStore = new AppStore();
		appStore.saveEntry(appId, 'paas', appUrl);
		var setupMan = new SetupMan(app, appStore, modelMock);

		rest.post('http://localhost:5051/code', {

			data: {appId: appId}
		}).on('complete', function(data) {
			
			test.ok(data.code);
			app.close();
			test.done();
		});
	});
};

exports.testGetCodeInvalidAppId = function(test) {
	
	test.expect(1);

	var appId = 'appId';
	var appUrl = 'http://url.com';

	var app = express.createServer();
	app.use(express.bodyParser());
	app.listen(5051, function() {

		var appStore = new AppStore();
		var setupMan = new SetupMan(app, appStore);

		rest.post('http://localhost:5051/code', {

			data: {appId: appId}
		}).on('complete', function(data) {
			
			test.deepEqual(data, {error: "INVALID_APPID"});
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