// Event was clicked on, show event information in sidebar
function showEvent(event) {
	// Get event information
	var prop = event.properties;
	var geo = event.geometry;
	var loc = event.properties.venue.name;

	// Set event information
	document.querySelector("#one-event #modal-image").src = prop.cover_picture;
	document.querySelector("#one-event #event-title").innerHTML = prop.event_name;
	document.querySelector("#one-event #event-info").innerHTML = prop.start_time + " &middot " + loc;
	document.querySelector("#one-event #event-description").innerHTML = prop.description;
	
	// Hide events listing and show event info
	$('.event-container').removeClass('hide');
	$('.event-header').removeClass('hide');
	
	$('.sidebar-header').addClass('hide');

	console.log(event);
	console.log(prop.start_time);

	// MAPBOX
	// Move map view to location
	zoomToEventLocation(geo.coordinates[0], geo.coordinates[1]);

	// Make pin for selected event blue
	var coords = "" + geo.coordinates ;
	var coordsFormatted = coords.split(",");
	showPin(coordsFormatted);
	clickEvent(prop.event_name);
}

// Back arrow clicked, hide event information and show events listing
function hideEvent(){
	// Hide event info and show events listing
	$('.event-container').addClass('hide');
	$('.event-header').addClass('hide');

	$('.sidebar-header').removeClass('hide');

	// MAPBOX
	// Hide blue pin for unselected event and unlock blue hover
	hidePin();
	unclickEvent();
}
