import { Component, OnInit } from '@angular/core';
import { Event } from '../event';
import { EVENTS } from '../mock-events';
import { MapService } from '../map.service'

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    private events;

    selectedEvent: Event;


    constructor(private mapService: MapService) { }

    ngOnInit() {
        this.getEvents();

    }


    getMonthNameFromMonthNumber(monthNumber){
        var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return monthNames[monthNumber];
    }

    formatHour(hour, minutes){
        var minuteString = ""
        if (minutes != 0){
            minuteString = ":" + minutes;
        }
        if (hour > 12){
            hour -= 12;
            return hour + minuteString + " PM";
        }
        else if (hour == 12){
            return hour + minuteString + " PM";
        }
        else if (hour == 24) {
            hour -= 12;
            return hour + minuteString + " AM";
        }
        else{
            return hour +  minuteString + " AM";
        }
    }
    formatDate(date) {
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        //console.log(minutes);

        if (day < 10){
            day = "0" + day;
        }
        return this.getMonthNameFromMonthNumber(month) + " " + day + " &middot; " + this.formatHour(hour, minutes);
    }

    formatDateItem(item) {
        var dateOfStart = new Date(item.properties.start_time);
        var dateOfEnd = new Date(item.properties.end_time);
        if (item.properties.end_time != "<NONE>"){
            item.properties.start_time = this.formatDate(dateOfStart) + " - " + this.formatHour(dateOfEnd.getHours(), dateOfEnd.getMinutes());
        }
        else {
            item.properties.start_time = this.formatDate(dateOfStart);
        }
    }
    getEvents(): void {
        this.mapService.getAllEvents().subscribe(events => {
        this.events = events.features;
        for (var event of this.events) {
            this.formatDateItem(event);
        }
    })
    }


    onSelect(event: Event): void {
        this.selectedEvent = event;
    }
}
