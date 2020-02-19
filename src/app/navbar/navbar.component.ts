import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarViewState } from '../calendar-view-enum';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    public CalendarViewState = CalendarViewState;
    public currentDate: number = 7;
    public temperature: string;
    public weatherIcon: string;
    public celsius: string;
    public fahrenheit: string;
    isFahrenheit: boolean = true;
    foundWeatherIcon: boolean;

    @Output() changeView: EventEmitter<string> = new EventEmitter();

    isMapSelected: boolean = true;
    currentView: CalendarViewState = CalendarViewState.month;
    isMonth: boolean = false;

    constructor(private _eventService: EventService, public _viewService: ViewService, private _router: Router, private http: HttpClient) {
      this._viewService.currentView$.subscribe( view => {
        if(view == 'map')
          this.isMapSelected = true;
        else
          this.isMapSelected = false;
        if(view == 'month')
          this.currentView = CalendarViewState.month;
          //this.isMonth = true;
        if(view == 'week')
          this.currentView = CalendarViewState.week;
          //this.isMonth = false;
        if (view == 'three-day')
          this.currentView = CalendarViewState.threeday;
      });
      this._viewService.isMapView();
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

    emitChangeView(newView: string): void {
      this.changeView.emit(newView);
      let d = new Date();
      if(this._eventService.getCurrentDate() != null)
        d = this._eventService.getCurrentDate();
      this._eventService.updateDayEvents(d);
      this._eventService.updateMonthEvents(d);
      this._eventService.updateWeekEvents(d);
      this._eventService.resetFilters(newView);
      if(newView == 'map')
          this._eventService.allCategories();
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

    changeCalendarView(view: CalendarViewState): void {
      this.currentView = view;
      let path = "";
      let ev = this._eventService.getExpandedEvent();
      if (view == CalendarViewState.week) {
        this.emitChangeView('week');
        path += '/calendar/week';
      }
      else if (view == CalendarViewState.month) {
        this.emitChangeView('month');
        path += '/calendar/month';
      }
      else if (view == CalendarViewState.threeday) {
        this.emitChangeView('threeday');
        path += '/calendar/three-day';
      }

      if(ev!=null)
        path += "(sidebar:detail/"+ev.id+")";
      else
        path += "(sidebar:list)";
      this._router.navigateByUrl(path);
    }

    toggleViews(): void {
      let ev = this._eventService.getExpandedEvent();
      let path = "";
      if (this._viewService.isCalendarView()) {
        this.emitChangeView('map');
        this.isMapSelected = true;
        path += '/map';
      }
      else {
        this.isMapSelected = false;
        if (this._viewService.retrieveLastView() == 'week') {
          this.emitChangeView('week');
          path += '/calendar/week';
          //this.currentView = CalendarViewState.week;
        }
        else if (this._viewService.retrieveLastView() == 'month') {
          this.emitChangeView('month');
          path += '/calendar/month';
          //this.currentView = CalendarViewState.month;
        }
        else if (this._viewService.retrieveLastView() == 'three-day') {
          this.emitChangeView('three-day');
          path += '/calendar/three-day';
          //this.currentView = CalendarViewState.threeday;
        }

      }
      if(ev!=null)
        path += "(sidebar:detail/"+ev.id+")";
      else
        path += "(sidebar:list)";
      this._router.navigateByUrl(path);
    }

}
