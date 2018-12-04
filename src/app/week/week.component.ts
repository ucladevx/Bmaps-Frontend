import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
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
  private weekNumber: string;
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

  constructor(private eventService: EventService, private dateService: DateService) { }

  ngOnInit() {
    //subscriptions
    this.eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.showCalendar(this.viewDate);
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    //on startup
    this.selectedMonth = moment().month();
    this.selectedYear = moment().year();
    this.viewDate = new Date();
    //update view
    this.updateWeekView();
    document.getElementById("scrollable").scrollTop = 112;
  }

  currentTime() {
    var now = moment();
    var top = 4;
    if(moment(now).format("A") == "PM"){
      top += 41.4;
    }
    top += (parseInt(moment(now).format("H"))%12)*3.45;
    top += (parseInt(moment(now).format("mm"))/15)*0.8625;
    return top+"%";
  }

  updateWeekView(){
    //update month events (subscribed to by ngOnInit)
    this.eventService.updateWeekEvents(this.viewDate);
  }

  enumerateWeek(){
    var weekCount;
    //iterate backwards to find the first positive week
    for(var i = this.zeroWeeks.length-1; i>=0; i--){
      weekCount = Math.floor(moment(this.viewDate).diff(this.zeroWeeks[i],'days') / 7);
      if(weekCount>=0){
        if(i%3 != 0){
          weekCount++;
        }
        i = -1;
      }
    }
    if(weekCount == 11){
      this.weekNumber = "Finals Week";
    }
    else if(weekCount > 11 || weekCount < 0 || weekCount == undefined){
      this.weekNumber = "";
    }
    else {
      this.weekNumber = "Week " + weekCount;
    }
  }

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
      document.getElementById("scrollable").scrollTop = 112;
    }
    // make selected day the 1st of the week
    else {
      //update view date
      this.viewDate = newWeek.startOf('week').toDate();
      //update view
      this.updateWeekView();
      document.getElementById("scrollable").scrollTop = 112;
    }
  }

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

  getEventsOnDate(date: Moment): GeoJson[] {
    //determine day of year
    let dayOfYear = date.dayOfYear();
    //retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear)){
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
      return eventList;
    }
    //if no events, return empty array
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    //update selectedDay
    this.selectedDay = day;
    //create date for that day
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    //update sidebar to display events for that date
    this.eventService.updateEvents(date);
  }

  openEvent(event: GeoJson): void{
    this.eventService.updateClickedEvent(event);
    this.eventService.boldEvent(event);
  }

  //position and size event to match actual start time and duration
  eventTime(event: GeoJson): string{
    var start = this.dateService.formatTime(event.properties.start_time);
    var end = this.dateService.formatTime(event.properties.end_time);
    return start + " - " + end;
  }
  eventName(event: GeoJson): string{
    return event.properties.name;
  }
  eventLocation(event: GeoJson): string{
    return event.properties.place.name;
  }
  positionEvent(event: GeoJson): string{
    var start = event.properties.start_time;
    var top = 4;
    if(moment(start).format("A") == "PM"){
      top += 41.4;
    }
    top += (parseInt(moment(start).format("H"))%12)*3.45;
    top += (parseInt(moment(start).format("mm"))/15)*0.8625;
    return top+"%";
  }
  sizeEvent(event: GeoJson): string{
    var start = moment(event.properties.start_time);
    var end = moment(event.properties.end_time);
    var hours = moment.duration(end.diff(start)).asHours();
    if(hours>24){ hours = (hours%24)+1; }
    var size = hours*3.45;
    return size+"%";
  }
  handleOverlap(event: GeoJson, events: GeoJson[]): string[] {
      //get start and end time
      var start = moment(event.properties.start_time);
      var tempEnd = moment(event.properties.end_time);
      var hours = moment.duration(tempEnd.diff(start)).asHours();
      if(hours>24){ hours = (hours%24)+1; }
      var end = start.clone().add(hours,"hours");
      //store list of overlapping events
      var overlapped = [];
      var eventIndex = 0;
      //iterate through all events
      for(var j = 0; j < events.length; j++){
          //if event is the same as the event in question, set eventIndex
          if(events[j] == event){ eventIndex = overlapped.length; }
          //get start and end time of second event
          var newStart = moment(events[j].properties.start_time);
          var tempNewEnd = moment(events[j].properties.end_time);
          var newHours = moment.duration(tempNewEnd.diff(newStart)).asHours();
          if(newHours>24){ newHours = (newHours%24)+1; }
          var newEnd = newStart.clone().add(newHours,"hours");
          //if days are the same
            //Case 1: exact overlap
            if(newStart.isSame(start) && newEnd.isSame(end)){
              overlapped.push(events[j]);
            }
            //Case 1.5: overlap only on border
            else if(newStart.isSame(end) || newEnd.isSame(start)){
            }
            //Case 2: partial overlap
            else if(
              (newStart.isSameOrAfter(start) && newStart.isBefore(end)) ||
              (newEnd.isSameOrAfter(start) && newEnd.isBefore(end)) ||
              (start.isSameOrAfter(newStart) && start.isBefore(newEnd)) ||
              (end.isSameOrAfter(newStart) && end.isBefore(newEnd))
            ){
              overlapped.push(events[j]);
            }
        }
      //create dimensions for width and left
      var widthLeft = [];
      //calculate left
      var left = 2+((98/overlapped.length)*eventIndex);
      widthLeft.push(left + "%");
      //calculate width
      var width = 98-left;
      width -= (5*(overlapped.length-1-eventIndex));
      widthLeft.push(width + "%");
      //return dimensions
      return widthLeft;
    }

}
