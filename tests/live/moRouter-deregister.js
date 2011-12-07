var MoRouter = require('live/moRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');

exports.testRouteDeregister= function(test) {
	
	var address = '45445';
	var message = 'UnREg yl';

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

	var modelMock = nodemock.mock('deregisterPhone').takes(address, function() {}).calls(1, [null]);
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
