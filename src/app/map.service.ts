import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { GeoJson, FeatureCollection } from './map';
import * as mapboxgl from 'mapbox-gl';

@Injectable()
export class MapService {
  private baseEventsUrl = "http://www.whatsmappening.io/api/v1";

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>(`${this.baseEventsUrl}/events`);
  }

  //TODO: could just define an enum here
  getMonthNameFromMonthNumber(monthNumber: number): string {
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[monthNumber];
  }

  getEventsOnDateURL(d: number, m: number, y: number): string {
    const monthName = this.getMonthNameFromMonthNumber(m);
    let dateURL = `${this.baseEventsUrl}/event-date/${d}%20${monthName}%20${y}`;
    return dateURL; // json we are pulling from for event info
  }
}
