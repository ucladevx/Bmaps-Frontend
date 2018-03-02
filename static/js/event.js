function showEvent(event) {
	var prop = event.properties;
	var geo = event.geometry;
	var loc = event.properties.venue.name;
	document.querySelector("#one-event #modal-image").src = prop.cover_picture;
	document.querySelector("#one-event #event-title").innerHTML = prop.event_name;
	document.querySelector("#one-event #event-info").innerHTML = prop.start_time + " &middot " + loc;
	document.querySelector("#one-event #event-description").innerHTML = prop.description;
	
	$('.event-container').removeClass('hide');
	$('.event-header').removeClass('hide');
	
	$('.sidebar-header').addClass('hide');

	console.log(event);
	console.log(prop.start_time);
	zoomToEventLocation(geo.coordinates[0], geo.coordinates[1]);

	var coords = "" + geo.coordinates ;
	var coordsFormatted = coords.split(",");
	showPin(coordsFormatted);
}

function hideEvent(){
	$('.event-container').addClass('hide');
	$('.event-header').addClass('hide');

	$('.sidebar-header').removeClass('hide');

	hidePin();
}
