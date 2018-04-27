import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { GeoJson, FeatureCollection } from '../map';
import { environment } from '../../environments/environment';
import { DateService } from '../shared/date.service';
import { EventService } from '../event.service';

@Component({
    selector: 'app-map-box',
    templateUrl: './map-box.component.html',
    styleUrls: ['./map-box.component.css'],
    providers: [ DateService ]
})
export class MapBoxComponent implements OnInit {
  @Input() pressed: boolean;
  // default settings
  map: mapboxgl.Map;
  message = 'Hello World!';
  lat = 34.066915; //default center of map, variables used for user location/naviagation center
  lng = -118.445320;

  // data
  source: any;
  keyUrl: string;

  // state
  selectedEvent: any = null;

  // Resources
  pinUrl = "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png";
  bluePinPath = "../../assets/blue-mappointer.png"

  // Reusable Blocks
  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 20 // offset upward from pin
  }).setHTML('<div id="popupEvent"></div> <div id="popupDate"></div>');

  backupPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 20 // offset upward from pin
  }).setHTML('<div id="backupPopupEvent"></div> <div id="backupPopupDate"></div>');

  private events: FeatureCollection;

  constructor(private _dateService: DateService, private eventService: EventService) {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
      this.events = eventCollection;
      this.updateSource();
    });

    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
      //TODO: Just put this.selectEvent here
      console.log("map sub", clickedEventInfo);
      this.selectEvent(clickedEventInfo);
      //need to call zoom function for map
    });
    console.log("before");
    this.eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
      console.log("hovering from map");
    })
    this.buildMap();
    //I think you should use something like this to create all the promises once instead of calling function creating promise several times
    let _promiseMapLoad = this.promiseMapLoad();
    let _promiseGetUserLocation = this.promiseGetUserLocation();
    let _promisePinLoad = this.promiseImageLoad(this.pinUrl);
    let _promiseBluePinLoad = this.promiseImageLoad(this.bluePinPath);

    //Add 3D buildings, on-hover popup, and arrowcontrols
    _promiseMapLoad.then(() => {
      this.threeDDisplay();
      this.hoverPopup();
      this.addArrowControls();
    });

    //Add all Events pins
    let promise_map_pin = Promise.all([_promiseMapLoad, _promisePinLoad]);
    promise_map_pin.then((promiseReturns) => {
      let image = promiseReturns[1]; //Promise.all returns an array of the inner promise returns based on order in promise.all
      this.map.addImage('redPin', image);
      //add events with the new pin
      this.addEventLayer(this.events);
    });

    let promise_map_blue_pin = Promise.all([_promiseMapLoad, _promiseBluePinLoad]);
    promise_map_blue_pin.then((promiseReturns) => {
      let image = promiseReturns[1]; //Promise.all returns an array of the inner promise returns based on order in promise.all
      this.map.addImage('bluePin', image);
    });

    //Add user location pin
    let promise_map_userloc_pins = Promise.all([_promiseMapLoad, _promiseGetUserLocation, _promisePinLoad, _promiseBluePinLoad]);
    promise_map_userloc_pins.then(() => {
      // this.addPinToLocation("currloc", this.lat, this.lng, 'redPin', .08);
    });

    this.addControls();
  }

  addEventLayer(data): void {
    //TODO: Add Removal of previous event layer
    //can change the url to a static geojson object from the service
    this.map.addSource('events', {
      type: 'geojson',
      data: data
    });

    this.map.addLayer({
      "id": "eventlayer",
      "type": "symbol",
      "source": "events",
      "layout": {
        "icon-image": 'redPin',
        "icon-size": .07,
        "icon-allow-overlap": true
      }
    });

    //Add a larger pin to later use for on hover
    this.addPinToLocation('hoveredPin', this.lat, this.lng, "bluePin", .07, false);
    this.addPinToLocation('redBackupHoveredPin', this.lat, this.lng, 'redPin', .09, false);
    //TEST FOR GOOD SQUARE size
    // this.addPinToLocation('hp1', this.lat+.0001, this.lng, 'redPin', .08, true);
    // this.addPinToLocation('hp2', this.lat, this.lng, 'redPin', .08, true);
    // this.addPinToLocation('hp3', this.lat+.0001, this.lng+.0001, 'redPin', .08, true);
    // this.addPinToLocation('hp4', this.lat, this.lng+.0001, 'redPin', .08, true);

  }

  updateSource(): void {
    if (this.map == undefined || this.map.getSource('events') == undefined) return;

    this.map.getSource('events').setData(this.events);
    this.removePinsAndPopups();
    this.selectedEvent = null;
  }

  // updateSourceWithoutEvent(eventIdToRemove: number): void {
  //   if (this.map == undefined || this.map.getSource('events') == undefined) return;
  //   let subsetOfEvents: FeatureCollection = {
  //     type: 'FeatureCollection',
  //     features: this.events.features.filter(curGeoJson => curGeoJson.id != eventIdToRemove)
  //   };
  //   this.map.getSource('events').setData(subsetOfEvents);
  // }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/trinakat/cjasrg0ui87hc2rmsomilefe3', // UCLA Campus Buildings (restricted by the border)
      // 'mapbox://styles/trinakat/cjashcgwq7rfo2srstatrxhyi', // UCLA Buildings
      // 'mapbox://styles/helarabawy/cj9tlpsgj339a2sojau0uv1f4',
      center: [this.lng, this.lat],
      maxBounds: [
        [-118.46, 34.056],
        [-118.428, 34.079]
      ],
      zoom: 15,
      pitch: 60
    });
  }

  addPinToLocation(id: string, latitude: number, longitude: number, icon: string, size: number, visible = true) {
    let point: FeatureCollection = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [longitude, latitude]
        }
      }]
    };

    this.map.addSource(id, {
      type: 'geojson',
      data: point
    });

    this.map.addLayer({
      "id": id,
      "type": "symbol",
      "source": id,
      "layout": {
        "visibility": (visible ? "visible" : "none"),
        "icon-image": icon,
        "icon-size": size,
        "icon-allow-overlap": true
      }
    });
  }

  addControls(): void {
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      fitBoundsOptions: {
        maxZoom: 17.7,
        speed: .3
      },
      trackUserLocation: true
    }));
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  addPopup(popup, coords, eventName: string, eventTime: string): void {
    if (popup == this.popup) {
      popup.setLngLat(coords)
        .addTo(this.map);
      document.getElementById('popupEvent').innerHTML = eventName;
      document.getElementById('popupDate').innerHTML = eventTime;
    } else {
      popup.setLngLat(coords)
        .addTo(this.map);
      document.getElementById('backupPopupEvent').innerHTML = eventName;
      document.getElementById('backupPopupDate').innerHTML = eventTime;
    }
  }

  //Not done through promises becauses no callbacks need to build off this anyway
  hoverPopup(): void {
    //HOVER
    this.map.on('mouseenter', 'eventlayer', (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';
      console.log("mouseenter");

      //slice returns a copy of the array rather than the actual array
      let coords = e.features[0].geometry.coordinates.slice();

      if (this.selectedEvent !== null) {
        if (e.features[0].id !== this.selectedEvent.id) {
          //add bigger red pin
          this.map.getSource('redBackupHoveredPin').setData({
            "geometry": {
              "type": "Point",
              "coordinates": coords
            },
            "type": "Feature"
          });
          this.map.setLayoutProperty('redBackupHoveredPin', 'visibility', 'visible');
        }

        this.addPopup(this.backupPopup, coords, e.features[0].properties.event_name,
          this._dateService.formatDate(new Date(e.features[0].properties.start_time)));
      } else {
        this.map.getSource('hoveredPin').setData({
          "geometry": {
            "type": "Point",
            "coordinates": coords
          },
          "type": "Feature"
        });
        this.map.setLayoutProperty('hoveredPin', 'visibility', 'visible');

        //add primary popups
        this.addPopup(this.popup, coords, e.features[0].properties.event_name,
          this._dateService.formatDate(new Date(e.features[0].properties.start_time)));
      }
    });

    this.map.on('mouseleave', 'eventlayer', () => {
      if (this.selectedEvent !== null) {
        this.backupPopup.remove();
        this.map.setLayoutProperty('redBackupHoveredPin', 'visibility', 'none');
      } else {
        this.popup.remove();
        this.map.setLayoutProperty('hoveredPin', 'visibility', 'none');
      }
    });

    //CLICK
    this.map.on('click', 'eventlayer', (e) => {
      // Populate the popup and set its coordinates
      // based on the feature found.
      // console.log("Click", e.features[0]);

      //Handle if you reclick an event
      if (this.selectedEvent && this.selectedEvent.id === e.features[0].id) {
        this.eventService.updateClickedEvent(null);
        return;
      }

      //the service then calls selectEvent
      this.eventService.updateClickedEvent(e.features[0]);
    });
  }

  removePinsAndPopups(): void {
    this.map.setLayoutProperty('hoveredPin', 'visibility', 'none');
    this.map.setLayoutProperty('redBackupHoveredPin', 'visibility', 'none');
    this.backupPopup.remove();
    this.popup.remove();
  }

  //if event exists put popup and blue pin, else unselect
  selectEvent(event: GeoJson): void {
    this.selectedEvent = event;
    this.removePinsAndPopups();

    if (event === null) {
      return;
    }

    // add blue hovered Pin
    let coords = event.geometry.coordinates.slice();
    this.map.getSource('hoveredPin').setData({
      "geometry": {
        "type": "Point",
        "coordinates": coords
      },
      "type": "Feature"
    });
    this.map.setLayoutProperty('hoveredPin', 'visibility', 'visible');

    this.addPopup(this.popup, coords, event.properties.event_name,
      this._dateService.formatDate(new Date(event.properties.start_time)));
  }

  threeDDisplay(): void {
    // Insert the layer beneath any symbol layer.
    let layers = this.map.getStyle().layers.reverse();
    let labelLayerIdx = layers.findIndex(function(layer) {
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

  addArrowControls(): void {
    // pixels the map pans when the up or down arrow is clicked
    const deltaDistance = 60;
    // degrees the map rotates when the left or right arrow is clicked
    const deltaDegrees = 25;
    const deltaZoom = .5;

    function easing(t) {
      return t * (2 - t);
    }

    this.map.getCanvas().focus();
    this.map.getCanvas().addEventListener('keydown', (e) => {
      e.preventDefault();
      if (e.which === 38) { // up
        this.map.panBy([0, -deltaDistance], {
          easing: easing
        });
      } else if (e.which === 40) { // down
        this.map.panBy([0, deltaDistance], {
          easing: easing
        });
      } else if (e.which === 37) { // left
        this.map.easeTo({
          bearing: this.map.getBearing() - deltaDegrees,
          easing: easing
        });
      } else if (e.which === 39) { // right
        this.map.easeTo({
          bearing: this.map.getBearing() + deltaDegrees,
          easing: easing
        });
      } else if (e.which === 32) { // zoom in (space)
        this.map.easeTo({
          zoom: this.map.getZoom() + deltaZoom,
          easing: easing
        });
      } else if (e.which === 8) { // zoom out (backspace)
        this.map.easeTo({
          zoom: this.map.getZoom() - deltaZoom,
          easing: easing
        });
      }
    }, true);
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
        if (error) {
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
        });
      } else {
        reject();
      }
    });

  }
}
