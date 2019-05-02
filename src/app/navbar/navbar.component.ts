import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { HttpClient } from '@angular/common/http';

const API_KEY = "bc6a73dfabbd4e6c9006a835d00589f2";
const zipcode = "90024";
const baseWeatherUrl = "http://api.openweathermap.org/data/2.5/weather";
const defaultTemperatureUnits = "imperial";

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
    public temperature: string;
    public weatherIcon: string;
    public celsius: number;
    public fahrenheit: number;

    @Output() changeView: EventEmitter<string> = new EventEmitter();

    constructor(private _eventService: EventService, private _categService: CategoryService, private http: HttpClient) { }

    isCollapsed: boolean = true;

    ngOnInit() { 
      // our call back function 
      this.getTemperature();
    }

    collapsed(event: any): void {
        // console.log(event);
    }

    expanded(event: any): void {
        // console.log(event);
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
      var weatherQuery = `${baseWeatherUrl}?units=${defaultTemperatureUnits}&zip=${zipcode},us&APPID=${API_KEY}`;

      this.http.get(weatherQuery).subscribe(weatherData => {
        //set default temperature to Fahrenheit
        this.temperature = String(Math.round((weatherData['main']['temp']))) + "°F";
        this.weatherIcon = weatherData['weather'][0]['icon'];

        this.fahrenheit = Math.round(weatherData['main']['temp']);
        this.celsius = Math.round((weatherData['main']['temp'] - 32)/1.8);
      });

    }

    isFahrenheit: boolean = true;

    switchTemperature(): void {
      
      this.isFahrenheit = !this.isFahrenheit;

      if (this.isFahrenheit)
        this.temperature = String(this.fahrenheit) + "°F";
      else
        this.temperature = String(this.celsius) + "°C";
    }
}