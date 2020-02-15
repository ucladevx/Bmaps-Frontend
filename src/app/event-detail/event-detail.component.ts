import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.scss']
})

export class EventDetailComponent implements OnInit {
  public event: GeoJson;
  fileUrl;

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private _eventService: EventService, private _dateService: DateService) {}

  ngOnInit() {
      this.route.params.subscribe(() => {
          const id: string = this.route.snapshot.paramMap.get('id');
          this.event = this._eventService.getEventById(id);
      });
  }

  //behavior for back arrow
  back() {
    this._eventService.updateExpandedEvent(null);
    this._eventService.updateClickedEvent(null);
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

      createICS(event: GeoJson){
        const data = `BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:BMaps Events
NAME:BMaps Events
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
TZURL:http://tzurl.org/zoneinfo-outlook/America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:20200207T225053Z
DTSTART;TZID=America/Los_Angeles:` + this._dateService.formatEventCalendarStart(event) +
`\nDTEND;TZID=America/Los_Angeles:` + this._dateService.formatEventCalendarEnd(event) +
`\nSUMMARY:` + event.properties.name +
`\nDESCRIPTION:` + event.properties.description +
`\nLOCATION:` + event.properties.place.location.street + //loc??
`\nEND:VEVENT
END:VCALENDAR`
        const blob = new Blob([data], { type: 'application/octet-stream' });
        this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }

}
}
