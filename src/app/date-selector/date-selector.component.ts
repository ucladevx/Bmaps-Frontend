import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';
import { CalendarService } from '../calendar.service';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-date-selector',
    templateUrl: './date-selector.component.html',
    styleUrls: ['./date-selector.component.css']
})

export class DateSelectorComponent implements OnInit {
    public dateString: string;
    public showLeft: boolean;
    public showRight: boolean;

    constructor(private router: Router, private _eventService: EventService, private _dateService: DateService, private _calendarService: CalendarService) { }

    ngOnInit() {
        this._eventService.currDate$.subscribe(date => {
            this.dateString = this.dateToString(date);
            this.showLeft = this.showLeftArrow(date);
            this.showRight = this.showRightArrow(date);
            this._calendarService.setSelectedDay(date);
        });

    }

    private showLeftArrow(date: Date): boolean {
        let today = new Date();
        return !this._dateService.equalDates(date, today);
    }

    private showRightArrow(date: Date): boolean {
        return true;
    }

    private dateToString(date: Date): string {
        let day = date.getDate();
        let month = this._dateService.getMonthName(date);
        let description = '';
        let today = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (this._dateService.equalDates(date, today)) {
            description = 'Today, ';
        }
        else if (this._dateService.equalDates(date, tomorrow)) {
            description = 'Tomorrow, ';
        }
        return `${description} ${month} ${day}`
    }

    public updateDate(days: number) {
        // 1 means advance one day, -1 means go back one day
        this._calendarService.increaseDay(days);
        this._eventService.updateDateByDays(days);
        if(this.router.url.startsWith('/map')){
          document.getElementById("resetButton").click();
        }
    }

}
