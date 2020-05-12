import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

// Constants used as filter rules

 // how many hours from now is considered happening now? (inclusive)
const HAPPENINGNOW_LEN = 2;
// how many hours from now does upcoming start? (inclusive)
const UPCOMING_START = 2;
// how many hours after UPCOMING_START does upcoming end? (inclusive)
const UPCOMING_LEN = 5;
// what time does morning start? (inclusive)
const MORNING_START = 4;
// what time does morning end? (exclusive)
const MORNING_END = 12;
// what time does afternoon start? (inclusive)
const AFTERNOON_START = 12;
// what time does afternoon end? (exclusive)
const AFTERNOON_END = 17;
// what time does evening start? (inclusive)
const EVENING_START = 17;
// what time does evening end? (exclusive)
const EVENING_END = 4;

@Injectable()
export class DateService {

  constructor() {}

  // Test whether two dates should be considered equivalent
  equalDates(a, b): boolean {
    return moment(a).startOf('day').isSame(moment(b), 'day');
  }

  // Test whether a given date is today
  isToday(date: Date | string): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  // Various Date Formats //

  formatTime(date: Date | string): string {
    return moment(date).format("h:mmA");
  }

  formatDate(date: Date | string): string {
    return moment(date).format("MMMM D, YYYY");
  }

  formatEventDate(event: GeoJson): string {
    let start: string = event.properties.start_time;
    let end: string = event.properties.end_time;
    if (end)
      return `${this.formatDate(start)} \u2022 ${this.formatTime(start)} - ${this.formatTime(end)}`;
    else
      return `${this.formatDate(start)} \u2022 ${this.formatTime(start)}`;
  }

  formatEventCalendarStart(event: GeoJson): string {
    let start: string = event.properties.start_time;
    return moment(start).format('YYYYMMDD') + "T" + moment(start).format('HHmmSS');
  }

  formatEventCalendarEnd(event: GeoJson): string {
    let end: string = event.properties.end_time;
    return moment(end).format('YYYYMMDD') + "T" + moment(end).format('HHmmSS');
  }

  formatEventCalendar(event: GeoJson): string {
    let dates = this.formatEventCalendarStart(event) + "/" + this.formatEventCalendarEnd(event);
    return dates;
  }

  // Checking Date Spans //

  // Test whether given date is between start and end date (inclusive)
  isBetween(mmt, start, end): boolean {
    let val = moment(mmt).valueOf();
    return (val >= moment(start).valueOf() && val <= moment(end).valueOf());
  }

  // Given a date, return the upper and lower bounds for three day view
  getViewBounds(date, view: ViewState) {
    let d = moment(date);
    let start = moment(date), end = moment(date);
    switch(view){
      case ViewState.month:
        start = d.clone().startOf('month').startOf('week');
        end = d.clone().endOf('month').endOf('week');
        break;
      case ViewState.week:
        start = d.clone().startOf('week');
        end = d.clone().endOf('week');
        break;
      case ViewState.threeday:
        start = d.clone().subtract((d.diff(moment().startOf('day'), 'days') % 3), 'd');
        end = start.clone().add(2, 'd').endOf('day');
        break;
      case ViewState.day:
        start = d.clone().startOf('day');
        end = start;
    }
    return { startDate: start, endDate: end };
  }

  // Test whether given date is in the same three-day range as another date
  inSameThreeDay(newDate, checkDate) {
    let check = moment(checkDate).startOf('day');
    let bounds = this.getViewBounds(check,ViewState.threeday);
    return this.isBetween(newDate, bounds.startDate, bounds.endDate);
  }

  // Test whether given date is in the same month as another date
  inSameMonth(newDate, checkDate) {
    return moment(newDate).isSame(moment(checkDate),'month');
  }

  // Test whether given date is in the same week as another date
  inSameWeek(newDate, checkDate) {
    return moment(newDate).isSame(moment(checkDate),'week');
  }

  // Checking Filter Tags //

  // Test whether a given date qualifies as 'happening now'
  isHappeningNow(dateStr: string): boolean {
    let range = {
      start: moment(),
      end: moment().add(HAPPENINGNOW_LEN, 'hours')
    };
    return this.isBetween(moment(dateStr), range.start, range.end);
  }

  // Test whether a given date qualifies as 'upcoming'
  isUpcoming(dateStr: string): boolean {
    let range = {
      start: moment().add(UPCOMING_START, 'hours'),
      end: moment().add(UPCOMING_START + UPCOMING_LEN, 'hours')
    };
    return this.isBetween(moment(dateStr), range.start, range.end);
  }

  // Test whether a given date qualifies as 'morning'
  isMorning(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return hour >= MORNING_START && hour < MORNING_END;
  }

  // Test whether a given date qualifies as 'afternoon'
  isAfternoon(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return hour >= AFTERNOON_START && hour < AFTERNOON_END;
  }

  // Test whether a given date qualifies as 'evening'
  isEvening(dateStr: string): boolean {
    let hour = moment(dateStr).hour();
    return (hour >= EVENING_START && hour < 24) || (hour >= 0 && hour < EVENING_END);
  }

  // Other Formatting //

  // Format Google Calendar
  formatGoogleCalendar(event: GeoJson): string {
    if (typeof event == 'undefined')
      return "";
    let href = "http://www.google.com/calendar/render?action=TEMPLATE&text=" + event.properties.name + "&dates=" + this.formatEventCalendar(event) + "&details=" + event.properties.description + "&location=" + event.properties.place.name + "&trp=false&sprop=&sprop=name:"
    return href;
  }

  // Create string for ICS file format of event
  formatICS(event: GeoJson): string {
    if (typeof event == 'undefined') {
      return "";
    }
    let data = `BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:BMaps Events
NAME:BMaps Events
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
TZURL:http://tzurl.org/zoneinfo-outlook/America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:20200207T225053Z
DTSTART;TZID=America/Los_Angeles:` + this.formatEventCalendarStart(event) +
`\nDTEND;TZID=America/Los_Angeles:` + this.formatEventCalendarEnd(event) +
`\nSUMMARY:` + event.properties.name +
`\nDESCRIPTION:` + event.properties.description +
`\nLOCATION:` + event.properties.place.names + //loc??
`\nEND:VEVENT
END:VCALENDAR`;
    return data;
  }

}
