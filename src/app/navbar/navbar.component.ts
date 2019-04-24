import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../category.service';
import { CalendarService } from '../calendar.service';
import { EventService } from '../event.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
    @Output() changeView: EventEmitter<string> = new EventEmitter();

    constructor(private _eventService: EventService, private _categService: CategoryService, private _calendarService: CalendarService, private _router: Router) { }
    ngOnInit() { }

    isCollapsed: boolean = true;
    isMapSelected: boolean = true; 

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
        this.isMapSelected = !this.isMapSelected;
        if (this.isMapSelected) {
            this.emitChangeView('map')
            this._router.navigateByUrl('/map');
        }
        else {
            if (this._calendarService.retrieveLastView() == 'week'){
                this.emitChangeView('week')
                this._router.navigateByUrl('/calendar/week');
            }
            else {
                this.emitChangeView('month')
                this._router.navigateByUrl('/calendar/month');
            }
        }
        console.log('toggleView()');
    }

    // mark .views-switch as ng-not-empty ng-valid
    // mark .views-switch-text as ng-pristine ng-untouched ng-valid ng-not-empty
}
