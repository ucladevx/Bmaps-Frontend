import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ContentChild } from '@angular/core';
import { MonthComponent } from '../month/month.component';
import { WeekComponent } from '../week/week.component';
import { CalendarService } from '../calendar.service';
import { EventService } from '../event.service';

@Component({
  selector: 'app-calendar-container',
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.css'],
  providers: [WeekComponent, MonthComponent]
})


export class CalendarContainerComponent implements OnInit {
  public viewDate: Date = new Date();
  currentPath = '';

  @ContentChild(MonthComponent)
  private monthComponent: MonthComponent;

  @ContentChild(WeekComponent)
  private weekComponent: WeekComponent;

  /// Calendar container will have to have some state, that is, the current time
  //  expected behavior:
  //  if you switch from month view to week view,
  //    if it is the current month, go to the week view for the current week
  //    if it is a different month, go to the week view for the first week in the month
  //  if you switch from week view to month view,
  //    go to the month containing the week that was being viewed.

  constructor(public router: Router, private eventService: EventService, route: ActivatedRoute, private _calendarService: CalendarService) {
    // Retrieve current path.
    this.currentPath = route.snapshot.url.join('');
  }

  ngOnInit() {
    this._calendarService.viewDateChange.subscribe( function(set) { this.viewDateChange(set); }.bind(this));
  }

  viewDateChange(set : Date) {
    console.log("SETTTTTTTT");
    console.log(set);
    this.viewDate = set;
  }

  changeDateSpan(delta: number) : void{
    console.log("this.currentPath");
    console.log(this.currentPath);
    console.log("this.router.url");
    console.log(this.router.url);
    this._calendarService.changeDateSpan(delta);
    return;
  }

}
