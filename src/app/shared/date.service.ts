import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import * as moment from 'moment';

// Constants used as filter rules
const HAPPENINGNOW_LEN = 2; // up until how many hours from now is considered happening now?
const UPCOMING_START = 2; // how many hours from now does upcoming start?
const UPCOMING_LEN = 5; // how many hours after UPCOMING_START does upcoming end?
const MORNING_START = 4; // what time does morning start? (using 24 hr clock, inclusive)
const MORNING_END = 12; // what time does morning end? (exclusive)
const AFTERNOON_START = 12;
const AFTERNOON_END = 17;
const EVENING_START = 17;
const EVENING_END = 4;

@Injectable()
export class DateService {

  constructor() {}

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

      // end might be undefined
      if (end){
        return `${this.formatDate(start)} \u2022 ${this.formatTime(start)} - ${this.formatTime(end)}`;
      }
      else {
        return `${this.formatDate(start)} \u2022 ${this.formatTime(start)}`;
      }
  }

  equalDates(a: Date | string, b: Date | string): boolean {
    return moment(a).isSame(b, 'day');
  }

  parseDateStr(dateStr: string): number {
    dateStr = dateStr.slice(0, 3) + dateStr.slice(4);
    return moment(dateStr).valueOf();
  }

  // Returns true if moment mmt is between moments start and end
  checkRange(mmt, start, end): boolean {
    let val = mmt.valueOf();
    return (val >= start.valueOf() && val <= end.valueOf());
  }

  // Returns true if given time is 'happening now'
  isHappeningNow(dateStr: string): boolean {
    let range = {
      start: moment(),
      end: moment().add(HAPPENINGNOW_LEN, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
  }

  // Returns true if given time is 'upcoming'
  isUpcoming(dateStr: string): boolean {
    let range = {
      start: moment().add(UPCOMING_START, 'hours'),
      end: moment().add(UPCOMING_START + UPCOMING_LEN, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
  }

  // Returns true if given time is 'morning'
  isMorning(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return hour >= MORNING_START && hour < MORNING_END;
  }

  // Returns true if given time is 'afternoon'
  isAfternoon(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return hour >= AFTERNOON_START && hour < AFTERNOON_END;
  }

  // Returns true if given time is 'evening'
  isEvening(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return (hour >= EVENING_START && hour < 24) || (hour >= 0 && hour < EVENING_END);
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
