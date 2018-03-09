import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { SelectedDate } from '../selectedDate';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.css']
})
export class DateSelectorComponent implements OnInit {
  private dateString: string;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    console.log('inititin');
    this.eventService.currDate$.subscribe(date => {
      console.log('herefea');
      this.dateString = this.dateToString(date);
    });
  }

  private dateToString(date: SelectedDate): string {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth()+1;
    let year = today.getFullYear();

    return month.toString() + '/' + day.toString() + '/' + year.toString();
  }
}
