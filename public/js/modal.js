function showModal(modal){
	switch(modal){
		case 'sign-up':
			$('.sign-up-modal-container').removeClass('hide');
			break;
		case 'event':
			$('.event-modal-container').removeClass('hide');
			break;
	}

	$('body').addClass('locked');
}

function hideModal(modal){
	switch(modal){
		case 'sign-up':
			$('.sign-up-modal-container').addClass('hide');
			break;
		case 'event':
			$('event-modal-container').addClass('hide');
			break;
		case 'all':
			$('.modal-container').addClass('hide');
			break;
	}
}

var initModal = function(){
	$('#overlay').click(hideModal);
	console.log("entered initModal");
	$('.sign-up-trigger-modal').click(function(){ 
		hideModal('all');
		showModal('sign-up');
	});
	$('.event-trigger-modal').click(function(){
		hideModal('all');
		showModal('event');
	});
	$('.modal-x').click(function(){
		hideModal('all');
	});
};