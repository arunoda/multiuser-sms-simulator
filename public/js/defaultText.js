$(function() {
	
	$.defaultText('#sender #phoneNo input', 'enter your phone no')
	$.defaultText('#sender #keypad textarea', 'enter your message here')

});

(function($) {
	
	$.defaultText = function(cssDiv, value) {
		
		$(cssDiv).val(value);
		$(cssDiv).keypress(function() {
			var text = $(this).val();
			if(text == value) {
				$(this).val('');
			}
		});

		$(cssDiv).focus(function() {
			var text = $(this).val();
			if(text == value) {
				$(this).val('');
			}
		});

		$(cssDiv).click(function() {
			var text = $(this).val();
			if(text == value) {
				$(this).val('');
			}
		});

		$(cssDiv).blur(function() {
			var text = $(this).val();
			if(!text || text.trim() == "") {
				$(this).val(value);
			}
		});

		function clearText() {
			
		}
	};

})(jQuery)