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
    //changing value of start_time to proper parsing
    if (item.properties.end_time != "<NONE>"){
        item.properties.start_time = formatDate(dateOfStart) + " - " + formatHour(dateOfEnd.getHours());
    }
    else {
        item.properties.start_time = formatDate(dateOfStart);
    }
}
