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
    }

    addData(d: number, m: number, y: number): void {
      this.keyUrl = this._mapService.getEventsOnDateURL(d, m, y);
      const myS = "hi";
      this.map.on('load', () => {
        console.log(myS);
        this.map.addSource('events', { type: 'geojson', data: this.keyUrl });
        // map.addSource('currloc', { type: 'geojson', data: currData });

        this.map.loadImage('https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png', function(error, image) {
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

          // map.addLayer({
          //   "id": "currloc",
          //   "type": "symbol",
          //   "source":"currloc",
          //   "layout": {
          //     "visibility": "none",
          //     "icon-image": "pin",
          //     "icon-size":.08,
          //     "icon-allow-overlap": true
          //   }
          // });
        });
      });
    }


    //   /// Add map controls
    //   this.map.addControl(new mapboxgl.NavigationControl());
    //
    //
    //   //// Add Marker on Click
    //   this.map.on('click', (event) => {
    //     const coordinates = [event.lngLat.lng, event.lngLat.lat]
    //     const newMarker   = new GeoJson(coordinates, { message: this.message })
    //     this.mapService.createMarker(newMarker)
    //   })
    //
    //
    //   /// Add realtime firebase data on map load
    //   this.map.on('load', (event) => {
    //
    //     /// register source
    //     this.map.addSource('firebase', {
    //        type: 'geojson',
    //        data: {
    //          type: 'FeatureCollection',
    //          features: []
    //        }
    //     });
    //
    //     /// get source
    //     this.source = this.map.getSource('firebase')
    //
    //     /// subscribe to realtime database and set data source
    //     this.markers.subscribe(markers => {
    //         let data = new FeatureCollection(markers)
    //         this.source.setData(data)
    //     })
    //
    //     /// create map layers with realtime data
    //     this.map.addLayer({
    //       id: 'firebase',
    //       source: 'firebase',
    //       type: 'symbol',
    //       layout: {
    //         'text-field': '{message}',
    //         'text-size': 24,
    //         'text-transform': 'uppercase',
    //         'icon-image': 'rocket-15',
    //         'text-offset': [0, 1.5]
    //       },
    //       paint: {
    //         'text-color': '#f16624',
    //         'text-halo-color': '#fff',
    //         'text-halo-width': 2
    //       }
    //     })
    //
    //   })
    //
    // }
    //
    //
    // /// Helpers
    //
    // removeMarker(marker) {
    //   this.mapService.removeMarker(marker.$key)
    // }
    //
    // flyTo(data: GeoJson) {
    //   this.map.flyTo({
    //     center: data.geometry.coordinates
    //   })
    // }
}
