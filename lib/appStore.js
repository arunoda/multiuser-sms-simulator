module.exports = AppStore;

function AppStore() {
	
	var apps = {};

	this.saveEntry = function saveEntry(appId, password, url) {
		
		apps[appId] = {
			appId: appId,
			password: password,
			url: url
		};
	};

	this.getEntry = function getEntry(appId, callback) {
		
		callback(null, apps[appId]);
	};
}