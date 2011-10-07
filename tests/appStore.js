var AppStore = require('appStore');

exports.testSaveAndGet = function(test) {
		
	var appStore = new AppStore();
	appStore.saveEntry('appId', 'password', 'url');
	appStore.getEntry('appId', function(err, entry) {
		
		test.ok(!err);
		test.deepEqual(entry, {
			appId: 'appId',
			password: 'password',
			url: 'url'
		});	

		test.done();
	});
};