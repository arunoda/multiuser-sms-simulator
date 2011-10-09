var stream = new Stream();
var smsStore = new SmsStore(20);
var smsServer = new SmsServer();

stream.hideMo(true);

var phoneNumbers = {};

//Initialize
$(function() {

	//do hide mo
	$('#cpanel #hideMo input').click();
	
	//focus the phoneNo
	$('#sender #phoneNo input').focus();
});

//Testing Purpose
// $(function() {
	
// 	stream.addSms({type: 'MO', address: '0718360974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MT', address: 'broadcast', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MO', address: '0738340974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MT', address: '0718360974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MO', address: '0714345574', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MT', address: '0718350974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MO', address: '0718360974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MO', address: '0733360974', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MT', address: 'broadcast', message: 'this is the message', time: new Date()});
// 	stream.addSms({type: 'MO', address: '0718360974', message: 'this is the message', time: new Date()});
// })

//Text As Me Click
function textAsMe(address) {
	
	$('#sender #phoneNo input').val(address);
	$('#sender #keypad textarea').val('').focus();
};

//Send MO
$(function() {
	
	//when send button click
	$('#sender #btnSend').click(function() {
		publishSendMo();
	});

	//when press enter
	$('#sender #keypad textarea').keypress(function(e) {
		if(e.charCode == 13 || e.charCode == 10) {
			publishSendMo();
		}
	});

});

function publishSendMo() {

	var address = $('#sender #phoneNo input').val();
	var message = $('#sender #keypad textarea').val();

	if(address) address.trim();
	if(message) message.trim();

	if(!address || !address.trim()) {
		$('#sender #phoneNo input').focus();
		return;
	} else if(!message || !message.trim()) {
		setTimeout(function() {
			$('#sender #keypad textarea').val('').focus();
		}, 0);
		return;
	}

	//add to Store
	smsStore.addSmsMo(address, message);

	//add to Stream
	stream.addSms({
		type: 'MO',
		address: address,
		message: message,
		time: new Date()
	});

	//send to Server
	smsServer.sendMo(address, message);

	//add to filterBy
	addToFilterBy(address);

	//focus textarea again
	setTimeout(function() {
		$('#sender #keypad textarea').val('').focus();
	}, 0);
}


//Filter By

$(function() {
	
	$('#cpanel #filterBy').change(function() {
		
		var address = $(this).val();
		console.log(address);

		var smsList;
		if(address == 'none') {
			smsList = smsStore.getSmsFor();	
			stream.clearFilter();
		} else {
			smsList = smsStore.getSmsFor(address);
			stream.setFilter(address);
			//set phone number to the address box
			// $('#sender #phoneNo input').val(address);
		}

		console.log(smsList);
		
		//add to stream
		stream.clear();
		
		//reverse the array befor adding to the list
		reverseArray(smsList).forEach(function(sms) {
			stream.addSms(sms);
		});

		var typingMessage = $('#sender #keypad textarea').val();
		$('#sender #keypad textarea').val(typingMessage).focus();
	});
});

//filterBy function called by the Label in the SMS
function doFilter(address) {
	if(stream.getFilter() != address) {
		$('#cpanel #filterBy').val(address).change();
	} else {
		$('#cpanel #filterBy').val('none').change();
	}
}

function addToFilterBy(address) {
	
	if(!phoneNumbers[address]) {
		phoneNumbers[address] = true;
		$('#cpanel #filterBy').append('<option value="' + address + '">' + address + '</option>');
	}
}

//Get MT Messages and Show Them in the List
smsServer.on('sms.*', function(message) {
	
	var address = this.event.substr(4);
	console.log('MT %s %s', address, message);

	//add to Store
	smsStore.addSmsMt(address, message);

	//add to Stream
	stream.addSms({
		type: 'MT',
		address: address,
		message: message,
		time: new Date()
	});

	addToFilterBy(address);
});

//handling broadcast
smsServer.on('broadcast', function(message) {
	
	var address = 'broadcast';
	console.log('MT %s %s', address, message);

	//add to Store
	smsStore.addSmsMt(address, message);

	//add to Stream
	stream.addSms({
		type: 'MT',
		address: address,
		message: message,
		time: new Date()
	});
});

function reverseArray(arr) {
	
	var newArr = [];
	arr.forEach(function(e) {
		newArr.unshift(e);
	});

	return newArr;
}

// Clear Logs
$(function() {
	$('#cpanel #btnClear').click(function() {
		stream.clear();
		var typingMessage = $('#sender #keypad textarea').val();
		$('#sender #keypad textarea').val(typingMessage).focus();
	});
});

//hideme
$(function() {
	$('#cpanel #hideMo input').click(function() {
		if($(this).is(':checked')) {
			stream.hideMo(true);
		} else {
			stream.hideMo(false);
		}
	});
});
