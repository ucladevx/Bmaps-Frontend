import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import { UCLA_CAMPUS_BOUNDARY } from '../map'

@Injectable()
export class LocationService {

  constructor() { }

  // Returns true if given point is 'nearby'
  // Passed in point should be [lat,lng]
  isNearby(point): boolean {
    return true;
  }

  // Returns true if given point is 'on campus'
  // Passed in point should be [lat, lng]
  isOnCampus(point): boolean {
    let lat = point[0];
    let lng = point[1];
    let boundary = UCLA_CAMPUS_BOUNDARY['coordinates'][0];

    let isInside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        let lati = boundary[i][0], lngi = boundary[i][1];
        let latj = boundary[j][0], lngj = boundary[j][1];

        let intersect = ((lngi > lng) != (lngj > lng)) && (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
        if (intersect) {
          isInside = !isInside;
        }
    }
    return isInside;
  }
}
