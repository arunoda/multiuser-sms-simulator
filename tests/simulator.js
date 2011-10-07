var AppStore = require('appStore');
var EventEmitter = require('events').EventEmitter;
var Simulator = require('simulator');
var appzone = require('appzone');
var express = require('express');
var rest = require('restler');
var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console);

exports.testAppzoneSendSms = function(test) {
	
	test.expect(5);
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	var app = express.createServer();
	app.use(express.bodyParser());

	app.listen(6090, function() {
		
		eventBus.on('sms', function(appId, address, message) {

			test.equal(appId, 'app');
			test.equal(address, '07223434');
			test.equal(message, 'message');
		});

		appStore.saveEntry('app', 'pass', 'url');
		var simulator = new Simulator(app, appStore, eventBus);

		var sender = appzone.sender('http://localhost:6090/sms', 'app', 'pass', 10);
		sender.sendSms('07223434', 'message', function(err, resp) {
		    
		    test.ok(!err);
		    test.ok(resp);
		    app.close();
		    test.done();
		});
	});	
};

exports.testAppzoneSendBroadcast = function(test) {
	
	test.expect(5);
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	var app = express.createServer();
	app.use(express.bodyParser());

	app.listen(6090, function() {
		
		eventBus.on('sms', function(appId, address, message) {

			test.equal(appId, 'app');
			test.equal(address, 'all_registered');
			test.equal(message, 'message');
		});

		appStore.saveEntry('app', 'pass', 'url');
		var simulator = new Simulator(app, appStore, eventBus);

		var sender = appzone.sender('http://localhost:6090/sms', 'app', 'pass', 10);
		sender.broadcastSms('message', function(err, resp) {
		    
		    test.ok(!err);
		    test.ok(resp);
		    app.close();
		    test.done();
		});
	});	
};

exports.testAppzoneSendWrongAuth = function(test) {
	
	// test.expect(1);
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	var app = express.createServer();
	app.use(express.bodyParser());

	app.listen(6090, function() {
		
		eventBus.on('sms', function(appId, address, message) {

			test.fail();
		});

		appStore.saveEntry('app', 'pass', 'url');
		var simulator = new Simulator(app, appStore, eventBus);

		rest.post('http://localhost:6090/sms', {
			username: 'sds',
			password: 'ssd'
		}).on('complete', function(data) {

			test.ok(data.match(/400/));
			app.close();
			test.done();
		}).on('error', function(err) {
			console.log(err);
			test.fail();
		});
	});	
};

exports.testAppzoneSendWrongBody = function(test) {
	
	// test.expect(1);
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	var app = express.createServer();
	app.use(express.bodyParser());

	app.listen(6090, function() {
		
		eventBus.on('sms', function(appId, address, message) {

			test.fail();
		});

		appStore.saveEntry('app', 'pass', 'url');
		var simulator = new Simulator(app, appStore, eventBus);

		rest.post('http://localhost:6090/sms', {
			username: 'app',
			password: 'pass',
			data: {
				
			}
		}).on('complete', function(data) {

			test.ok(data.match(/SBL-SMS-MT-5000/));
			app.close();
			test.done();
		}).on('error', function(err) {
			console.log(err);
			test.fail();
		});
	});	
};

exports.testMODelivery = function(test) {
	
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	
	var receiver = appzone.receiver('8734');
	receiver.onSms(function(sms) {

		test.equal(sms.address, '072111222');
		test.equal(sms.version, '1.0');
		test.equal(sms.message, 'message');
		test.ok(sms.correlator);
		setTimeout(function() {
			receiver.close();
			test.done();
		}, 10);
	});

	var app = express.createServer();
	app.use(express.bodyParser());

	appStore.saveEntry('app', 'pass', 'http://localhost:8734');
	var simulator = new Simulator(app, appStore, eventBus);

	setTimeout(function() {
		eventBus.emit('MO', 'app', '072111222', 'message');
	}, 10);
}

exports.testMODeliveryNoApp = function(test) {
	
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	
	var receiver = appzone.receiver('8734');
	receiver.onSms(function(sms) {

		test.fail();
	});

	var app = express.createServer();
	app.use(express.bodyParser());

	appStore.saveEntry('app', 'pass', 'http://localhost:8734');
	var simulator = new Simulator(app, appStore, eventBus);

	setTimeout(function() {
		eventBus.emit('MO', 'noApp', '072111222', 'message');
		setTimeout(function() {
			receiver.close();
			test.done();
		}, 100);
	}, 10);
}

exports.testMODeliveryInCorrectURL = function(test) {
	
	var appStore = new AppStore();
	var eventBus = new EventEmitter();
	
	var receiver = appzone.receiver('8734');
	receiver.onSms(function(sms) {

		test.fail();
	});

	var app = express.createServer();
	app.use(express.bodyParser());

	appStore.saveEntry('app', 'pass', 'http://localhost:873');
	var simulator = new Simulator(app, appStore, eventBus);

	setTimeout(function() {
		eventBus.emit('MO', 'app', '072111222', 'message');
		setTimeout(function() {
			receiver.close();
			test.done();
		}, 100);
	}, 10);
}