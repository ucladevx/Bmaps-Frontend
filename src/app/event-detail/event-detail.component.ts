import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  @Input() event: any;
  @Output() showSideBarBool = new EventEmitter<boolean>();

  constructor(private eventService: EventService, private dateService: DateService) {
  }

  ngOnInit() {
  }

  hideEvent($event) {
      this.showSideBarBool.emit(true);
      this.eventService.boldEvent(null);
  }
}
