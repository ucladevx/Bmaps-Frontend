import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventService } from '../event.service';
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
  private today: CalendarDay;
  private currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private filteredMonthYearEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: GeoJson[];
  private eventsByDayHakan : { [day: number ] : GeoJson[] } = {};

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      this.selectedMonth = moment().month();
      this.selectedYear = moment().year();
      this.fillEventsByDay();
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    this.showCalendar(new Date());
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('week');
    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      // console.log(this.getEventsOnDate(d));
      let weekDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(dateInMonth, 'month'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d),
      };
      if (d == moment()){
        this.today = weekDay;
      }
      this.days.push(weekDay);
      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this.selectedDay = weekDay;
        this.onSelect(weekDay);
      }
    }
  }

  changeWeek(delta: number): void {
    // 1 means advance one month, -1 means go back one month
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    if (newWeek.isSame(moment(), 'week')) {
      // if current month, make selected day today
      this.showCalendar( new Date());
    }
    else {
      // make selected day the 1st of the week
      this.showCalendar(newWeek.startOf('week'));
    }
    this.selectedMonth = newWeek.month();
    this.selectedYear = newWeek.year();
    let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    this.eventService.updateMonthEvents(monthyear);
  }

  fillEventsByDay(){
    this.filteredMonthYearEvents.forEach(el => {
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      if(this.eventsByDayHakan[dayOfYear] == undefined){
        this.eventsByDayHakan[dayOfYear] = [];
      }
      this.eventsByDayHakan[dayOfYear].push(el);
    });
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    let dayOfYear = date.dayOfYear();
    if (dayOfYear in this.eventsByDayHakan){
      return this.eventsByDayHakan[dayOfYear];
    }
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    this.selectedDay = day;
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    this.eventService.updateEvents(date);
  }
}
