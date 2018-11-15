import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';

@Component({
    selector: 'app-date-selector',
    templateUrl: './date-selector.component.html',
    styleUrls: ['./date-selector.component.css']
})
export class DateSelectorComponent implements OnInit {
    public dateString: string;
    public showLeft: boolean;
    public showRight: boolean;

    constructor(private eventService: EventService, private dateService: DateService) { }

    ngOnInit() {
        this.eventService.currDate$.subscribe(date => {
            this.dateString = this.dateToString(date);
            this.showLeft = this.showLeftArrow(date);
            this.showRight = this.showRightArrow(date);
        });
    }

    private showLeftArrow(date: Date): boolean {
        let today = new Date();
        return !this.dateService.equalDates(date, today);
    }

    private showRightArrow(date: Date): boolean {
        return true;
    }

    private dateToString(date: Date): string {
        let day = date.getDate();
        let month = this.dateService.getMonthName(date);
        
        let description = '';
        let today = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (this.dateService.equalDates(date, today)) {
            description = 'Today, ';
        }
        else if (this.dateService.equalDates(date, tomorrow)) {
            description = 'Tomorrow, ';
        }

        return `${description} ${month} ${day}`
    }

    public updateDate(days: number) {
        // 1 means advance one day, -1 means go back one day
        this.eventService.updateDateByDays(days);
    }
}
