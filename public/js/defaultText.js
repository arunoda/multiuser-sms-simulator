$(function() {
	
	$('#sender #phoneNo input').val('enter your phone no');
	$('#sender #phoneNo input').keypress(function() {
		var text = $(this).val();
		if(text == 'enter your phone no') {
			$(this).val('');
		}
	});
	$('#sender #phoneNo input').focus(function() {
		$(this).val('');
	});

	$('#sender #phoneNo input').blur(function() {
		var text = $(this).val();
		if(!text || text.trim() == "") {
			$(this).val('enter your phone no');
		}
	});


	$('#sender #keypad textarea').val('enter your message here');
	$('#sender #keypad textarea').focus(function() {
		$(this).val('');
	});
	$('#sender #keypad textarea').blur(function() {
		var text = $(this).val();
		if(!text || text.trim() == "") {
			$(this).val('enter your message here');
		}
	});

});