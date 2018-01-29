currDateURL = d + " " + getMonthNameFromMonthNumber(m)+ " " + y;

function updateDate() {
	if (todayDate.getTime() == currDay.getTime()) {
		document.getElementById("leftArrow").style.display = "none";
		document.getElementById("rightArrow").style.display = "inline";
		document.getElementById("relativeDay").innerHTML =  "today";
	}
	else {
		if (currDay.getTime() == (todayDate.getTime() + milliDay)) {
			document.getElementById("relativeDay").innerHTML =  "tomorrow";
		} else {
			document.getElementById("relativeDay").innerHTML = ((currDay.getTime()-todayDate.getTime())/milliDay) +" days from today";
		}
		document.getElementById("leftArrow").style.display = "inline";
	}

	document.getElementById("currDate").innerHTML =  (getMonthNameFromMonthNumber(m) + " " + d).toLowerCase();
	//Update keyURL to current date and send to filtering function

	currDateURL = d + " " + getMonthNameFromMonthNumber(m)+ " " + y;
	keyUrl = 'http://52.53.72.98/api/v1/event-date/' + currDateURL;
	$.getJSON(keyUrl, function(data){
		//Update currDateFormattedJSON since date changed
		currDateJSON = data; //make sure to never touch
		currDate = Date.parse(getMonthNameFromMonthNumber(m)+ " "+ d + ", " + y);
		filterDateByCategory(currCategoryName);
	});
}

//Filters sidebar with either stored default events or filtered events from API
function filterDateByCategory(categoryName){
	//Compile event object
	let eventsSource = $("#sidebar-event-template").html();
	let eventsTemplate = Handlebars.compile(eventsSource);
	//Save input categoryName if different
	if (currCategoryName != categoryName){
		currCategoryName = categoryName;
		let dropdownBarText = document.getElementById('categ-dropdown-text');
		$(dropdownBarText).html(currCategoryName+"&nbsp;<span class=caret></span>");
	}
	//Filter and render currDateFormattedJSON
	if(categoryName == "all categories") {
		currDateFormattedJSON = JSON.parse(JSON.stringify(currDateJSON));
		map.getSource('events').setData(currDateFormattedJSON);
		$.each(currDateFormattedJSON.features, function(i, item ){
			formatDateItem(item);
			formatCategoryItem(item);
		});
		$('#events-mount').html(eventsTemplate({
			events: currDateFormattedJSON.features
		}));
	}
	else {
		//Clone currDateFormattedJSON to filteredJSON and filter for category
		filteredJSON = JSON.parse(JSON.stringify(currDateJSON));
		filteredJSON.features = filteredJSON.features.filter(function(item){
			if (item.properties.category == categoryName.toUpperCase()){
				return true;
			}
		});
		//Render filteredJSON to sidebar and map
		map.getSource('events').setData(filteredJSON);
		$.each(filteredJSON.features, function(i, item ){
			formatDateItem(item);
			formatCategoryItem(item);
		});
		$('#events-mount').html(eventsTemplate({
			events: filteredJSON.features
		}));
	}
}

//Detecting a key change in search and capturing it as "e"
inputBox.onkeyup = function(e){
	let eventsSource = $("#sidebar-event-template").html();
	let eventsTemplate = Handlebars.compile(eventsSource);
	let list = document.getElementById('searchList');
	if (e.which == 13){
		if (inputBox.value == "") {
			map.getSource('events').setData(currDateJSON);
			currDateFormattedJSON = JSON.parse(JSON.stringify(currDateJSON));
			$.each(currDateFormattedJSON.features, function(i, item ){
				formatDateItem(item);
				formatCategoryItem(item);
			})
			$('#events-mount').html(eventsTemplate({
				events: currDateFormattedJSON.features
			}));
		}
		else {

			map.getSource('events').setData(filteredJSON);
			$.each(filteredJSON.features, function(i, item ){
				formatDateItem(item);
				formatCategoryItem(item);
			})



			$('#events-mount').html(eventsTemplate({
				events: filteredJSON.features
				//events: currDateFormattedJSON.features
			}));
		}
		//Save input categoryName if different
		if (currCategoryName != "all categories"){
			currCategoryName = "all categories";
			let dropdownBarText = document.getElementById('categ-dropdown-text');
			$(dropdownBarText).html(currCategoryName+"&nbsp;<span class=caret></span>");
		}
		return false;
	}
	//Pass the current input into search API to create datalist
	let keyUrl = 'http://52.53.72.98/api/v1/search/' + inputBox.value + '/' + currDateURL;

	$.getJSON(keyUrl, function(data){

		//Clear the list and restart everytime we get a new input
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
		//Filter search results before rendering
		filteredJSON = JSON.parse(JSON.stringify(data));

		//Iterate through all of the elements given by the API search
		$.each(filteredJSON.features, function(i,item){
			if (i < 15){
				//Append those elements onto the datalist for the input box
				let option = document.createElement('option');
				option.value = item.properties.event_name;
				list.appendChild(option);
			}
		});
	})
}
