import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { GeoJson, FeatureCollection } from './map';
import * as mapboxgl from 'mapbox-gl';

private class SelectedDate {
    day: number;
    month: number;
    year: number;
}

@Injectable()
export class MapService {
  private baseEventsUrl = "http://www.whatsmappening.io/api/v1";
  private date: SelectedDate;

  constructor(private http: HttpClient) {
      let today = new Date();
      this.date = { day: today.getDate(), month: today.getMonth(), year: today.getFullYear()};
      this.getAllEvents();
  }

  getAllEvents(): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>(this.getEventsOnDateURL(this.date.day, this.date.month, this.date.year));
  }

  //could just define an enum here
  getMonthNameFromMonthNumber(monthNumber: number): string {
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[monthNumber];
  }

  getEventsOnDateURL(d: number, m: number, y: number): string {
    const monthName = this.getMonthNameFromMonthNumber(m);
    let dateURL = `${this.baseEventsUrl}/event-date/${d}%20${monthName}%20${y}`;
    console.log("THE URL IS " + dateURL);
    return dateURL; // json we are pulling from for event info
  }
}
