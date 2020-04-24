import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})

export class EventDetailComponent implements OnInit {

  // currently expanded event
  public event: GeoJson;
  // downloadable ICS file
  private fileUrl;

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private _eventService: EventService, private _dateService: DateService) {}

  ngOnInit() {
    // whenever sidebar route changes, update event by id
    this.route.params.subscribe(() => {
      const id: string = this.route.snapshot.paramMap.get('id');
      this.event = this._eventService.getEventById(id);
    });
  }

  // behavior for back arrow
  back() { this._eventService.resetEventSelection(); }

  // check whether an image source exists
  checkImage(imageSrc) {
    let img = new Image();
    try {
      img.src = imageSrc;
      return true;
    } catch(err) {
      return false;
    }
  }

  // cretae downloadable ICS for personal calendar
  createICS(event: GeoJson){
    const data = this._dateService.formatICS(event);
    const blob = new Blob([data], { type: 'application/octet-stream' });
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

}
