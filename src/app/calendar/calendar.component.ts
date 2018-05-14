import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

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

  constructor() { }

  ngOnInit() {
    this.showCalendar(new Date());
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    this.currentMonth = moment(dateInMonth).startOf('month');

    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');

    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
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

    if (newMonth.isSame(moment(), 'month')) {
      // if current month, make selected day today
      this.showCalendar(new Date());
    }
    else {
      // make selected day the 1st of the month
      this.showCalendar(newMonth.startOf('month'));
    }
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    // test data
    if (date.date() % 3 != 0) {
      return [];
    }
    else {
      return [
        {
          "geometry": {
            "coordinates": [-118.44681959102,
            34.070367696979
            ],
            "type": "Point"
          },
          "id": "175752283196850",
          "properties": {
            "end_time": "2018-04-01T15:00:00-0700",
            "hoster": "LA Hacks",
            "name": "LA Hacks 2018",
            "start_time": "2018-03-30T16:00:00-0700",
          },
          "type": "Feature"
        },
      ];
    }
  }

  onSelect(day: CalendarDay): void {
    this.selectedDay = day;
  }
}
