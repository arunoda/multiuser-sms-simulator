var MtRouter = require('live/mtRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var request = require('request');
var ltx = require('ltx');


exports.testReceiveNormalMt= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";

	var sendSmsMock = nodemock.mock('sendSms').takes(address, message);
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, 'http://edfdd']);
	var mtRouter = new MtRouter({}, 8095, modelMock);

	request({
			method: 'POST',
			uri: 'http://localhost:8095/sim/' + appCode,
			body: JSON.stringify({address: 'tel:' + address, message: message}),
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

exports.testReceiveNormalNoUrl= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getAppUrlByPhone').takes(address, function() {}).calls(1, [null, false]);
	var mtRouter = new MtRouter({}, 8096, modelMock);

	request({
		method: 'POST',
		uri: 'http://localhost:8096/sim/' + appCode,
		body: JSON.stringify({address: 'tel:' + address, message: message}),
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

exports.testReceiveInsuffientParams= function(test) {
	
	var address = '4343';
	var message = "eereetret";
	var appCode = "33hfrf";

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock =nodemock.mock('getAppUrlByPhone').fail();
	var mtRouter = new MtRouter({}, 8093, modelMock);

	request({
		method: 'POST',
		uri: 'http://localhost:8093/sim/' + appCode,
		body: JSON.stringify({}),
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