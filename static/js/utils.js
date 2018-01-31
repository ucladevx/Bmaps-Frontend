function getMonthNameFromMonthNumber(monthNumber){
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[monthNumber];
}
function formatHour(hour){
    if (hour > 12){
        hour -= 12;
        return hour + " PM";
    }
    else{
        return hour + " AM";
    }
}
function formatDate(date) {
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    if (day < 10){
        day = "0" + day;
    }
    return getMonthNameFromMonthNumber(month) + " " + day + " | " + formatHour(hour);
}

function formatDateItem(item) {
    var dateOfStart = new Date(item.properties.start_time);
    var dateOfEnd = new Date(item.properties.end_time);
    if (item.properties.end_time != "<NONE>"){
        item.properties.start_time = formatDate(dateOfStart) + " - " + formatHour(dateOfEnd.getHours());
    }
    else {
        item.properties.start_time = formatDate(dateOfStart);
    }
}

function formatCategoryItem(item) {
    if (item.properties.category == "<NONE>"){
        item.properties.category = "";
    }
    else{
        item.properties.category = item.properties.category.charAt(0).toUpperCase() + item.properties.category.slice(1).toLowerCase();
    }
}

var today = new Date(); //this is being changed somewhere and I can't figure out where
var todayD = today.getDate();
var todayM = today.getMonth(); //January is 0!
var todayY = today.getFullYear();

let todayDate = new Date();
let milliDay = 86400000;

var d = todayD;
var m = todayM;
var y = todayY;

var currDay = today;
let currCategoryName = "all categories";
let currDate = "";
let currDateJSON = {
	"features": [],
	"type": "FeatureCollection"
}
let currDateFormattedJSON = {
	"features": [],
	"type": "FeatureCollection"
}
let filteredJSON = {
	"features": [],
	"type": "FeatureCollection"
}

let keyUrl = 'http://whatsmappening.io:5000/api/event-date/' + d + '%20' + getMonthNameFromMonthNumber(m)+ '%20' + y; // json we are pulling from for event info

//Setting up datalist with searchbox
let inputBox = document.getElementById('search-input');
let list = document.getElementById('searchList');

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
