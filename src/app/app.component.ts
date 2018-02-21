import { Component } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { MapService } from './map.service';
import { GeoJson } from './map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public events;

  constructor(private _mapService: MapService){}

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this._mapService.getEvents().subscribe(
      (data) => {
        this.events = data.features;
        console.log(data.features);
       },
      err => console.error(err),
      () => console.log('done loading events')
    );
  }
}
