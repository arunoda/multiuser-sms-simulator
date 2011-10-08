//Core Communication Functions

function SMS() {
	
	var events = new EventEmitter2({
		wildcard: true, 
		maxListeners: 50
    });
	/**
		Send Mobile Originated Message
	*/

	this.sendMo = function sendMo(myAddress, message) {
		
		socket.emit('MO', appId, myAddress, message);
	}

	/**
	Handling MT messages
	*/
	var onSmsCallbacks = [];
	var onBroadcastCallbacks = [];

	this.on = function() {
		events.on.apply(events, arguments);	
	};

	socket.on(appId, function(toAddress, message) {

		if(toAddress == 'all_registered') {
			//broadcast
			events.emit('broadcast', message);
		} else {
			events.emit('sms.' + toAddress, message);
		}
	});
}