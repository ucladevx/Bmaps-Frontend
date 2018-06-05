import { Injectable } from '@angular/core';
import { GeoJson } from '../map';
import { UCLA_CAMPUS_BOUNDARY } from '../map'

// Constants used as filter rules
const NEARBY_DIST = 0.35; // sets how far away nearby is (in miles)

@Injectable()
export class LocationService {

  userLat = undefined;
  userLng = undefined;

  constructor() { }

  // Returns true if given point is 'nearby' to user
  isNearby(lat, lng): boolean {
    if (this.userLat == undefined || this.userLng == undefined) {
      return true;
    }
    return this.getDistanceFromLatLonInMi(lat, lng, this.userLat, this.userLng) <= NEARBY_DIST;
  }

  // Returns true if given point is 'on campus'
  isOnCampus(lat, lng): boolean {
    let boundary = UCLA_CAMPUS_BOUNDARY['coordinates'][0];

    let isInside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        let lati = boundary[i][1], lngi = boundary[i][0];
        let latj = boundary[j][1], lngj = boundary[j][0];

        let intersect = ((lngi > lng) != (lngj > lng)) && (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
        if (intersect) {
          isInside = !isInside;
        }
    }
    return isInside;
  }

  getDistanceFromLatLonInMi(lat1,lon1,lat2,lon2): number {
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(lat2-lat1);
    let dLon = this.deg2rad(lon2-lon1);
    let a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d * 0.62137119;
  }

  deg2rad(deg): number {
    return deg * (Math.PI/180)
  }
}
