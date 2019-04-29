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
    ngOnInit() { 
      this.temperature = this.getTemperature();
    }

    isCollapsed: boolean = true;
    temperature: string;
    icon: string;

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

    getTemperature(): string {
      var request = new XMLHttpRequest();
      var data;
      var jsondata;
      var temp;
      var icon;

      request.onreadystatechange = function() {
          if (request.readyState == XMLHttpRequest.DONE) {
              data = this.responseText;
              jsondata = JSON.parse(data);
              console.log(jsondata['main']['temp']);
              temp = String(jsondata['main']['temp']);

              icon = jsondata.weather[0].icon;
              console.log(icon);

              return temp;
          }
      }

      this.icon = "04d";

      request.open('GET', 'http://api.openweathermap.org/data/2.5/weather?units=imperial&zip=90024,us&APPID=bc6a73dfabbd4e6c9006a835d00589f2', true);
      request.send();

      return "59.5";
  }
}
