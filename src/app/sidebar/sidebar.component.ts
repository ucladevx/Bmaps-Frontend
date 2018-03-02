import { Component, OnInit } from '@angular/core';
import { Event } from '../event';
import { EVENTS } from '../mock-events';
import { MapService } from '../map.service';
import { DateService } from '../shared/date.service';
import { AfterViewInit, ViewChild } from '@angular/core';
import { CategoryBarComponent } from '../category-bar/category-bar.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    providers: [ DateService ]
})
export class SidebarComponent implements OnInit {

    private events;
    private filteredEvents;
    @ViewChild(CategoryBarComponent)
    private categoryBar: CategoryBarComponent;

    selectedEvent: Event;

  
    constructor(private mapService: MapService, private _dateService: DateService) { }

    ngOnInit() {
        this.getEvents();
    }

    toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }

    getEvents(): void {
      // console.log(this.mapService.getAllEvents().features);
      this.mapService.getAllEvents().subscribe(events => {
        this.events = events.features;
        this.filteredEvents = events.features;
        this.initCategoryBar();
        for (var event of this.events) {
            this._dateService.formatDateItem(event);
        }
      })
    }

    onSelect(event: Event): void {
      this.selectedEvent = event;
    }

    filterByCategory(category: string): void {
      this.filteredEvents = [];
      for (let e of this.events) {
        if (category.toLowerCase() == e.properties.category.toLowerCase()) {
          this.filteredEvents.push(e);
        }
      }
    }

    initCategoryBar(): void { this.categoryBar.getCategories(this.events) }
}
