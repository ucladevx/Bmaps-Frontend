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
  private clickedEvent: GeoJson;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.showCalendar(new Date());
    this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
        this.filteredEvents = eventCollection.features;
        console.log(this.filteredEvents);
    });
    this.eventService.filteredAllEvents$.subscribe(allEventCollection => {
      console.log("hwate");
      console.log(allEventCollection.features);
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
        // if (this.clickedEvent != null){
        //   this.hideSidebar(this.clickedEvent);
        //   console.log("hm");
        // }
        // else {
        //   this.showSidebar();
        // }
        // this.scrollToEvent(clickedEventInfo);
    });
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

  getEventsOnDate(date: Moment): GeoJson[] {
    console.log()
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
    console.log(this.selectedDay);
  }
}
