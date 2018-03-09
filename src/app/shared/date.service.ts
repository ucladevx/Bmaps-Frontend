import { Injectable } from '@angular/core';

@Injectable()
export class DateService {
  apiURL = "http://52.53.72.98/api/v1/";

  today = new Date();
  todayD = this.today.getDate();
  todayM = this.today.getMonth();
  todayY = this.today.getFullYear();

  todayDate = new Date();
  milliDay = 86400000;

  d = this.todayD;
  m = this.todayM;
  y = this.todayY;

  currDay = this.today;
  currCategoryName = "all categories";
  currDate = "";
  currDateJSON = {
    "features": [],
    "type": "FeatureCollection"
  }
  currDateFormattedJSON = {
    "features": [],
    "type": "FeatureCollection"
  }
  filteredJSON = {
    "features": [],
    "type": "FeatureCollection"
  }
  //Setting up datalist with searchbox
  inputBox = document.getElementById('search-input');
  list = document.getElementById('searchList');

  constructor() {

  }

  getMonthNameFromMonthNumber(monthNumber: number): string {
    let monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[monthNumber];
  }

  formatHour(hour, minutes){
      let minuteString = ""
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

  formatDate(date: Date): string {
      let month = date.getMonth();
      let day = date.getDate();
      let hour = date.getHours();
      let minutes = date.getMinutes();

      let dayString;
      if (day < 10) {
          dayString = "0" + day;
      }
      return this.getMonthNameFromMonthNumber(month) + " " + dayString + " &middot; " + this.formatHour(hour, minutes);
  }

  formatDateItem(item): void {
      let dateOfStart = new Date(item.properties.start_time);
      let dateOfEnd = new Date(item.properties.end_time);
      if (item.properties.end_time != "<NONE>"){
          return this.formatDate(dateOfStart) + " - " + this.formatHour(dateOfEnd.getHours(), dateOfEnd.getMinutes());
      }
      else {
          return this.formatDate(dateOfStart);
      }
  }

  formatCategoryItem(item) {
      if (item.properties.category == "<NONE>"){
          item.properties.category = "";
      }
      else{
          item.properties.category = item.properties.category.charAt(0).toUpperCase() + item.properties.category.slice(1).toLowerCase();
      }
  }

  //MOVE THIS SOMEWHERE WITHIN THE APP
  // nextDay() {
  // 	currDay.setDate(currDay.getDate() + 1);
  // 	d = currDay.getDate();
  // 	m = currDay.getMonth();
  // 	updateDate();
  // }
  //
  // previousDay() {
  // 	currDay.setDate(currDay.getDate() - 1);
  // 	d = currDay.getDate();
  // 	m = currDay.getMonth();
  // 	updateDate();
  // }
  //
  // goToday() {
  //   currDay.setFullYear(todayY, todayM, todayD);
  //   d = currDay.getDate();
  //   m = currDay.getMonth();
  //   updateDate();
  // }

}
