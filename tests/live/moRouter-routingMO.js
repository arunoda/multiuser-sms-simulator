var MoRouter = require('live/moRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var express = require('express');

exports.testRouteMOBasic = function(test) {

	var address = '45445';
	var message = 'hello message';

	var onSmsMock = nodemock.mock('onSms').takes(function() {});
	onSmsMock.calls(0, [{
		address: address,
		message: message
	}]);

	appzone.hijack('receiver', function(port) {
		return onSmsMock;
	});

	var modelMock = nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, 'http://localhost:9076/app']);

	var app = express.createServer();
	app.listen(9076, function() {
		
		var moRouter = new MoRouter({}, 8090, modelMock);
	});

	app.use(express.bodyParser());
	app.post('/app', function(req, res) {
		
		test.deepEqual(req.body, {address: address, message: message});
		test.ok(onSmsMock.assert());
		test.ok(modelMock.assert());

		test.done();
		appzone.restore('receiver');
	});
};

exports.testRouteMONoUrl= function(test) {
	
	var address = '45445';
	var message = 'dfdfdf';

	var sendSmsMock = nodemock.mock('sendSms').takes(address, "You have not registerd with an app");
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var onSmsMock = nodemock.mock('onSms').takes(function() {});
	onSmsMock.calls(0, [{
		address: address,
		message: message
	}]);

	appzone.hijack('receiver', function(port) {
		return onSmsMock;
	});

	var modelMock = nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, null]);
	var moRouter = new MoRouter({}, 8090, modelMock);

	setTimeout(function() {
		
		test.ok(sendSmsMock.assert());
		test.ok(onSmsMock.assert());
		test.ok(modelMock.assert());
		test.done();

		appzone.restore('sender');
		appzone.restore('receiver');
	}, 100);

};

exports.testRouteMOBasicError = function(test) {

	var address = '45445';
	var message = 'dfdfdf';

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var onSmsMock = nodemock.mock('onSms').takes(function() {});
	onSmsMock.calls(0, [{
		address: address,
		message: message
	}]);

	appzone.hijack('receiver', function(port) {
		return onSmsMock;
	});

	var modelMock = nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [{error: true}]);
	var moRouter = new MoRouter({}, 8090, modelMock);

	setTimeout(function() {
		
		test.ok(sendSmsMock.assert());
		test.ok(onSmsMock.assert());
		test.ok(modelMock.assert());
		test.done();

		appzone.restore('sender');
		appzone.restore('receiver');
	}, 100);
};
