import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventService } from '../event.service';
import { GeoJson } from '../map';

// interface CalendarDay {
//   dayOfMonth: number;
//   inCurrentMonth: boolean;
//   events: GeoJson[];
// }

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  public days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private today: CalendarDay;
  public currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private filteredMonthYearEvents: GeoJson[];
  private clickedEvent: GeoJson;
  // private eventsByDay: GeoJson[];
  private eventsByDay = new Map<number, GeoJson[]>();
  private viewDate: Date;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.currentMonth = moment();

    this.eventService.monthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      // console.log(this.filteredMonthYearEvents);
      this.selectedMonth = moment().month();
      // console.log(this.selectedMonth + " ngoninit")
      this.selectedYear = moment().year();
      
      this.fillEventsByDay();
      this.showCalendar(this.viewDate);
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    // this.eventsByDay =
    this.showCalendar(new Date());

    this.viewDate = new Date();

    // let todayDate = moment();
    // this.today = {
    //   dayOfMonth: todayDate.date(),
    //   inCurrentMonth: todayDate.isSame(todayDate, 'month'),
    //   events: this.getEventsOnDate(todayDate),
    // };
    // console.log(this.days);
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    this.currentMonth = moment(dateInMonth).startOf('month');

    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');

    // this.days = [];
    // for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
    //   // console.log(this.getEventsOnDate(d));
    //   // console.log('no');
    //   let calendarDay: CalendarDay = {
    //     dayOfMonth: d.date(),
    //     inCurrentMonth: d.isSame(dateInMonth, 'month'),
    //     events: this.getEventsOnDate(d),
    //   };

    //   if (d == moment()){
    //     this.today = calendarDay;
    //   }

    //   this.days.push(calendarDay);

    //   // set selected day to the date provided
    //   if (d.isSame(dateInMonth, 'day')) {
    //     this.selectedDay = calendarDay;
    //   }
    // }
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

        console.log(this.days);
  }

  changeMonth(delta: number): void {
    
    // for each (var day in this.days){

    // }
    // this.days.map(day => );
    // this.days.forEach(function(day){
    //   let retDay = day;
    //   retDay.events = [];
    //   return retDay;
    // })
    // this.days = [];

    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // console.log("nm" +newMonth.month())
    // console.log(newMonth);
    if (newMonth.isSame(moment(), 'month')) {
      // if current month, make selected day today
      // this.today = new Date();
      this.viewDate = new Date();
      this.showCalendar( new Date());

      // moment(new Date());

      // let todayDate = moment();
      // this.today = {
      //   dayOfMonth: todayDate,
      //   inCurrentMonth: todayDate.isSame(dateInMonth, 'month'),
      //   events: this.getEventsOnDate(d),
      // };

      // let today: CalendarDay = {
      //   dayOfMonth: new Date(),
      //   inCurrentMonth: true,
      //   events: this.getEventsOnDate(d),
      // };


      // let todayDate = moment();
      // this.today = {
      //   dayOfMonth: todayDate.date(),
      //   inCurrentMonth: true,
      //   events: this.getEventsOnDate(todayDate),
      // };
      
    }
    else {
      // make selected day the 1st of the month
      this.viewDate = newMonth.startOf('month').toDate();
      this.showCalendar(newMonth.startOf('month'));

      // let todayDate = moment();
      // this.today = {
      //   dayOfMonth: todayDate.date(),
      //   inCurrentMonth: false,
      //   events: this.getEventsOnDate(todayDate),
      // };
    }

    this.selectedMonth = newMonth.month();
    this.selectedYear = newMonth.year()
    let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    // console.log("monthyear" + monthyear);
    this.eventService.updateMonthEvents(monthyear);
    // this.days = [];

  }

  fillEventsByDay(){
    // console.log('hey');
    // console.log(this.filteredMonthYearEvents);
    // console.log('yoooo');
    // console.log(this.eventsByDay);
    this.filteredMonthYearEvents.forEach(el => {
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      let dayOfMonth = eventDate.date();
      // console.log(el);
      let arr : GeoJson[] = [];
      arr.push(...this.eventsByDay.get(dayOfYear));
      arr.push(el);
      this.eventsByDay.set(dayOfYear,arr);
      // console.log(dayOfYear);
      // console.log(this.days);
      var day = this.days.find(obj => obj.dayOfMonth == dayOfMonth);
      if(day != null){ day.events = arr; }
    });
    // console.log("events by day" );
    // console.log(this.eventsByDay);
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    // console.log('get events on date');
    let dayOfYear = date.dayOfYear();
    if (this.eventsByDay.get(dayOfYear)){
      // console.log("this.days");

      // console.log(this.days);
      return this.eventsByDay.get(dayOfYear);

    }
    else {
      // console.log("faillllllll");
      // console.log(dayOfYear);
      // console.log(this.days);
      // console.log(this.eventsByDay);
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    this.selectedDay = day;
    // console.log(this.currentMonth.month() + "selectedMonth")
    let date = moment().date(day.dayOfMonth).month(this.currentMonth.month().valueOf()).year(this.currentMonth.year().valueOf()).toDate();
    // console.log("selected day" + date);

    // console.log(date.toDate());
    // this.eventService.updateDateByDays(days);
    this.eventService.updateEvents(date);
  }
}
