import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

import { GeoJson } from '../map';

interface CalendarDay {
  date: number;
  events: GeoJson[];
  inCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  private days: CalendarDay[] = [];

  constructor() { }

  ngOnInit() {
    this.showCalendar(new Date());
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    let firstDay = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay = moment(dateInMonth).endOf('month').endOf('week');

    for (let day: Moment = firstDay.clone(); day.isBefore(lastDay); day.add(1, 'days')) {
      this.days.push({
        date: day.date(),
        events: this.getEventsOnDate(day),
        inCurrentMonth: day.isSame(dateInMonth, 'month'),
      });
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

}
