import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
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
  equalDates(a: Date | string, b: Date | string): boolean {
    return moment(a).isSame(b, 'day');
  }

  // Test whether a given date is today
  isToday(date: Date | string): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  // For a given date, retrieve time formatted i.e.     "9:30 AM"
  formatTime(date: Date | string): string {
    return moment(date).format("h:mmA");
  }

  // For a given date, retrieve date formatted i.e.     "October 13, 2022"
  formatDate(date: Date | string): string {
    return moment(date).format("MMMM D, YYYY");
  }

  // For a given event, format the date and time i.e.   "October 13, 2022 9:30 AM - 10:30 AM"
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

  // For a given event, format the start and end date for Google calendar export (as an array)    i.e.  ["20201231T193000", "20201231T223000"]
  formatEventCalendar(event: GeoJson): string {
    let dates = this.formatEventCalendarStart(event) + "/" + this.formatEventCalendarEnd(event);
    return dates;
  }

  formatGoogleCalendar(event: GeoJson): string {
    let href = "http://www.google.com/calendar/render?action=TEMPLATE&text=" + event.properties.name + "&dates=" + this.formatEventCalendar(event) + "&details=" + event.properties.description + "&location=" + event.properties.place.name + "&trp=false&sprop=&sprop=name:"
    return href;
  }

  // Create string for ICS file format of event
  formatICS(event: GeoJson): string {
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

  // Test whether given mmt is between start and end (inclusive)
  checkRange(mmt, start, end): boolean {
    let val = mmt.valueOf();
    return (val >= start.valueOf() && val <= end.valueOf());
  }

  // Test whether a given date qualifies as 'happening now'
  isHappeningNow(dateStr: string): boolean {
    let range = {
      start: moment(),
      end: moment().add(HAPPENINGNOW_LEN, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
  }

  // Test whether a given date qualifies as 'upcoming'
  isUpcoming(dateStr: string): boolean {
    let range = {
      start: moment().add(UPCOMING_START, 'hours'),
      end: moment().add(UPCOMING_START + UPCOMING_LEN, 'hours')
    };
    return this.checkRange(moment(dateStr), range.start, range.end);
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

}
