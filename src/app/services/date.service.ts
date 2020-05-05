import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

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

  // convert number to equivalent time (via minutes)
  convertNumToTime(minutes: number){
    let hours = (Math.floor(minutes / 60))%24;
    minutes = (minutes-(hours*60))%60;
    let minString = minutes.toString();
    if(minString.length == 1) minString = "0"+minString;
    let hourString = hours.toString();
    if(hourString.length == 1) hourString = "0"+hourString;
    let time = hourString+":"+minString;
    return time;
  }
  convertTimeToNum(time){
    return moment(time).hour()*60 + moment(time).minutes();
  }

  convertTo12Hour(time: string) {
    let splitTime = time.split(":");
    let hours = parseInt(splitTime[0]);
    let ap = "AM";
    if(hours == 0) hours = 12;
    if(hours > 12) {
      hours -= 12;
      ap = "PM";
    }
    return hours+":"+splitTime[1]+ap;
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
