//Core Communication Functions

function SmsServer() {
	
	var events = new EventEmitter2({
		wildcard: true, 
		maxListeners: 50
    });
	/**
		Send Mobile Originated Message
	*/

	this.sendMo = function sendMo(myAddress, message) {
		
		socket.emit('MO', myAddress, message);
	}

	/**
	Handling MT messages
	*/
	var onSmsCallbacks = [];
	var onBroadcastCallbacks = [];

	this.on = function() {
		events.on.apply(events, arguments);	
	};

	socket.on('MT', function(toAddress, message) {

		console.log('%s ----- %s', toAddress, message);
		console.log(toAddress);
		console.log(message);

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
			}
		}

		return arrNew;
	}

	function generateArray() {
		
		var arr = [];
		for(var lc=0; lc<limit; lc++) {
			arr.push(undefined);
		}
		return arr;
	}

}

/******* STREAM **/

function Stream(streamId, mtDiv, moDiv, broadcastDiv) {
	
	streamId = (streamId)? streamId: 'stream';
	mtDiv = (mtDiv)? mtDiv: 'sms_mt';
	moDiv = (moDiv)? moDiv: 'sms_mo';
	broadcastDiv = (broadcastDiv)? broadcastDiv: 'sms_broadcast';
	
	//whether to hide MO or not
	var	hideMo = false;
	var filter = null;

	this.addSms = function(sms) {
		
		//do filtering
		if(sms && ((sms.address == filter) || !filter)) {
			
			if(sms.type == 'MO' && !hideMo) {

				var tmpl = $('#' + moDiv).html();
				var html = Mustache.to_html(tmpl, {
					address: sms.address,
					message: sms.message,
					time: getTimeStr(sms.time)
				});
				$('#' + streamId).prepend(html);

			} else if(sms.type == 'MT' && sms.address.toLowerCase() == 'broadcast') {
				
				var tmpl = $('#' + broadcastDiv).html();
				var html = Mustache.to_html(tmpl, {
					message: sms.message,
					time: getTimeStr(sms.time)
				});
				$('#' + streamId).prepend(html);
			} else if(sms.type == 'MT') {
				
				var tmpl = $('#' + mtDiv).html();
				var html = Mustache.to_html(tmpl, {
					address: sms.address,
					message: sms.message,
					time: getTimeStr(sms.time)
				});
				$('#' + streamId).prepend(html);
			}
		}
	};

	this.hideMo = function(value) {
		hideMo = value;
	};

	this.clear = function() {
		$('#' + streamId).empty();
	};

	this.setFilter = function(address) {
		filter = address;
	};

	this.clearFilter = function() {
		filter = null;
	};

	this.getFilter = function() {
		return filter;	
	};

	function getTimeStr(timestamp) {
		var d = new Date(timestamp);
		return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();	
	};
}