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
    // console.log("entered formatDateItem");
    // console.log(item)
    var dateOfStart = new Date(item.properties.start_time);
    // console.log(dateOfStart);
    var dateOfEnd = new Date(item.properties.end_time);
    //changing value of start_time to proper parsing
    if (item.properties.end_time != "<NONE>"){
        item.properties.start_time = formatDate(dateOfStart) + " - " + formatHour(dateOfEnd.getHours());
    }
    else {
        item.properties.start_time = formatDate(dateOfStart);
    }
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    console.log(myArray);

    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}
