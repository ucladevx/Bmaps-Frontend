import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventService } from '../services/event.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  // current view
  public currentView: ViewState;
  public isMapSelected: boolean = true;
  // dropdowns
  public isMenuCollapsed: boolean = true;
  public isFilterCollapsed: boolean = true;
  // weather
  public temperature: string;
  public weatherIcon: string;
  public celsius: string;
  public fahrenheit: string;
  public isFahrenheit: boolean = true;
  public foundWeatherIcon: boolean = false;

  constructor(public _eventService: EventService, private _router: Router, private http: HttpClient) { }

  ngOnInit() {

    // whenever current vuew changes, maintain locla view variable
    this._eventService.currentView$.subscribe( view => {
      this.isMapSelected = (view == ViewState.map);
      this.currentView = view;
    });

    // initialize temperature
    this.getTemperature();
    setInterval(() => this.getTemperature(), 9000000);

    // pwa prompt
    let deferredPrompt, installButton;
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA Enabled on this Browser');
      e.preventDefault();
      deferredPrompt = e;
      if (installButton == undefined) {
        installButton = document.getElementById('install-button');
        installButton.style.display = 'block';
        installButton.addEventListener('click', (e) => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') { console.log('PWA setup accepted'); }
            else { console.log('PWA setup rejected'); }
            deferredPrompt = null;
    });});}});

  }

  // collapse menu (mobile)
  toggleMenuCollapse(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this.isFilterCollapsed = true;
  }

  // collapse filter menu (mobile)
  toggleFilterCollapse(): void {
    this.isFilterCollapsed = !this.isFilterCollapsed;
    this.isMenuCollapsed = true;
  }

  // update temperature (default: fahrenheit)
  getTemperature(): void {
    const API_KEY = "bc6a73dfabbd4e6c9006a835d00589f2";
    const zipcode = "90024";
    const baseWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";
    const defaultTemperatureUnits = "imperial";
    let weatherQuery = `${baseWeatherUrl}?units=${defaultTemperatureUnits}&zip=${zipcode},us&APPID=${API_KEY}`;
    this.http.get(weatherQuery).subscribe(weatherData => {
      let temp = weatherData['main']['temp'];
      this.fahrenheit = String(Math.round(temp)) + "°F";
      this.celsius = String(Math.round((temp - 32)/1.8) + "°C");
      if (this.isFahrenheit) this.temperature = String(this.fahrenheit);
      else this.temperature = String(this.celsius);
      this.weatherIcon = weatherData['weather'][0]['icon'];
    });
  }

  // switch temperature units
  switchTemperature(): void {
    this.isFahrenheit = !this.isFahrenheit;
    if (this.isFahrenheit) this.temperature = this.fahrenheit;
    else this.temperature = this.celsius;
  }

  // change view span
  changeView(newView: ViewState): void {
    // determine new path
    let path = "";
    let e = this._eventService.getSidebarEvent();
    switch(newView) {
      case ViewState.map:
        path += '/map'; break;
      case ViewState.week:
        path += '/calendar/week'; break;
      case ViewState.month:
        path += '/calendar/month'; break;
      case ViewState.threeday:
        path += '/calendar/three-day'; break;
    }
    if(e != null) path += "(sidebar:detail/"+e.id+")";
    else path += "(sidebar:list)";
    // determine selected date
    let d = this._eventService.getSelectedDate();
    if (d == null) d = new Date();
    // change date span
    this._eventService.changeDateSpan(d, newView);
    this._router.navigateByUrl(path);
    // update sidebar view
    if(newView == ViewState.map && e) {
      if(moment(d).isSame(moment(e.properties.start_time),'d')) {
        this._eventService.updateClickedEvent(e);
        this._eventService.updateSidebarEvent(e);
      } else {
        this._eventService.resetEventSelection();
      }
    }
  }

  // retrieve previous calendar view to return to
  lastCalendarView(){
    if(this._eventService.isMapView())
      return this._eventService.retrieveLastView();
  }

}
