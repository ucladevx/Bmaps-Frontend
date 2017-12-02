function showModal(modal, prop){
	console.log("entered show modal");
	console.log(prop);
	switch(modal){
		case 'sign-up':
			$('.sign-up-modal-container').removeClass('hide');
			document.getElementById("modal-image").src = prop.cover_picture;
			document.getElementById("event-month").innerHTML = prop.start_time.split(" ")[0];
			document.getElementById("event-day").innerHTML = prop.start_time.split(" ")[1];
			document.getElementById("event-title").innerHTML = prop.event_name;
			document.getElementById("event-time").innerHTML = prop.start_time.split("|")[1];
			document.getElementById("event-location").innerHTML = prop.venue.location.street;
			document.getElementById("event-description").innerHTML = prop.description;
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
	$('.modal-x').click(function(){
		hideModal('all');
	});
};
