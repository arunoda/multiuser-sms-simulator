var logger = require('winstoon').createLogger('model');

module.exports = Model;

/**
	Model for the Appzone Live Test
	@param appCollection - mongoskin collection for saving app based Info
	@param phoneCollection - mongoskin collection for saving phone based Info
*/
function Model(appCollection, phoneCollection) {
	
	/**
		Register Phone with an appCode
		@param phone - phone no
		@param appCode - appCode for the app
		@param callback(err, saved);
			saved - false if appCode not exists otherwise true
			
	*/
	this.registerPhone = function(phone, appCode, callback) {
		
		appCollection.findOne({_id: appCode}, function(err, app) {
			
			if(!err) {
				
				if(app) {
					
					//saving phone Object
					var entry = {
						_id: phone,
						appCode: appCode,
						appUrl: app.url
					};
					phoneCollection.save(entry, afterSaved);

				} else {
					//sending trigger that appCode not exists
					if(callback) callback(null, false);
				}

			} else {
				logger.error('app finding error', {appCode: appCode, error: err});
				if(callback) callback(err);
			}
		});

		function afterSaved(err) {
			
			if(!err) {
				if(callback) callback(null, true);
			} else {
				logger.error('phone saving error', {phone: phone, appCode: appCode, error: err});
				if(callback) callback(err);
			}
		}
	};

	/**
		Deregister Phone

		@param phone - phone no
	*/
	this.deregisterPhone = function(phone, callback) {
		
		phoneCollection.remove({_id: phone}, function(err) {
			
			if(!err) {
				if(callback) callback();
			} else {
				logger.error('phone removing error', {phone: phone, error: err});
				if(callback) callback(err);
			}
		});

	};

	/**
		Register AppCode with AppUrl

		@param appCode - appCode
		@param appUrl - appUrl
	*/
	this.registerAppCode = function(appCode, appUrl, callback) {
		
		var entry = {
			_id: appCode,
			url: appUrl
		};

		logger.info('registering appCode', {appCode: appCode, appUrl: appUrl});
		appCollection.save(entry, function(err) {
			
			if(!err) {
				if(callback) callback();
			} else {
				logger.error('app removing error', {appUrl: appUrl, appCode: appCode, error: err});
				if(callback) callback(err);
			}
		});
	};

	/**
		Get App URL for the phone
		@param phone - phone
		@param callback(err, resp)
			resp - false if phone is not registered yet otherwise true
	*/
	this.getAppUrlByPhone = function(phone, callback) {
		
		logger.info('receiving appUrl', {phone: phone});
		phoneCollection.findOne({_id: phone}, function(err, entry) {
			
			if(!err) {
				
				if(entry) {
					
					if(callback) callback(null, entry.appUrl);
				} else {
					//not a registered phone yet
					logger.warn('phone not reg for an app', {phone: phone});
					if(callback) callback(null, false);
				}

			} else {
				
				logger.error('phone finding error', {phone: phone, error: err});
				if(callback) callback(err);
			}
		});
	};

	/**
		Get Registered Phoen no for the appCode
		@param appCode - appCode
	*/
	this.getPhonesByAppCode = function(appCode, callback) {
		
		logger.info('receiving phone', {appCode: appCode});
		phoneCollection.find({appCode: appCode}).toArray(function(err, phones) {
			
			if(!err) {
				
				var phoneNos = [];

				phones.forEach(function(item) {
					phoneNos.push(item._id);
				});

				if(callback) callback(null, phoneNos);

			} else {
				
				logger.error('phones finding error', {appCode: appCode, error: err});
				if(callback) callback(err);	
			}
		});
	};
}