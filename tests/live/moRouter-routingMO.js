var MoRouter = require('live/moRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var express = require('express');

exports.testRouteMOBasic = function(test) {

	var address = '45445';
	var message = 'hello message';
	var appId = 'app-id';

	var onSmsMock = nodemock.mock('onSms').takes(function() {});
	onSmsMock.calls(0, [{
		address: address,
		message: message
	}]);

	appzone.hijack('receiver', function(port) {
		return onSmsMock;
	});

	var modelMock = nodemock.mock('getAppIdByPhone').takes(address, function() {}).calls(1, [null, appId]);
	var eventBus = nodemock.mock('emit').takes('MO', appId, address, message);

	var moRouter = new MoRouter({}, 8090, modelMock, eventBus);

	test.ok(onSmsMock.assert());
	test.ok(modelMock.assert());
	test.ok(eventBus.assert());

	test.done();
	appzone.restore('receiver');
};

exports.testRouteMONoAppId= function(test) {
	
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

	var modelMock = nodemock.mock('getAppIdByPhone').takes(address, function() {}).calls(1, [null, null]);
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

	var modelMock = nodemock.mock('getAppIdByPhone').takes(address, function() {}).calls(1, [{error: true}]);
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
