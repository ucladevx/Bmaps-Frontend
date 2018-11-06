import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  private event: GeoJson;

  constructor(
      private route: ActivatedRoute,
      private eventService: EventService,
      private dateService: DateService
  ) {}

  ngOnInit() {
      this.route.params.subscribe(() => {
          const id: string = this.route.snapshot.paramMap.get('id');
          this.event = this.eventService.getEventById(id);
      });
  }

}
