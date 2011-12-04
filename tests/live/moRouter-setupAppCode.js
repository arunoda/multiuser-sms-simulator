var MoRouter = require('live/moRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');

exports.testAppCodeSetup = function(test) {
	
	var address = '45445';
	var code = 'codeee';

	var sendSmsMock = nodemock.mock('sendSms').takes(address, "You have successfully register with the app");
	appzone.hijack('sender', function() {
		return sendSmsMock;
	});

	var onSmsMock = nodemock.mock('onSms').takes(function() {});
	onSmsMock.calls(0, [{
		address: address,
		message: 'yl #' + code	
	}]);

	appzone.hijack('receiver', function(port) {
		return onSmsMock;
	});

	var modelMock = nodemock.mock('registerPhone').takes(address, code, function() {}).calls(2, [null, true]);

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


// exports.testAppCodeSetupNoAppCode = function(test) {
	
// 	var address = '45445';
// 	var code = 'codeee';

// 	var sendSmsMock = nodemock.mock('sendSms').takes(address, "There is no such appCode exists");
// 	appzone.hijack('sender', function() {
// 		return sendSmsMock;
// 	});

// 	var onSmsMock = nodemock.mock('onSms').takes(function() {});
// 	onSmsMock.calls(0, [{
// 		address: address,
// 		message: '#' + code	
// 	}]);

// 	appzone.hijack('receiver', function(port) {
// 		return onSmsMock;
// 	});

// 	var modelMock = nodemock.mock('registerPhone').takes(address, code, function() {}).calls(2, [null, false]);

// 	var moRouter = new MoRouter({}, 8090, modelMock);

// 	setTimeout(function() {
		
// 		test.ok(sendSmsMock.assert());
// 		test.ok(onSmsMock.assert());
// 		test.ok(modelMock.assert());
// 		test.done();

// 		appzone.restore('sender');
// 		appzone.restore('receiver');
// 	}, 100);

// };

// exports.testAppCodeSetupError = function(test) {
	
// 	var address = '45445';
// 	var code = 'codeee';

// 	var sendSmsMock = nodemock.mock('sendSms').takes(address, "You have successfully register with the app");
// 	appzone.hijack('sender', function() {
// 		return sendSmsMock;
// 	});

// 	var onSmsMock = nodemock.mock('onSms').takes(function() {});
// 	onSmsMock.calls(0, [{
// 		address: address,
// 		message: '#' + code	
// 	}]);

// 	appzone.hijack('receiver', function(port) {
// 		return onSmsMock;
// 	});

// 	var modelMock = nodemock.mock('registerPhone').takes(address, code, function() {}).calls(2, [null, true]);

// 	var moRouter = new MoRouter({}, 8090, modelMock);

// 	setTimeout(function() {
		
// 		test.ok(sendSmsMock.assert());
// 		test.ok(onSmsMock.assert());
// 		test.ok(modelMock.assert());
// 		test.done();

// 		appzone.restore('sender');
// 		appzone.restore('receiver');
// 	}, 100);

// };

