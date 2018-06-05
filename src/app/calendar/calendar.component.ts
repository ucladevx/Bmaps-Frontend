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
  private selectedDay: CalendarDay;
  private currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private filteredMonthYearEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: GeoJson{};

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.eventService.filteredAllEvents$.subscribe(allEventCollection => {
      this.filteredMonthYearEvents = allEventCollection.features;
      console.log(this.filteredMonthYearEvents);
      this.showCalendar(new Date());
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    // this.showCalendar(new Date());
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    this.fillEventsByDay();
    this.currentMonth = moment(dateInMonth).startOf('month');

    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');

    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      console.log(this.getEventsOnDate(d));
      let calendarDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(dateInMonth, 'month'),
        events: this.getEventsOnDate(d),
      };

      this.days.push(calendarDay);

      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this.selectedDay = calendarDay;
      }
    }
  }

  changeMonth(delta: number): void {
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    console.log(newMonth);
    if (newMonth.isSame(moment(), 'month')) {
      // if current month, make selected day today
      this.showCalendar(new Date());
    }
    else {
      // make selected day the 1st of the month
      this.showCalendar(newMonth.startOf('month'));
    }
    // console.log(newMonth.month().toString() + " " + newMonth.year().toString());
    let monthyear = newMonth.month().toString() + " " + newMonth.year().toString()
    this.eventService.updateMonthEvents(monthyear);
  }

  fillEventsByDay(){
    console.log("hey");
    console.log(this.filteredMonthYearEvents);
    this.filteredMonthYearEvents.forEach(el => {
      let eventDate = moment(el.properties.start_time);
      console.log(el)
      console.log(eventDate.dayOfYear());
      console.log(this.eventsByDay);
      let dayOfYear = eventDate.dayOfYear();
      this.eventsByDay.dayOfYear.push(el);
      console.log(this.eventsByDay[eventDate.dayOfYear()]);
    });
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    let dayOfYear = date.dayOfYear();
    if (dayOfYear in this.eventsByDay){
      return [this.eventsByDay[dayOfYear]];
    }
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    this.selectedDay = day;
    console.log(this.selectedDay);
  }
}
