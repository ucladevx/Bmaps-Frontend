import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
	@Input() event: GeoJson;
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
