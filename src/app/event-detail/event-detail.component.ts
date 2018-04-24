import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../event.service';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
    @Input() event: any;
    @Output() showSideBar = new EventEmitter<boolean>();

    constructor(private eventService: EventService) {
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
    console.log("clicked hideEvent from eventDetail");
    console.log($event);
    console.log(this.event);
    this.showSideBar.emit(true);
}
}
