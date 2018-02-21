import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Rx';

import { GeoJson, FeatureCollection } from './map';
import * as mapboxgl from 'mapbox-gl';

@Injectable()
export class MapService {
  private baseEventsUrl = "http://www.whatsmappening.io/api/v1";

  constructor(private http: HttpClient) {
    mapboxgl.accessToken = environment.mapbox.accessToken
  }

  getEvents(): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>(`${this.baseEventsUrl}/events`);
  }
}
