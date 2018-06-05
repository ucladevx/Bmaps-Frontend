import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import * as moment from 'moment';
import { UCLA_CAMPUS_BOUNDARY } from '../map'

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
      end: moment().add(2, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
  }

  // Returns true if given time is 'upcoming'
  isUpcoming(dateStr: string): boolean {
    let range = {
      start: moment().add(2, 'hours'),
      end: moment().add(7, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
  }

  // Returns true if given point is 'on campus'
  // Passes in point should be [lat, lng]
  isOnCampus(point): boolean {
    let lat = point[0];
    let lng = point[1];
    let boundary = UCLA_CAMPUS_BOUNDARY['coordinates'][0];

    let isInside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        let lati = boundary[i][0], lngi = boundary[i][1];
        let latj = boundary[j][0], lngj = boundary[j][1];

        let intersect = ((lngi > lng) != (lngj > lng)) && (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
        if (intersect) {
          isInside = !isInside;
        }
    }
    return isInside;
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
