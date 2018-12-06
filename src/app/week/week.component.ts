import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Router } from '@angular/router';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';
import { GeoJson } from '../map';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
}

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})

export class WeekComponent implements OnInit {
  private days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private viewDate: Date ;
  private today: CalendarDay;
  private currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private zIndexArray: { [id: number] : Number } = {};
  private weekNumber: string;
  // retrieved from UCLA online academic calendar
  private zeroWeeks: Moment[] = [
    //2018-2019
    moment([2018,8,23]),
    moment([2019,0,6]),
    moment([2019,2,30]),
    //2019-2020
    moment([2019,8,22]),
    moment([2020,0,5]),
    moment([2020,2,29]),
    //2020-2021
    moment([2020,8,27]),
    moment([2021,0,4]),
    moment([2021,2,29]),
    //2021-2022
    moment([2021,8,19]),
    moment([2022,0,2]),
    moment([2022,2,28]),
    //2022-2023
    moment([2022,8,19]),
    moment([2023,0,9]),
    moment([2023,3,2])
  ];

  //constructor statement
  constructor(private eventService: EventService, private dateService: DateService, private router: Router) { }

  ngOnInit() {
    //subscriptions
    this.eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.showCalendar(this.viewDate);
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
      if(document.getElementById("week-view-indicator") != null){
        this.highlightEvent(clickedEventInfo);
      }
    });
    //on startup
    this.selectedMonth = moment().month();
    this.selectedYear = moment().year();
    this.viewDate = new Date();
    //update view
    this.updateWeekView();
  }

  //update the week view
  updateWeekView(){
    //update month events (subscribed to by ngOnInit)
    this.eventService.updateWeekEvents(this.viewDate);
    //set scroll bar to show view of rogughly 8am-10pm
    document.getElementById("scrollable").scrollTop = 270;
  }

  //set the week number
  enumerateWeek(){
    //count weeks
    var weekCount;
    //iterate backwards through zeroWeeks array to find the first positive week
    for(var i = this.zeroWeeks.length-1; i>=0; i--){
      //determine week count
      weekCount = Math.floor(moment(this.viewDate).diff(this.zeroWeeks[i],'days') / 7);
      //handle zero week
      if(weekCount>=0){
        if(i%3 != 0){ weekCount++; }
        i = -1;
      }
    }
    // Week 11 -> Finals Week
    if(weekCount == 11){
      this.weekNumber = "Finals Week";
    }
    // Week 12+ or Week 0- -> Break
    else if(weekCount > 11 || weekCount < 0 || weekCount == undefined){
      this.weekNumber = "";
    }
    // Week 0-12 -> Within Quarter
    else {
      this.weekNumber = "Week " + weekCount;
    }
  }

  //display the calendar
  showCalendar(dateInMonth: Moment | Date | string): void {
    //fill events by day for the week
    this.fillEventsByDay();
    //update week Number
    this.enumerateWeek();
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('week');
    if(parseInt(lastDay.format('DD')) > 3 && parseInt(lastDay.format('DD')) < 7){
      this.currentMonth.add(1,'month');
    }
    //fill days
    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      //create CalendarDay object
      let weekDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(this.currentMonth, 'month'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d)
      };
      //determine whether it is the current day
      if (d.format("MMMM DD YYYY") == moment().format("MMMM DD YYYY")){
        this.today = weekDay;
      }
      //add weekDay to display days array
      this.days.push(weekDay);
      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this.selectedDay = weekDay;
        this.onSelect(weekDay);
      }
    }
  }

  //increment or decrement week
  changeWeek(delta: number): void {
    // 1 means advance one week, -1 means go back one week
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    //update selectedMonth and selectedYear
    this.selectedMonth = newWeek.month();
    this.selectedYear = newWeek.year();
    // if current week, make selected day today
    if (newWeek.isSame(moment(), 'week')) {
      //update view date
      this.viewDate = new Date();
      //update view
      this.updateWeekView();
    }
    // make selected day the 1st of the week
    else {
      //update view date
      this.viewDate = newWeek.startOf('week').toDate();
      //update view
      this.updateWeekView();
    }
  }

  //retrieve events for the given week
  fillEventsByDay(){
    //clear events by day for the week
    this.eventsByDay = [];
    //iterate through filteredEvents for the current month
    this.filteredEvents.forEach(el => {
      //determine dayOfYear
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      //if the dayOfYear is not included, add it
      if(!this.eventsByDay.hasOwnProperty(dayOfYear)){
        this.eventsByDay[dayOfYear] = [];
      }
      //add the current event to that day
      this.eventsByDay[dayOfYear].push(el);
    });
  }
  //retrieve events for a specific day
  getEventsOnDate(date: Moment): GeoJson[] {
    //determine day of year
    let dayOfYear = date.dayOfYear();
    //retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear)){
      //sort array by start time, then by duration
      var eventList = this.eventsByDay[dayOfYear];
      eventList.sort(function compare(a, b) {
        var timeA = +new Date(a.properties.start_time);
        var timeB = +new Date(b.properties.start_time);
        if(timeA-timeB == 0){
          var timeAA = +new Date(a.properties.end_time);
          var timeBB = +new Date(b.properties.end_time);
          return timeBB - timeAA;
        }
        return timeA - timeB;
      });
      //return sorted list of events
      return eventList;
    }
    //if no events, return empty array
    else {
      return [];
    }
  }

  //highlight selected day
  onSelect(day: CalendarDay): void {
    //update selectedDay
    this.selectedDay = day;
    //create date for that day
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    //update sidebar to display events for that date
    this.eventService.updateEvents(date);
  }
  //open event in sidebar
  openEvent(event: GeoJson): void{
    //update clicked event
    this.eventService.updateClickedEvent(event);
    //route to new event detail component
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
    this.eventService.updateExpandedEvent(event);
  }
  //bold event when opened
  highlightEvent(clickedEventInfo: GeoJson): void{
    //restyle currently selected event card
    if(this.clickedEvent != null){
      var selCard = document.getElementById("event-"+this.clickedEvent.id);
      if(selCard != null){
        selCard.style.fontWeight = "normal";
        selCard.style.zIndex = this.zIndexArray[this.clickedEvent.id];
      }
    }
    //update clicked event
    this.clickedEvent = clickedEventInfo;
    //style new clicked event
    if(this.clickedEvent != null){
      var eCard = document.getElementById("event-"+this.clickedEvent.id);
      if(eCard != null){
        eCard.style.fontWeight = "bold";
        eCard.style.zIndex = "100";
      }
    }
  }

  //retrieve and format event title and event time
  eventName(event: GeoJson): string{
    return event.properties.name;
  }
  eventTime(event: GeoJson): string{
    return this.dateService.formatTime(event.properties.start_time) + " - " + this.dateService.formatTime(event.properties.end_time);
  }

  //determine the position of the current time bar
  currentTime() {
    //retrieve current time moment
    var now = moment();
    //calculate top position
    return this.convertTimeToPercent(now)+"%";
  }

  //convert time to top percentage in css
  convertTimeToPercent(time: Moment) {
    var increment = 3.875;
    var p = 4;
    if(time.format("A") == "PM"){
      p += 46.5;
      increment = 3.83;
    }
    p += (parseInt(time.format("H"))%12)*increment;
    p += (parseInt(time.format("mm"))/15)*(increment/4.2);
    return p;
  }

  // position and size event to match actual start time and duration
  styleEvent(event: GeoJson, events: GeoJson[]) {
    // CALCULATE TOP //
    var start = moment(event.properties.start_time);
    var top = this.convertTimeToPercent(start);
    // CALCULATE HEIGHT //
    var temp = moment(event.properties.end_time);
    var hours = moment.duration(temp.diff(start)).asHours();
    if(hours>24){ hours = (hours%24)+1; }
    var end = start.clone().add(hours,"hours");
    var bottom = this.convertTimeToPercent(end)
    var height = bottom-top;
    if(height<0){ height = 100-top; }
    // CALCULATE WIDTH AND LEFT //
    var overlapped = [];
    var eventIndex = 0;
    //iterate through surrounding events
    for(var j = 0; j < events.length; j++){
        if(events[j] == event){ eventIndex = overlapped.length; }
        //retrieve start and end time for new event
        var s = moment(events[j].properties.start_time);
        var t = moment(events[j].properties.end_time);
        var h = moment.duration(t.diff(s)).asHours();
        if(h>24){ h = (h%24)+1; }
        var e = s.clone().add(h,"hours");
        //determine whether events overlap
        if(!s.isSame(end) && !e.isSame(start) &&
            ((s.isSame(start) && e.isSame(end)) ||
            (s.isSameOrAfter(start) && s.isBefore(end)) ||
            (e.isSameOrAfter(start) && e.isBefore(end)) ||
            (start.isSameOrAfter(s) && start.isBefore(e)) ||
            (end.isSameOrAfter(s) && end.isBefore(e))))
        { overlapped.push(events[j]); }
    }
    // CALCULATE LEFT
    var left = 2+((98/overlapped.length)*eventIndex);
    // CALCULATE WIDTH
    var width = 98-left-(5*(overlapped.length-1-eventIndex));
    // CALCULATE ZINDEX
    var z = eventIndex+1;
    this.zIndexArray[event.id] = z;
    // CREATE STYLE
    var style = {
      'top' : top+"%",
      'height' : height+"%",
      'left' : left+"%",
      'width' : width+"%",
      'zIndex' : z
    }
    return style;
  }

}
