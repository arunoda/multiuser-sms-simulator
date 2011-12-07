var MtRouter = require('live/mtRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var request = require('request');
var ltx = require('ltx');
var EventEmitter = require('events').EventEmitter;

exports.testReceiveBroadcast= function(test) {
	
	var address = 'all_registered';
	var message = "eereetret";
	var appCode = "33hfrf";
	var appId = 'app-id';

	var eventBus = new EventEmitter();

	var sendSmsMock = nodemock.mock('sendSms').takes(1000, message, function() {}).calls(2);
	sendSmsMock.mock('sendSms').takes(2000, message, function() {}).calls(2);
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getPhonesByAppId').takes(appId, function() {}).calls(1, [null, [1000, 2000]]);
	var mtRouter = new MtRouter({}, modelMock, eventBus);

	eventBus.emit('MT-PHONE', appId, address, message);

	setTimeout(function() {
		
		mtRouter.close();
		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');

	}, 100);

};


exports.testReceiveBroadcastError= function(test) {
	
	var address = 'all_registered';
	var message = "eereetret";
	var appCode = "33hfrf";
	var appId = 'app-id';

	var eventBus = new EventEmitter();

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getPhonesByAppId').takes(appId, function() {}).calls(1, [{code: 600}]);
	var mtRouter = new MtRouter({}, modelMock, eventBus);

	eventBus.emit('MT-PHONE', appId, address, message);

	setTimeout(function() {
		
		mtRouter.close();
		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');

	}, 100);

};