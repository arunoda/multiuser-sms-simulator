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


// SMS Store

/**
	No of messages in the store
*/
function SmsStore(limit) {
	
	limit = (limit)? limit : 20;

	var all = generateArray();
	var broadcasts = generateArray();
	var phones = {};

	this._all = all;
	this._broadcasts = broadcasts;
	this._phones = phones;

	this.addSmsMo = function(to, message) {
		
		addSms(to, message, 'MO');
		addToAll(to, message, 'MO');
	};

	this.addSmsMt = function(to, message) {
		
		addSms(to, message, 'MT');
		addToAll(to, message, 'MT');
	};

	this.addBroadcast = function(message) {
		
		broadcasts.unshift({
			message: message,
			address: 'broadcast',
			type: 'MT',
			time: new Date().getTime()
		});
		broadcasts.pop();

		addToAll('broadcast', message, 'MT');

		//add broadcast to each phoneNo
		for(var phoneNo in phones) {
			phones[phoneNo].unshift({
				message: message,
				address: 'broadcast',
				type: 'MT',
				time: new Date().getTime()
			});
			phones[phoneNo].pop();
		}
	};

	/**
		@param phoneNo - phoneNo which we need to get SMS
		@return all the messages for the given phoneNo or give all if phoneNo is null
	*/
	this.getSmsFor = function(phoneNo) {
		
		if(!phoneNo) {
			return cleanMessages(all);
		} else if (phones[phoneNo]) {
			return cleanMessages(phones[phoneNo]);
		} else {
			return [];
		}
	};

	function addSms(to, message, type) {

		if(!phones[to]) {
			phones[to] = generateArray();	
		}

		phones[to].unshift({
			message: message,
			address: to,
			type: type,
			time: new Date().getTime()
		});

		phones[to].pop();
	};

	function addToAll(to, message, type) {
		
		all.unshift({
			message: message,
			address: to,
			type: type,
			time: new Date().getTime()
		});	
		all.pop();
	};

	/**
		Remove nulls and undefined in an array
		and return an new array
	*/
	function cleanMessages(arr) {

		var arrNew = [];
		for(var index in arr) {

			if(arr[index]) {
				arrNew.push(arr[index]);
			} else {
				return arrNew;
			}
		}
	}

	function generateArray() {
		
		var arr = [];
		for(var lc=0; lc<limit; lc++) {
			arr.push(undefined);
		}
		return arr;
	}

}