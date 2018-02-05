function updateDate() {
	var $leftArrow = document.getElementById("leftArrow");
	var $rightArrow = document.getElementById("rightArrow");
	var $relativeDay = document.getElementById("relativeDay");
	var $todayBtn = document.getElementById("map-today-section");
	if (todayDate.getTime() == currDay.getTime()) {
		// TODAY, DATE MIN
		$leftArrow.style.visibility = "hidden";
		$rightArrow.style.display = "inline";
		$relativeDay.innerHTML =  "today, ";
		$todayBtn.style.display = "none";
	}
	else {
		var daysFrom = Number(((currDay.getTime()-todayDate.getTime())/milliDay).toFixed(0));
		if (daysFrom >= 60) {
			// DATE MAX
			$rightArrow.style.visibility = "hidden";
		}
		else {
			$rightArrow.style.visibility = ""
		}
		if (currDay.getTime() == (todayDate.getTime() + milliDay)) {
			// TOMORROW
			$relativeDay.innerHTML =  "tomorrow, ";
			$todayBtn.style.display = "none";
		}
		else {
			$relativeDay.innerHTML = "";
			$todayBtn.style.display = "block";
		}
		$leftArrow.style.visibility = "";
	}

	document.getElementById("currDate").innerHTML =  (getMonthNameFromMonthNumber(m) + " " + d).toLowerCase();
	//Update keyURL to current date and send to filtering function
	keyUrl = apiURL + 'event-date/' + d + '%20' + getMonthNameFromMonthNumber(m)+ '%20' + y;
	console.log(keyUrl)
	$.getJSON(keyUrl, function(data){
		//Update currDateFormattedJSON since date changed
		currDateJSON = data; //make sure to never touch
		currDateJSON.features.sort(function (a,b){
			var res = a.properties.start_time.localeCompare(b.properties.start_time)
			if (res != 0){
				return res;
			}
			else {
				console.log(a.properties.event_name);
				console.log(b.properties.event_name);
				if (a.properties.end_time != "<NONE>" && b.properties.end_time != "<NONE>"){
					//both exist
					res = a.properties.end_time.localeCompare(b.properties.end_time);
					console.log(res);
					return res;
				}
				else if (a.properties.end_time != "<NONE>" && b.properties.end_time == "<NONE>"){
					console.log(-1);
					return -1;
				}
				else if (a.properties.end_time == "<NONE>" && b.properties.end_time != "<NONE>"){
					console.log(1);
					return 1;
				}
				else{
					//no end times
					console.log(res);
					return res;
				}
			}
		});

		currDate = Date.parse(getMonthNameFromMonthNumber(m)+ " "+ d + ", " + y);

		// Update categories
		$.getJSON(apiURL + "event-categories", function(data){
				// Create object to count events under each category
				var categCount = {};

				var categDropSource = $("#category-dropdown-template").html();
				var categDropTemplate = Handlebars.compile(categDropSource);
				//Add default option to categories object
				data.categories.unshift({"category":"all categories"});

				$.each(data.categories, function(i,item){
					item.category = item.category.toLowerCase();
					categCount[item.category] = 0;
				});
				categCount['<none>'] = 0;

				// Populate category count object
				var totalNumEvents = 0;
				$.each(currDateJSON.features, function(i,event) {
					var categName = event.properties.category.toLowerCase();
					categCount[categName]++;
					totalNumEvents++;
				});
				categCount['all categories'] = totalNumEvents;

				// Attach category count info to each category
				$.each(data.categories, function(i,item){
					item.numEvents = categCount[item.category];
				});

				//Mount categories object into dropdown using handlebars
				$('#categ-dropdown-mount').html(categDropTemplate({
						categDrop: data.categories
				}));
				//Capture all elements of CategoryName and add onclick to update sidebar
				var categLinks = document.getElementsByClassName("categLink");
				var dropdownBarText = document.getElementById('categ-dropdown-text');
				$(dropdownBarText).html(currCategoryName+"&nbsp;<span class=caret></span>");
				$.each(categLinks, function(i, item){
					var categName = item.getElementsByClassName("categName")[0].innerText;
					item.addEventListener("click",function(){filterDateByCategory(categName)});
				})
		})

		filterDateByCategory(currCategoryName);
	});
}

//Filters sidebar with either stored default events or filtered events from API
function filterDateByCategory(categoryName){
	//Compile event object
	var eventsSource = $("#sidebar-event-template").html();
	var eventsTemplate = Handlebars.compile(eventsSource);
	//Save input categoryName if different
	if (currCategoryName != categoryName){
		currCategoryName = categoryName;
		var dropdownBarText = document.getElementById('categ-dropdown-text');
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
	var eventsSource = $("#sidebar-event-template").html();
	var eventsTemplate = Handlebars.compile(eventsSource);
	var list = document.getElementById('searchList');
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
			}));
		}
		//Save input categoryName if different
		if (currCategoryName != "all categories"){
			currCategoryName = "all categories";
			var dropdownBarText = document.getElementById('categ-dropdown-text');
			$(dropdownBarText).html(currCategoryName+"&nbsp;<span class=caret></span>");
		}
		return false;
	}
	//Pass the current input into search API to create datalist
	var keyUrl = apiURL + "search/"+inputBox.value;
	$.getJSON(keyUrl, function(data){
		//Clear the list and restart everytime we get a new input
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
		//Filter search results before rendering
		filteredJSON = JSON.parse(JSON.stringify(data));
		filteredJSON.features = filteredJSON.features.filter(function(item){
			//Parse item's start_time to compare to current date
			return Date.parse(new Date(item.properties.start_time).toDateString()) == currDate;
		});
		//Iterate through all of the elemnts given by the API search
		$.each(filteredJSON.features, function(i,item){
			if (i < 15){
				//Append those elements onto the datalist for the input box
				var option = document.createElement('option');
				option.value = item.properties.event_name;
				list.appendChild(option);
			}
		});
	})
}
