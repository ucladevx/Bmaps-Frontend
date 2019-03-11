import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ContentChild } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar.component';
import { WeekComponent } from '../week/week.component';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-calendar-container',
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.css'],
  providers: [WeekComponent, CalendarComponent]
})


export class CalendarContainerComponent implements OnInit {
  public viewDate: Date = new Date();
  currentPath = '';

  @ContentChild(CalendarComponent)
  private monthComponent: CalendarComponent;

  @ContentChild(WeekComponent)
  private weekComponent: WeekComponent;

  
  /// Calendar container will have to have some state, that is, the current time 
  
  // expected behavior:
  // if you switch from month view to week view,
  //    if it is the current month, go to the week view for the current week
  //    if it is a different month, go to the week view for the first week in the month
  // if you switch from week view to month view,
  //    go to the month containing the week that was being viewed.


  constructor(private router: Router,
              route: ActivatedRoute,
              private _calendarService: CalendarService) {
    // Retrieve current path.
    this.currentPath = route.snapshot.url.join('');
  }

  ngOnInit() {
    this._calendarService.viewDateChange.subscribe( function(set) { this.viewDateChange(set); }.bind(this));

  }

  viewDateChange(set : Date) {
    this.viewDate = set;
  }


  changeDateSpan(delta: number) : void{
    // if current active route is month view, call changeMonth on month view

    // if current active route is week view, call changeWeek on week view

    // if month component is active
    // RouterLinkActive
    // if(router.isRouteActive(router.generate(['/SignIn'])
    console.log("this.currentPath");
    console.log(this.currentPath);

    console.log("this.router.url");
    console.log(this.router.url);


    if(this.router.url.startsWith("/calendar/month")){
      // this.monthComponent.changeMonth(delta);
      this._calendarService.changeDateSpan(delta);
    }
    else{
    // else
      // this.weekComponent.changeWeek(delta);
      this._calendarService.changeDateSpan(delta);
    }

    return;
    
    // // 1 means advance one month, -1 means go back one month
    // let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // // console.log("nm" +newMonth.month())
    // // console.log(newMonth);
    // if (newMonth.isSame(moment(), 'month')) {
    //   // if current month, make selected day today
    //   // this.today = new Date();
    //   this.viewDate = new Date();
    //   this.showCalendar( new Date());

    // }
    // else {
    //   // make selected day the 1st of the month
    //   this.viewDate = newMonth.startOf('month').toDate();
    //   this.showCalendar(newMonth.startOf('month'));

    // }

    // this.selectedMonth = newMonth.month();
    // this.selectedYear = newMonth.year()
    // let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    // this.eventService.updateMonthEvents(monthyear);

    
    // // 1 means advance one week, -1 means go back one week
    // let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    // //update selectedMonth and selectedYear
    // this.selectedMonth = newWeek.month();
    // this.selectedYear = newWeek.year();
    // // if current week, make selected day today
    // if (newWeek.isSame(moment(), 'week')) {
    //   //update view date
    //   this.viewDate = new Date();
    //   //update view
    //   this.updateWeekView();
    // }
    // // make selected day the 1st of the week
    // else {
    //   //update view date
    //   this.viewDate = newWeek.startOf('week').toDate();
    //   //update view
    //   this.updateWeekView();
    // }
  

  }


  // set month when calendar container compoonent switches to month
  // set week when calendar container compoonent switches to week

}
