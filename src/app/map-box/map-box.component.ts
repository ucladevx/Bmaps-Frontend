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
    lat = 34.066915; //default center of map, variables used for user location/naviagation center
    lng = -118.445320

    // data
    source: any;
    keyUrl: string;

    // style
    pinUrl = "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png";

    constructor(private _mapService: MapService) {
      mapboxgl.accessToken = environment.mapbox.accessToken;
    }

    ngOnInit() {
      this.buildMap();
      //I think you should use something like this to create all the promises once instead of calling promiseMapLoad() several times
      let _promiseMapLoad = this.promiseMapLoad()
      let _promiseGetUserLocation = this.promiseGetUserLocation()
      let _promisePinLoad = this.promiseImageLoad(this.pinUrl)

      _promiseMapLoad.then(() => {
        this.threeDDisplay();
      });

      let promise_map_pin = Promise.all([_promiseMapLoad, _promisePinLoad]);
      promise_map_pin.then((promiseReturns) => {
        let image = promiseReturns[1]; //Promise.all returns an array of the inner promise returns based on order in promise.all
        let today = new Date();
        this.keyUrl = this._mapService.getEventsOnDateURL(today.getDate(), today.getMonth(), today.getFullYear());

        //can change the url to a static geojson object from the service
        this.map.addSource('events', { type: 'geojson', data: this.keyUrl });

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

      let promise_map_userloc_pin = Promise.all([_promiseMapLoad, _promiseGetUserLocation, _promisePinLoad]);
      promise_map_userloc_pin.then( () => {
        this.addPinToLocation("currloc", this.lat, this.lng, "pin");
      });

      this.addControls();
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
        "source":id,
        "layout": {
          // "visibility": "none",
          "icon-image": icon,
          "icon-size":.08,
          "icon-allow-overlap": true
        }
      }
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

    ///////////////////////////////////////
    // MAP CALLBACKS AS PROMISES
    //////////////////////////////////////
    promiseMapLoad() {
      return new Promise((resolve, reject) => {
        this.map.on('load', () => {
          resolve();
        })
      });
    }

    promiseImageLoad(url) {
      return new Promise((resolve, reject) => {
        this.map.loadImage(url, (error, image) => {
          if(error) {
            reject(error);
          } else {
            resolve(image);
          }
        });
      });
    }

    //puts User location in this.lat and this.lng
    promiseGetUserLocation() {
      return new Promise((resolve, reject) => {
        //if location activated
        if (navigator.geolocation) {
          //locate user
          navigator.geolocation.getCurrentPosition(position => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            resolve();
          }
        }
        else {
          reject();
        }
      }
    }
}
