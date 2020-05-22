import { Component, OnInit, ViewChild } from "@angular/core";
import { MapInfoWindow, MapMarker, GoogleMap } from "@angular/google-maps";
import { DateService } from "../services/date.service";
import { EventService } from "../services/event.service";
import { LocationService } from "../services/location.service";
import { Router } from "@angular/router";
import { GeoJson, FeatureCollection } from "../map";

@Component({
  selector: "app-google-map",
  templateUrl: "./google-map.component.html",
  styleUrls: ["./google-map.component.scss"],
})
export class GoogleMapComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow;

  zoom = 12;

  center = new google.maps.LatLng(34.066915, -118.44532);

  UCLA_BOUNDS = {
    north: 34.08,
    south: 34.055,
    west: -118.47,
    east: -118.418,
  };

  options: google.maps.MapOptions = {
    // mapTypeId: 'hybrid',
    // zoomControl: false,
    // scrollwheel: false,
    // disableDoubleClickZoom: true,
    restriction: {
      latLngBounds: this.UCLA_BOUNDS,
      strictBounds: false,
    },
  };

  markers = [];
  markerDict = {};
  infoContent = "Hello";

  markerClicked: boolean = false;

  private events: FeatureCollection;

  constructor(
    private router: Router,
    private _dateService: DateService,
    private _eventService: EventService,
    private _locationService: LocationService
  ) {}

  ngOnInit() {
    // navigator.geolocation.getCurrentPosition(position => {
    //   this.center = {
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude,
    //   }
    // })

    // ALL THE STUFF FROM MAPBOX COMPONENT'S NGONINIT

    // Step 1: just display markers for all the events in the database.

    this._eventService.filteredDayEvents$.subscribe((eventCollection) => {
      // this.events = ;
      console.log(eventCollection);
      this.updateSource(eventCollection);
    });

    // whenever clicked event changes, ease to event pin
    this._eventService.clickedEvent$.subscribe((clickedEventInfo) => {
      // this.selectEvent(clickedEventInfo);
      // if(clickedEventInfo == null){
      //   this.map.easeTo({
      //     center: [-118.445320, 34.066915],
      //     zoom: 15,
      //     pitch: 60,
      //     bearing: 0
      //   });
      // }
      console.log(clickedEventInfo);
    });

    // // whenever selected date changes, update calendar
    // this._eventService.selectedDate$.subscribe(date => {
    //   this.ngZone.run( () => { this.updateCalendar(date); });
    // });

    // whenever clicked event changes, ease to event pin
    // this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
    //   this.selectEvent(clickedEventInfo);
    //   if(clickedEventInfo == null){
    //     this.map.easeTo({
    //       center: [-118.445320, 34.066915],
    //       zoom: 15,
    //       pitch: 60,
    //       bearing: 0
    //     });
    //   }
    // });

    // this._eventService.expandedEvent$.subscribe(expandedEventInfo => {
    //   this.boldPopup(expandedEventInfo);
    // });

    // this.buildMap();
    // if(this._eventService.getExpandedEvent() == null)
    //   this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);

    // let _promiseMapLoad = this.promiseMapLoad();
    // let _promiseGetUserLocation = this.promiseGetUserLocation();
    // let _promisePinLoad = this.promiseImageLoad(this.pinUrl);
    // let _promiseBluePinLoad = this.promiseImageLoad(this.bluePinPath);

    // //Add 3D buildings, on-hover popup, and arrowcontrols
    // _promiseMapLoad.then(() => {
    //   this.threeDDisplay();
    //   this.hoverPopup();
    //   this.addArrowControls();
    //   this.map.resize();
    //   this._eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
    //     this.hoverEvent(hoveredEventInfo);
    //   });
    // });

    // //Add all Events pins
    // let promise_map_pin = Promise.all([_promiseMapLoad, _promisePinLoad]);
    // promise_map_pin.then((promiseReturns) => {
    //   let image = promiseReturns[1];
    //   this.map.addImage('redPin', image);
    //   this.addEventLayer(this.events);
    // });
    // let promise_map_blue_pin = Promise.all([_promiseMapLoad, _promiseBluePinLoad]);
    // promise_map_blue_pin.then((promiseReturns) => {
    //   this.updateSource();
    //   this._eventService.allCategories();
    //   let image = promiseReturns[1];
    //   this.map.addImage('bluePin', image);
    // });

    // //Add user location pin
    // let promise_map_userloc_pins = Promise.all([_promiseMapLoad, _promiseGetUserLocation, _promisePinLoad, _promiseBluePinLoad]);
    // promise_map_userloc_pins.then(() => {
    //   // this.addPinToLocation("currloc", this.lat, this.lng, 'redPin', .08);
    // });

    // // add extra controls
    // this.addControls();
    // this._viewService.isMapView();
  }

  addMarker = (latitude: number, longitude: number, event: GeoJson) => {
    console.log("event");
    console.log(event);

    this.markers.push({
      position: {
        lat: latitude,
        lng: longitude,
      },
      title: event,
      info:
        '<div id="content">' +
        `${event.properties.name}` +
        `<div class="popup-date">${this._dateService.formatTime(
          event.properties.start_time
        )}</div>` +
        "</div>",
      // event: event,
      // tag: event,
      // options: { animation: google.maps.Animation.BOUNCE },
    });
  };

  click(event: google.maps.MouseEvent) {
    console.log(event);
    this.markerClicked = false;
    this.infoContent = "";
    this.info.close();
  }

  openInfo(marker, content: string) {
    this.markerClicked = true;
    this.infoContent = content;
    this.info.open(marker);

    let pos = marker.getPosition();

    // this.zoom = 3;
    // this.center = marker.getPosition();

    this.map.panTo(marker.getPosition());
    this.map.zoom = 18;

    console.log(marker._title._value);

    this._eventService.updateClickedEvent(marker._title._value);
    this._eventService.updateSidebarEvent(marker._title._value);
    this.router.navigate([
      "",
      { outlets: { sidebar: ["detail", marker._title._value.id] } },
    ]);
  }

  mouseoverMarker(marker: MapMarker, content: string) {
    if (!this.markerClicked) {
      this.infoContent = content;
      this.info.open(marker);
    }

    // let pos = marker.getPosition();

    // this.zoom = 3;
    // this.center = marker.getPosition();

    // this.map.panTo(marker.getPosition());
    // this.map.zoom = 20;
  }

  mouseoutMarker(marker: MapMarker) {
    if (this.markerClicked == false) {
      this.infoContent = "";
      this.info.close();
    }

    // let pos = marker.getPosition();

    // this.zoom = 3;
    // this.center = marker.getPosition();

    // this.map.panTo(marker.getPosition());
    // this.map.zoom = 20;
  }

  updateSource(eventCollection: FeatureCollection): void {
    // if (this.map == undefined || this.map.getSource('events') == undefined) return;
    // this.map.getSource('events').setData(this.events);
    this.events = eventCollection;

    this.markers = [];

    let eventList = [];
    //iterate through all events
    for (let eventIndex in this.events.features) {
      let ev = this.events.features[eventIndex];
      //capture event location
      let evLocation = JSON.stringify(ev["properties"]["place"]);
      //compare event location to provided location

      eventList.push(ev);
      this.addMarker(
        ev.geometry.coordinates[1],
        ev.geometry.coordinates[0],
        ev
      );
    }

    // this.removePinsAndPopups();
    // if(this._eventService.getClickedEvent()){
    //     this.selectEvent(this._eventService.getClickedEvent());
    //     this.boldPopup(this._eventService.getClickedEvent());
    // } else {
    //   this.map.easeTo({
    //     center: [-118.445320, 34.066915],
    //     zoom: 15,
    //     pitch: 60,
    //     bearing: 0
    //   });
    // }
    // this.selectedEvent = null;
  }
}
