import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../map.service';
import { GeoJson, FeatureCollection } from '../map';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit {
    // default settings
    map: mapboxgl.Map;
    message = 'Hello World!';
    lat = 34.066915;
    lng = -118.445320

    // data
    source: any;
    mapEvents: FeatureCollection;
    keyUrl: string;

    constructor(private _mapService: MapService) {
      mapboxgl.accessToken = environment.mapbox.accessToken;
    }

    ngOnInit() {
      this.getEvents();
      this.initializeMap()
    }

    buildMap() {
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/trinakat/cjasrg0ui87hc2rmsomilefe3', // UCLA Campus Buildings (restricted by the border)
        // 'mapbox://styles/trinakat/cjashcgwq7rfo2srstatrxhyi', // UCLA Buildings
        // 'mapbox://styles/helarabawy/cj9tlpsgj339a2sojau0uv1f4',
        center: [this.lng, this.lat],
        maxBounds: [[-118.46, 34.056],[-118.428, 34.079]],
        zoom: 15,
        pitch: 60
      });
    }

    getEvents() {
      this._mapService.getAllEvents().subscribe(
        (data) => {
          this.mapEvents = data;
          console.log(data);
         },
        err => console.error(err),
        () => console.log('done loading events')
      );
    }

    private initializeMap() {
      /// locate the user
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.map.flyTo({
            center: [this.lng, this.lat]
          })
        });
      }

      this.buildMap();
      let today = new Date();
      this.addData(today.getDate(), today.getMonth(), today.getFullYear());
      this.addControls();
    }

    addData(d: number, m: number, y: number): void {
      this.keyUrl = this._mapService.getEventsOnDateURL(d, m, y);
      let currLocation: FeatureCollection =
      { "type": "FeatureCollection",
  				"features": [
  					{"type": "Feature",
  						"geometry": {
  								"type": "Point",
  								"coordinates": [this.lng, this.lat]
  						}
  					}
  				]
      };
      this.map.on('load', () => {
        this.map.addSource('events', { type: 'geojson', data: this.keyUrl });
        this.map.addSource('currloc', { type: 'geojson', data: currLocation });

        this.map.loadImage('https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
          (error, image) => {
            if (error) throw error;
            this.map.addImage('pin', image);
            this.map.addLayer({
              "id": "eventlayer",
              "type": "symbol",
              "source":"events",
              "layout": {
                "icon-image": "pin",
                "icon-size":.06,
                "icon-allow-overlap": true
              }
            });

          this.map.addLayer({
            "id": "currloc",
            "type": "symbol",
            "source":"currloc",
            "layout": {
              // "visibility": "none",
              "icon-image": "pin",
              "icon-size":.08,
              "icon-allow-overlap": true
            }
          });
        });
      });
    }

    //TODO: this doesn't seem to be working
    addControls(): void {
      // this.map.addControl(new mapboxgl.GeolocateControl({
      // 	positionOptions: {
      //   		enableHighAccuracy: true
      //   	},
      //   	fitBoundsOptions: {maxZoom: 17.7, speed: .3},
      //   	trackUserLocation: true
      // }));
      // this.map.addControl(new mapboxgl.NavigationControl());
      // this.map.addControl(new mapboxgl.FullscreenControl());
    }
}
