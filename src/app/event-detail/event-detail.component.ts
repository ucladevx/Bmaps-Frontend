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
  public event: GeoJson;

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

  //behavior for back arrow
  back() {
    //update expanded event
    this.eventService.updateExpandedEvent(null);
    //unbold the popup event title
    this.eventService.boldPopup(null);
    //weekview
    this.eventService.updateClickedEvent(null);
  }

  //check whether an image source exists
  checkImage(imageSrc) {
      var img = new Image();
      var valid = true;
      try {
        img.src = imageSrc;
      } catch(err) {
        valid = false;
      }
      return valid;
    }

}
