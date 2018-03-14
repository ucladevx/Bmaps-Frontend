import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../event';
import { EventService } from '../event.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
	@Input() event: Event;
	@Output() showSideBar = new EventEmitter<boolean>();

	constructor(private eventService: EventService) {

	}

	ngOnInit() {
	}

	toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }

	hideEvent(event) {
		console.log(this.event);
		this.showSideBar.emit(true);
        this.eventService.selectedEvent(0);
	}
}
