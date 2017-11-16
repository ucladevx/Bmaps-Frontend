// Get the modal
var modal = document.getElementById('sign-up-modal');

// Get the button that opens the modal
var btn = document.getElementById("sign-up-button");

// Get the <span> element that closes the modal
var span = document.getElementById("close");

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
    console.log("block got clicked");
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function showModal(modal){
	switch(modal){
		case 'sign-up':
			$('.sign-up-modal-container').removeClass('hide');
			console.log("got into showModal in modal.js");
			break;
	}

	$('body').addClass('locked');
}

function hideModal(modal){
	switch(modal){
		case 'sign-up':
			$('.sign-up-modal-container').addClass('hide');
			break;
		case 'all':
			$('.modal-container').addClass('hide');
	}
}


var initModal = function(){
	// $('.modal-container .overlay').click(hideModal);
	// $('.overlay').click(hideModal);
	$('.sign-up-trigger-modal').click(function(){
		hideModal('all');
		showModal('sign-up');
	});

};
