import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategoryService } from '../category.service';
import { EventService } from '../event.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
    @Output() changeView: EventEmitter<string> = new EventEmitter();

    constructor(private _eventService: EventService, private _categService: CategoryService) { }
    temperature: string;
    icon: string;
    isCollapsed: boolean = true;
    ngOnInit() { 
      // our call back function 
      var tempCallback = function callback(temperature, icon) : void{
        this.temperature = temperature;
        this.icon = icon;
      }
      tempCallback = tempCallback.bind(this);
      this.getTemperature(tempCallback);
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

    getTemperature(callback): void{
      var request = new XMLHttpRequest();
      var data;
      var temperature;
      var icon;

      request.open('GET', 'http://api.openweathermap.org/data/2.5/weather?units=imperial&zip=90024,us&APPID=bc6a73dfabbd4e6c9006a835d00589f2', true);
      request.onreadystatechange = function(){
        // check for the state if it is done
        if(request.readyState === XMLHttpRequest.DONE && request.status === 200){
          //parse API data
          data = JSON.parse(this.responseText);
          temperature = String(data['main']['temp']);
          icon = data.weather[0].icon;
          // use the callback to send the data.
          callback(temperature, icon);
        }
      }
      request.send();
  }
}