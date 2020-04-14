import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ViewState } from '../view-enum';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    public ViewState = ViewState;
    public currentDate: number = 7;
    public temperature: string;
    public weatherIcon: string;
    public celsius: string;
    public fahrenheit: string;
    isFahrenheit: boolean = true;
    foundWeatherIcon: boolean;

    isMapSelected: boolean = true;
    currentView: ViewState;
    isMonth: boolean = false;

    constructor(public _eventService: EventService, private _router: Router, private http: HttpClient) {
      this._eventService.currentView$.subscribe( view => {
        if(view == ViewState.map)
          this.isMapSelected = true;
        else {
          this.isMapSelected = false;
          if (view == ViewState.month)
            this.currentView = ViewState.month;
          else if (view == ViewState.week)
            this.currentView = ViewState.week;
          else if (view == ViewState.threeday)
            this.currentView = ViewState.threeday;
        }
      });
      this.isMapSelected = this._eventService.isMapView();
    }

    ngOnInit() {
      this.getCurrentDay();
      this.getTemperature();
      setInterval(() => this.getTemperature(), 9000000);
      let deferredPrompt;
      let installButton;
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
              if (choiceResult.outcome === 'accepted') {
                console.log('PWA setup accepted');
              } else {
                console.log('PWA setup rejected');
              }
              deferredPrompt = null;
            });
          });
        }
      });

    }

    isCollapsed: boolean = true;

    getCurrentDay(): void {
      let today = new Date();
      this.currentDate = today.getDate();
    }

    public isFilterCollapsed: boolean = true;

    toggleMenuCollapse(): void {
      this.isCollapsed = !this.isCollapsed;
      this.isFilterCollapsed = true;
    }

    toggleFilterCollapse(): void {
      this.isFilterCollapsed = !this.isFilterCollapsed;
      this.isCollapsed = true;
    }

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
        //set default temperature to Fahrenheit
        if (this.isFahrenheit)
          this.temperature = String(this.fahrenheit);
        else
          this.temperature = String(this.celsius);
        this.weatherIcon = weatherData['weather'][0]['icon'];
      });
    }

    switchTemperature(): void {
      this.isFahrenheit = !this.isFahrenheit;
      if (this.isFahrenheit)
        this.temperature = this.fahrenheit;
      else
        this.temperature = this.celsius;
    }

    checkImage(imageSrc) {
      if(imageSrc.includes("undefined"))
        return false;
      var img = new Image();
      try {
        img.src = imageSrc;
        return true;
      } catch(err) {
        return false;
      }
    }

    toggleView(): void {
      if (this._eventService.isCalendarView()) {
        this.isMapSelected = true;
        this.changeView(ViewState.map);
      } else {
        this.isMapSelected = false;
        console.log(this._eventService.retrieveLastView());
        switch(this._eventService.retrieveLastView()) {
          case ViewState.week:
            this.changeView(ViewState.week);
            break;
          case ViewState.month:
            this.changeView(ViewState.month);
            break;
          case ViewState.threeday:
            this.changeView(ViewState.threeday);
            break;
        }
      }
    }

    changeView(newView: ViewState): void {
      let path = "";
      let e = this._eventService.getSidebarEvent();
      switch(newView) {
        case ViewState.map:
          path += '/map';
          break;
        case ViewState.week:
          path += '/calendar/week';
          break;
        case ViewState.month:
          path += '/calendar/month';
          break;
        case ViewState.threeday:
          path += '/calendar/three-day';
          break;
      }
      if(e != null)
        path += "(sidebar:detail/"+e.id+")";
      else
        path += "(sidebar:list)";
      let d = this._eventService.getSelectedDate();
      if (d == null) d = new Date();
      this._eventService.changeDateSpan(d, newView);
      this._router.navigateByUrl(path);
    }

}
