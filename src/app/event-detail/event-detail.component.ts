import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../event';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
	@Input() event: Event;
	@Output() showSideBar = new EventEmitter<boolean>();

	constructor() {

	}

	ngOnInit() {
	}

	toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }

	hideEvent(event) {
		console.log(this.event);
		this.showSideBar.emit(true);
	}
}
