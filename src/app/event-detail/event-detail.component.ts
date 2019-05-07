import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FeatureCollection, GeoJson } from '../map';
import { DisplayService } from '../services/display.service';
import { DateService } from '../services/date.service';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})

export class EventDetailComponent implements OnInit {
  public event: GeoJson;

  constructor(
      private route: ActivatedRoute,
      private _displayService: DisplayService,
      private _dateService: DateService
  ) {}

  ngOnInit() {
      this.route.params.subscribe(() => {
          const id: string = this.route.snapshot.paramMap.get('id');
          this.event = this._displayService.getEventById(id);
      });
  }

  //behavior for back arrow
  back() {
    //update expanded event
    this._displayService.updateExpandedEvent(null);
    //weekview
    this._displayService.updateClickedEvent(null);
  }

  //check whether an image source exists
  checkImage(imageSrc) {
      let img = new Image();
      try {
        img.src = imageSrc;
        return true;
      } catch(err) {
        return false;
      }
    }

}
