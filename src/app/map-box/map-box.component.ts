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
    lat = 34.066915; //default center of map, used for user location
    lng = -118.445320

    // data
    source: any;
    // mapEvents: FeatureCollection;
    keyUrl: string;

    constructor(private _mapService: MapService) {
      mapboxgl.accessToken = environment.mapbox.accessToken;
    }

    ngOnInit() {
      this.buildMap();
      this.addUserLocation();

      let today = new Date();
      this.addData(today.getDate(), today.getMonth(), today.getFullYear());
      this.addControls();
      this.map.on('load', () => {
        this.threeDDisplay();
      });
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

    //assumes pin image and map already loaded
    addPinToLocation(id: string, latitude: number, longitude: number, icon: string) {
      let currLocation: FeatureCollection =
      { "type": "FeatureCollection",
          "features": [
            {"type": "Feature",
              "geometry": {
                  "type": "Point",
                  "coordinates": [longitude, latitude]
              }
            }
          ]
      };

      this.map.addSource(id, { type: 'geojson', data: currLocation });

      this.map.addLayer({
        "id": id,
        "type": "symbol",
        "source":"currloc",
        "layout": {
          // "visibility": "none",
          "icon-image": icon,
          "icon-size":.08,
          "icon-allow-overlap": true
        }
      }
    }

    addUserLocation() {
      //if location activated
      if (navigator.geolocation) {
        //locate user
        navigator.geolocation.getCurrentPosition(position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          // this.map.flyTo({
          //   center: [this.lng, this.lat]
          // })

          //if map loaded add immediately, else wait until loaded
          if(this.map.loaded()) {
            this.addPinToLocation("currloc", this.lat, this.lng, "pin");
          }
          else {
            this.map.on('load', () => {
              this.addPinToLocation("currloc", this.lat, this.lng, "pin");
            });
          }
        });
      }
    }

    addData(d: number, m: number, y: number): void {
      this.keyUrl = this._mapService.getEventsOnDateURL(d, m, y);
      this.map.on('load', () => {
        this.map.addSource('events', { type: 'geojson', data: this.keyUrl });

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
        });
      });
    }

    addControls(): void {
      this.map.addControl(new mapboxgl.GeolocateControl({
      	positionOptions: {
        		enableHighAccuracy: true
        	},
        	fitBoundsOptions: {maxZoom: 17.7, speed: .3},
        	trackUserLocation: true
      }));
      this.map.addControl(new mapboxgl.NavigationControl());
    }

    threeDDisplay(): void {
    	// Insert the layer beneath any symbol layer.
      let layers = this.map.getStyle().layers.reverse();
    	let labelLayerIdx = layers.findIndex(function (layer) {
    		return layer.type !== 'symbol';
    	});

    	this.map.addLayer({
    		'id': 'ucla-buildings',
    		'source': 'composite',
    		'source-layer': 'UCLA_Campus_Buildings', // UCLA Campus Buildings
    		// 'source-layer': 'UCLA_Buildings', // UCLA Buildings
    		'filter': ['==', 'extrude', 'true'],
    		'type': 'fill-extrusion',
    		'minzoom': 15,
    		'paint': {
    			'fill-extrusion-color': '#aaa',
    			'fill-extrusion-height': {
    				'property': 'height',
    				'type': 'identity'
    			},
    			'fill-extrusion-base': {
    				'property': 'min_height',
    				'type': 'identity',
    			},
    			// 'fill-extrusion-height': 20,
    			// 'fill-extrusion-base': 0,
    			'fill-extrusion-opacity': 0.5
    		}
    	}, "eventstest");
    }
}
