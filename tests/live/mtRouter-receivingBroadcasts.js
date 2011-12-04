var MtRouter = require('live/mtRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var request = require('request');
var ltx = require('ltx');

exports.testReceiveBroadcast= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";

	var sendSmsMock = nodemock.mock('sendSms').takes(1000, message, function() {}).calls(2);
	sendSmsMock.mock('sendSms').takes(2000, message, function() {}).calls(2);
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getPhonesByAppCode').takes(appCode, function() {}).calls(1, [null, [1000, 2000]]);
	var mtRouter = new MtRouter({}, 8095, modelMock);

	request({
			method: 'POST',
			uri: 'http://localhost:8095/sim/' + appCode,
			body: JSON.stringify({address: 'list:all_registered', message: message}),
			headers: {'Content-Type': 'application/json'}
		}, function(error, response, data) {
			
			mtRouter.close();
			test.ok(!error);
			test.equal(response.statusCode, 200);
			var xml = ltx.parse(data);
			test.equal(xml.getChild('status_code').getText(), 'SBL-SMS-MT-2000');

			test.ok(sendSmsMock.assert());
			test.done();

			appzone.restore('sender');
		});

};


exports.testReceiveBroadcastError= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getPhonesByAppCode').takes(appCode, function() {}).calls(1, [{code: 600}]);
	var mtRouter = new MtRouter({}, 8095, modelMock);

	request({
			method: 'POST',
			uri: 'http://localhost:8095/sim/' + appCode,
			body: JSON.stringify({address: 'list:all_registered', message: message}),
			headers: {'Content-Type': 'application/json'}
		}, function(error, response, data) {
			
			mtRouter.close();
			test.ok(!error);
			test.equal(response.statusCode, 200);
			var xml = ltx.parse(data);
			test.equal(xml.getChild('status_code').getText(), 'SBL-SMS-MT-5000');

			test.ok(sendSmsMock.assert());
			test.done();

			appzone.restore('sender');
		});

};