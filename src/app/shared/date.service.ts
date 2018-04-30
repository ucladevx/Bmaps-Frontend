import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import * as moment from 'moment';

@Injectable()
export class DateService {

  constructor() {

  }

  getMonthName(date: Date): string {
    return moment(date).format('MMM');
  }

  formatTime(date: Date | string): string {
    return moment(date).format("h:mmA");
  }

  formatDate(date: Date | string): string {
    return moment(date).format("MMMM D, YYYY");
  }

  formatEventDate(event: GeoJson): string {
      let start: string = event.properties.start_time;
      let end: string = event.properties.end_time;

      if (end != "<NONE>"){
        return `${this.formatDate(start)} \u2022 ${this.formatTime(start)} - ${this.formatTime(end)}`;
      }
      else {
        return `${this.formatDate(start)} \u2022 ${this.formatTime(start)}`;
      }
  }

  equalDates(a: Date | string, b: Date | string): boolean {
    return moment(a).isSame(b, 'day');
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
