function showModal(modal, features){
	var prop = features.properties;
	switch(modal){
		case 'sign-up':
		// formatDate(new Date(e.features[0].properties.start_time));
			$('.sign-up-modal-container').removeClass('hide');
			document.getElementById("modal-image").src = prop.cover_picture;
			document.getElementById("event-month").innerHTML = prop.start_time.toString().split(" ")[0];
			document.getElementById("event-day").innerHTML = prop.start_time.toString().split(" ")[1];
			document.getElementById("event-title").innerHTML = prop.event_name;
			// console.log(formatDateItem(new Date(prop)));
			document.getElementById("event-time").innerHTML = prop.start_time.toString().split("|")[1];
			document.getElementById("event-location").innerHTML = prop.venue.split("location")[1].split("street")[1].split("\"")[2];
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
