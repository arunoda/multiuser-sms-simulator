var MtRouter = require('live/mtRouter');
var horaa = require('horaa');
var appzone = horaa('appzone');
var nodemock = require('nodemock');
var request = require('request');

exports.testAppReg= function(test) {
	
	var appUrl = 'http://dfdfdgdg.com';

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelMock = {
		registerAppCode: function(appCode, appUrl, callback) {
			process.nextTick(function() {
				callback(null);
			});
		}
	};
	var mtRouter = new MtRouter({}, 8092, modelMock);

	request({
		method: 'POST',
		uri: 'http://localhost:8092/code/',
		body: JSON.stringify({url: appUrl}),
		headers: {'Content-Type': 'application/json'}
	}, function(error, response, data) {
		
		mtRouter.close();
		test.ok(!error);
		test.equal(response.statusCode, 200);
		console.log(data);
		test.ok(JSON.parse(data).code);

		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');
	});

};

exports.testAppRegError= function(test) {
	
	var appUrl = 'http://dfdfdgdg.com';

	var sendSmsMock = nodemock.mock('sendSms').fail();
	appzone.hijack('sender', function() {

		return sendSmsMock;
	});

	var modelError = {code: 540, message: "bad"};
	
	var modelMock = {
		registerAppCode: function(appCode, appUrl, callback) {
			process.nextTick(function() {
				callback(modelError);
			});
		}
	};

	var mtRouter = new MtRouter({}, 8092, modelMock);

	request({
		method: 'POST',
		uri: 'http://localhost:8092/code/',
		body: JSON.stringify({url: appUrl}),
		headers: {'Content-Type': 'application/json'}
	}, function(error, response, data) {
		
		test.ok(!error);
		test.equal(response.statusCode, 500);
		test.deepEqual(JSON.parse(data), modelError);

		test.ok(sendSmsMock.assert());
		test.done();

		appzone.restore('sender');
	});

};