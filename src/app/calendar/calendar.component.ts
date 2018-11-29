import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventService } from '../event.service';
import { GeoJson } from '../map';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  events: GeoJson[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  private days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private today: CalendarDay;
  private currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private filteredMonthYearEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay = new Map<number, GeoJson[]>();

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.eventService.filterHash$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      console.log(this.filteredMonthYearEvents);
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

    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');

    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      // console.log(this.getEventsOnDate(d));
      // console.log('no');
      let calendarDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(dateInMonth, 'month'),
        events: this.getEventsOnDate(d),
      };

      this.days.push(calendarDay);

      // set today's date!
      if (d.isSame(new Date(), 'day')) {
        this.today = calendarDay;
      }

      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this.selectedDay = calendarDay;
      }
    }
  }

  changeMonth(delta: number): void {
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // console.log(newMonth);
    if (newMonth.isSame(moment(), 'month')) {
      // if current month, make selected day today
      this.showCalendar( new Date());
    }
    else {
      // make selected day the 1st of the month
      this.showCalendar(newMonth.startOf('month'));
    }
    this.selectedMonth = newMonth.month();
    this.selectedYear = newMonth.year()
    let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    // this.eventService.updateMonthEvents(monthyear);
  }

  fillEventsByDay(){
    console.log('fillEventsByDay');
    console.log(this.filteredMonthYearEvents);
    this.filteredMonthYearEvents.forEach(el => {
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      console.log(el);
      let arr : GeoJson[] = [];
      arr.push(...this.eventsByDay.get(dayOfYear));
      arr.push(el);
      this.eventsByDay.set(dayOfYear,arr);
    });
    console.log(this.eventsByDay);
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    console.log('get events on date');
    let dayOfYear = date.dayOfYear();
    if (dayOfYear in this.eventsByDay){
      return this.eventsByDay.get(dayOfYear);
    }
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    this.selectedDay = day;
    console.log(this.selectedDay);
    let date = moment().date(day.dayOfMonth).month(this.selectedMonth.valueOf()).year(this.selectedYear.valueOf()).toDate();
    // console.log(date.toDate());
    // this.eventService.updateDateByDays(days);
    this.eventService.updateEvents(date);
  }
}
