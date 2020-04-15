import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ViewState } from '../view-enum';

@Component({
    selector: 'app-date-selector',
    templateUrl: './date-selector.component.html',
    styleUrls: ['./date-selector.component.scss']
})

export class DateSelectorComponent implements OnInit {
    public dateString: string;
    public showLeft: boolean;
    public showRight: boolean;

    constructor(private router: Router, private _eventService: EventService, private _dateService: DateService) { }

    ngOnInit() {
      this._eventService.selectedDate$.subscribe(date => {
        this.dateString = this.dateToString(date);
        this.showLeft = this.showLeftArrow(date);
        this.showRight = this.showRightArrow(date);
      });
    }

    private showLeftArrow(date: Date): boolean {
      return !this._dateService.equalDates(date, new Date());
    }

    private showRightArrow(date: Date): boolean {
      return true;
    }

    private dateToString(date: Date): string {
      let day = moment(date).format('D');
      let month = moment(date).format('MMM');
      let description = '';
      let today = new Date();
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (this._dateService.equalDates(date, today))
          description = 'Today, ';
      else if (this._dateService.equalDates(date, tomorrow))
          description = 'Tomorrow, ';
      return `${description} ${month} ${day}`
    }

    public incrementDay(delta: number) {
      // 1 means advance one day, -1 means go back one day
      let newDate = new Date();
      let prevDate = this._eventService.getSelectedDate();
      newDate = moment(prevDate).add(delta, 'd').toDate();
      this._eventService.setSelectedDate(newDate);
      console.log(this._eventService.getCurrentView());
      this._eventService.changeDateSpan(newDate, this._eventService.getCurrentView());
      if(this._eventService.isMapView())
        document.getElementById("resetButton").click();
    }

}
