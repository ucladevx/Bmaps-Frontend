import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';

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

  private dateToString(date: Date): string {
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear();

    return month.toString() + '/' + day.toString() + '/' + year.toString();
  }
}
