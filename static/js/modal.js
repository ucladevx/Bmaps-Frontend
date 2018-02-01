function showModal(modal, features){
	var prop = features.properties;
	switch(modal){
		case 'event':
			$('.event-modal-container').removeClass('hide');
			document.getElementById("modal-image").src = prop.cover_picture;
			document.getElementById("event-date").innerHTML = prop.start_time.toString().split(" ")[0] + ' ' + prop.start_time.toString().split(" ")[1];
			document.getElementById("event-title").innerHTML = prop.event_name;
			document.getElementById("event-time").innerHTML = prop.start_time.toString().split("|")[1];
			if (prop.venue.split("name")[1].split("\"")[2]) {
				document.getElementById("event-location").innerHTML = prop.venue.split("name")[1].split("\"")[2];
			}
			else {
				document.getElementById("event-location").innerHTML = prop.venue.split("location")[1].split("street")[1].split("\"")[2];
			}
			document.getElementById("event-description").innerHTML = prop.description;
			document.getElementById("event-description").style.height = document.getElementById("event-modal").clientHeight - document.getElementById("modal-image").clientHeight - document.getElementById("event-title").clientHeight - document.getElementById("event-modal").clientHeight * 0.25;
			if (document.getElementById("event-modal").clientHeight > 560) {
				document.getElementById("event-description").style.height = document.getElementById("event-modal").clientHeight - document.getElementById("modal-image").clientHeight - document.getElementById("event-title").clientHeight - document.getElementById("event-modal").clientHeight * 0.25;
			}
			else {
				document.getElementById("event-description").style.height = document.getElementById("event-modal").clientHeight - document.getElementById("modal-image").clientHeight - document.getElementById("event-title").clientHeight - document.getElementById("event-modal").clientHeight * 0.27;
			}
			// console.log(document.getElementById("event-description").clientHeight);
			// console.log(document.getElementById("event-modal").clientHeight);
			// if the right side is larger then make sure it is only 36% of the whole screen
			// if (document.getElementById("event-description").clientHeight > document.getElementById("event-left").clientHeight) {
			// 	document.getElementById("event-description").style.height = document.getElementById("event-modal").clientHeight * 0.36;
			// }
			// console.log(document.getElementById("event-description").clientHeight);
			// console.log(document.getElementById("event-description").scrollHeight);
			// if (document.getElementById("event-description").clientHeight < document.getElementById("event-description").scrollHeight) {
			// 	console.log('i think this needs a more....');
			// 	document.getElementById("event-description").innerHTML += '<a href="" class="more-button">more...</a>'
			// 	// Click <a href="http://www.yahoo.com">here</a> to go to yahoo.
			// }
			// this is to make sure the cutting of the letters don't have issues
			// if (document.getElementById("event-description").clientHeight % 18 <= 15 && document.getElementById("event-description").clientHeight % 18 >= 3) {
			// 	document.getElementById("event-description").style.height = document.getElementById("event-description").clientHeight + (document.getElementById("event-description").clientHeight % 18);
			// }

			// break;
	}

	$('body').addClass('locked');
}

function hideModal(modal){
	switch(modal){
		case 'event':
			$('.event-modal-container').addClass('hide');
			break;
		case 'all':
			$('.modal-container').addClass('hide');
			break;
	}
}

var initModal = function(){
	$('.modal-overlay').click(function(){
		hideModal('all');
	});
	$('#left-icon').click(function(){
		hideModal('all');
	});
	$('.modal-x').click(function(){
		hideModal('all');
	});
};
