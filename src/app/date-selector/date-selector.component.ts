import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.scss']
})

export class DateSelectorComponent implements OnInit {

  // current date
  public dateString: string;
  // should arrow controls be visible
  public showLeft: boolean;
  public showRight: boolean;

  constructor(private router: Router, private _eventService: EventService, private _dateService: DateService) { }

  ngOnInit() {
    // whenever current date changes, update variables in date selector
    this._eventService.selectedDate$.subscribe(date => {
      this.dateString = this.dateToString(date);
      this.showLeft = this.showLeftArrow(date);
      this.showRight = this.showRightArrow(date);
    });
  }

  // don't allow user to go back prior to today
  private showLeftArrow(date: Date): boolean {
    return !this._dateService.equalDates(date, new Date());
  }

  // always allow user to go forward
  private showRightArrow(date: Date): boolean {
    return true;
  }

  // convert date to string of form MMM D
  private dateToString(date: Date): string {
    let day = moment(date).format('D');
    let month = moment(date).format('MMM');
    let description = '';
    let today = new Date();
    let tomorrow = moment(today).add(1,'days').toDate();
    if (this._dateService.equalDates(date, today))
      description = 'Today, ';
    else if (this._dateService.equalDates(date, tomorrow))
      description = 'Tomorrow, ';
    else
      description = moment(date).format('ddd') + ', ';
    return `${description} ${month} ${day}`
  }

  // propogate day change
  public incrementDay(delta: number) {
    // 1 means advance one day, -1 means go back one day
    let prevDate = this._eventService.getSelectedDate();
    let newDate = moment(prevDate).add(delta, 'd').toDate();
    this._eventService.changeDateSpan(newDate, this._eventService.getCurrentView());
    // reset map view if applicable
    if(this._eventService.isMapView()) document.getElementById("resetButton").click();
  }

}
