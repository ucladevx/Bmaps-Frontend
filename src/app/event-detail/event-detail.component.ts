import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
	@Input() event: any;
	@Output() showSideBar = new EventEmitter<boolean>();

	constructor() {
        console.log("construct me");
	}

	ngOnInit() {
        console.log(this.event);
	}

  //used for date parsing
	toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }

	hideEvent($event) {
        console.log("whtf");
        console.log($event);
        console.log(this.event);
		this.showSideBar.emit(true);
	}
}
