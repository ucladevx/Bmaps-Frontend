import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../category.service';
import { CalendarService } from '../calendar.service';
import { EventService } from '../event.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
    public temperature: string;
    public weatherIcon: string;
    public celsius: string;
    public fahrenheit: string;
    isFahrenheit: boolean = true;
    foundWeatherIcon: boolean;

    @Output() changeView: EventEmitter<string> = new EventEmitter();

    isMapSelected: boolean;

    constructor(public _eventService: EventService, private _categService: CategoryService, public _calendarService: CalendarService, private _router: Router, private http: HttpClient) {
      this._calendarService.view$.subscribe( view => {
        if(view == 'map'){
          this.isMapSelected = true;
        } else {
          this.isMapSelected = false;
        }
      });
    }
  
    isCollapsed: boolean = true;

    ngOnInit() { 
      // our call back function 
      this.getTemperature();
      setInterval(() => this.getTemperature(), 9000000);
    }

    emitChangeView(newView: string): void {
      this.changeView.emit(newView);
      let d = new Date();
      if(this._eventService.getSelectedDay() != null){
        d = this._eventService.getSelectedDay();
      }
      this._eventService.updateDayEvents(d);
      let monthyear = d.getMonth() + " " + d.getFullYear();
      this._eventService.updateMonthEvents(monthyear);
      this._eventService.updateWeekEvents(d);
      this._eventService.resetFilters();
      if(newView == 'map'){
          this._eventService.allCategories();
      } else {
        this._eventService.initTimeHash(0,1439);
        this._eventService.setLocationSearch("");
        this._eventService.setUniversalSearch("");
      }
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
  
    toggleViews(): void {
        if (!this._calendarService.isMapView()) {
            this.emitChangeView('map');
            this.isMapSelected = true;
            this._router.navigateByUrl('/map(sidebar:list)');
        }
        else {
            this.isMapSelected = false;
            if (this._calendarService.retrieveLastView() == 'week'){
                this.emitChangeView('week')
                this._router.navigateByUrl('/calendar/week(sidebar:list)');
            }
            else {
                this.emitChangeView('month')
                this._router.navigateByUrl('/calendar/month(sidebar:list)');
            }
        }
    }

    getTemperature(): void { 
      const API_KEY = "bc6a73dfabbd4e6c9006a835d00589f2";
      const zipcode = "90024";
      const baseWeatherUrl = "http://api.openweathermap.org/data/2.5/weather";
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
      var img = new Image();
      try {
        img.src = imageSrc;
        return true;
      } catch(err) {
        return false;
      }
    }

  }

  // mark .views-switch as ng-not-empty ng-valid
  // mark .views-switch-text as ng-pristine ng-untouched ng-valid ng-not-empty
