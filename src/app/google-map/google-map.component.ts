import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import { DateService } from '../services/date.service';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { GeoJson, FeatureCollection } from '../map';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit {

  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow

  zoom = 12;

  center: google.maps.LatLngLiteral = {
    lat: 34.066915,
    lng: -118.445320
  }

  options: google.maps.MapOptions = {
    // mapTypeId: 'hybrid',
    // zoomControl: false,
    // scrollwheel: false,
    // disableDoubleClickZoom: true,
    // maxZoom: 15,
    // minZoom: 8,
  };

  markers = [];

  private events: FeatureCollection;


  constructor(private router: Router,
              private _dateService: DateService,
              private _eventService: EventService,
              private _locationService: LocationService,
              private _viewService: ViewService)
  {
  }

  ngOnInit() {
    // navigator.geolocation.getCurrentPosition(position => {
    //   this.center = {
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude,
    //   }
    // })

    // ALL THE STUFF FROM MAPBOX COMPONENT'S NGONINIT

    // Step 1: just display markers for all the events in the database.

    this._eventService.filteredDayEvents$.subscribe(eventCollection => {
      this.events = eventCollection;
      // this.updateSource();
    });

    let eventList = [];
    //iterate through all events
    for(let eventIndex in this.events.features){
      let ev = this.events.features[eventIndex];
      //capture event location
      let evLocation = JSON.stringify(ev["properties"]["place"]);
      //compare event location to provided location

      eventList.push(ev);
      this.addMarker(ev.geometry.coordinates[1], ev.geometry.coordinates[0]);
    }


    // for

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

  addMarker = (latitude: number, longitude: number) => {
    this.markers.push({
      position: {
        lat: latitude,
        lng: longitude,
      },
      label: {
        color: 'red',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1),
      options: { animation: google.maps.Animation.BOUNCE },
    })
  }

  click(event: google.maps.MouseEvent) {
    console.log(event)
  }

  // updateSource(): void {
  //   if (this.map == undefined || this.map.getSource('events') == undefined) return;
  //   this.map.getSource('events').setData(this.events);
  //   this.removePinsAndPopups();
  //   if(this._eventService.getClickedEvent()){
  //       this.selectEvent(this._eventService.getClickedEvent());
  //       this.boldPopup(this._eventService.getClickedEvent());
  //   } else {
  //     this.map.easeTo({
  //       center: [-118.445320, 34.066915],
  //       zoom: 15,
  //       pitch: 60,
  //       bearing: 0
  //     });
  //   }
  //   this.selectedEvent = null;
  // }

}
