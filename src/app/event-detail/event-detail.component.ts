import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../event';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
	@Input() event: Event;
	@Output() showSideBar = new EventEmitter<boolean>();

	constructor() {

	}

	ngOnInit() {
	}
	
	hideEvent(event) {
		this.showSideBar.emit(true);
		// this.event = null;
	}
}