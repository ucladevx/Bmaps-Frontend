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
      private _eventService: EventService,
      private _dateService: DateService
  ) {}

  ngOnInit() {
      this.route.params.subscribe(() => {
          const id: string = this.route.snapshot.paramMap.get('id');
          this.event = this._eventService.getEventById(id);
      });
  }

  //behavior for back arrow
  back() {
    //update expanded event
    this._eventService.updateExpandedEvent(null);
    this._eventService.boldPopup(null);
    //weekview
    this._eventService.updateClickedEvent(null);
  }

  //check whether an image source exists
  checkImage(imageSrc) {
      var img = new Image();
      try {
        img.src = imageSrc;
        return true;
      } catch(err) {
        return false;
      }
    }

}
