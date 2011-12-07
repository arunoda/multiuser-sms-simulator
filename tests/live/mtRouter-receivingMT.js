var MtRouter = require('live/mtRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var request = require('request');
var ltx = require('ltx');
var EventEmitter = require('events').EventEmitter;


exports.testReceiveNormalMt= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";
	var eventBus = new EventEmitter();

	var sendSmsMock = nodemock.mock('sendSms').takes(address, message);
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, 'http://edfdd']);
	var mtRouter = new MtRouter({}, modelMock, eventBus);

	eventBus.emit('MT-PHONE', 'appId', address, message);

	setTimeout(function() {
		
		mtRouter.close();
		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');

	}, 100);

};

exports.testReceiveNormalNoUrl= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";
	var eventBus = new EventEmitter();

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, false]);
	var mtRouter = new MtRouter({}, modelMock, eventBus);


	setTimeout(function() {
		
		mtRouter.close();
		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');

	}, 100);

};