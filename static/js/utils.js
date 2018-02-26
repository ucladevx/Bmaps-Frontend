function getMonthNameFromMonthNumber(monthNumber){
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[monthNumber];
}
function formatHour(hour, minutes){
    var minuteString = ""
    if (minutes != 0){
        minuteString = ":" + minutes;
    }
    if (hour > 12){
        hour -= 12;
        return hour + minuteString + " PM";
    }
    else if (hour == 12){
        return hour + minuteString + " PM";
    }
    else if (hour == 24) {
        hour -= 12;
        return hour + minuteString + " AM";
    }
    else{
        return hour +  minuteString + " AM";
    }


}
function formatDate(date) {
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    //console.log(minutes);

    if (day < 10){
        day = "0" + day;
    }
    return getMonthNameFromMonthNumber(month) + " " + day + " &middot; " + formatHour(hour, minutes);
}


function formatDateItem(item) {
<<<<<<< HEAD
    if (item.properties.start_time.toString().includes("|").toString() == "false") {
      var dateOfStart = new Date(item.properties.start_time);
      var dateOfEnd = new Date(item.properties.end_time);
      if (item.properties.end_time != "<NONE>"){
          item.properties.start_time = formatDate(dateOfStart) + " - " + formatHour(dateOfEnd.getHours());
      }
      else {
          item.properties.start_time = formatDate(dateOfStart);
      }
  } else {
    return;
  }
=======
    var dateOfStart = new Date(item.properties.start_time);
    var dateOfEnd = new Date(item.properties.end_time);
    if (item.properties.end_time != "<NONE>"){
        item.properties.start_time = formatDate(dateOfStart) + " - " + formatHour(dateOfEnd.getHours(), dateOfEnd.getMinutes());
    }
    else {
        item.properties.start_time = formatDate(dateOfStart);
    }
>>>>>>> ca92765acccffb2dbda6717617032eee58abbdad
}

function formatCategoryItem(item) {
    if (item.properties.category == "<NONE>"){
        item.properties.category = "";
    }
    else{
        item.properties.category = item.properties.category.charAt(0).toUpperCase() + item.properties.category.slice(1).toLowerCase();
    }
}

var apiURL = "http://52.53.72.98/api/v1/";

var today = new Date(); //this is being changed somewhere and I can't figure out where
var todayD = today.getDate();
var todayM = today.getMonth(); //January is 0!
var todayY = today.getFullYear();

var todayDate = new Date();
var milliDay = 86400000;

var d = todayD;
var m = todayM;
var y = todayY;

var currDay = today;
var currCategoryName = "all categories";
var currDate = "";
var currDateJSON = {
	"features": [],
	"type": "FeatureCollection"
}
var currDateFormattedJSON = {
	"features": [],
	"type": "FeatureCollection"
}
var filteredJSON = {
	"features": [],
	"type": "FeatureCollection"
}

var keyUrl = apiURL + 'event-date/' + d + '%20' + getMonthNameFromMonthNumber(m)+ '%20' + y; // json we are pulling from for event info

//Setting up datalist with searchbox
var inputBox = document.getElementById('search-input');
var list = document.getElementById('searchList');

function nextDay() {
	currDay.setDate(currDay.getDate() + 1);
	d = currDay.getDate();
	m = currDay.getMonth();
	updateDate();
}

function previousDay() {
	currDay.setDate(currDay.getDate() - 1);
	d = currDay.getDate();
	m = currDay.getMonth();
	updateDate();
}

function goToday() {
  currDay.setFullYear(todayY, todayM, todayD);
  d = currDay.getDate();
  m = currDay.getMonth();
  updateDate();
}
