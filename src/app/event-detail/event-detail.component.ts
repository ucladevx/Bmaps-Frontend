import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DateService } from '../shared/date.service';
import { Event } from '../event';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
  providers: [ DateService ],
})
export class EventDetailComponent implements OnInit {
	@Input() event: Event;
	@Output() showSideBar = new EventEmitter<boolean>();

	constructor(private _dateService: DateService) {

	}

	ngOnInit() {
	}

	formatInfo() {
		var date = "";
		var location = "";
		if (this.event != undefined)
			date = this._dateService.formatDateItem(this.event) ;
		if (this.event['properties']['venue']['name'] != undefined) 
			location = this.event['properties']['venue']['name']
		return date + ' &middot; ' + location;
	}

	hideEvent(event) {
		console.log(this.event);
		this.showSideBar.emit(true);
	}
}
