import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    public currentDate: number = 7;
    @Output() changeView: EventEmitter<string> = new EventEmitter();

    isMapSelected: boolean = true;

    constructor(private _eventService: EventService, private _viewService: ViewService, private _router: Router) {
      this._viewService.currentView$.subscribe( view => {
        if(view == 'map')
          this.isMapSelected = true;
        else
          this.isMapSelected = false;
      });
      this._viewService.isMapView();
    }
    ngOnInit() {
      this.getCurrentDay();
    }

    getCurrentDay(): void {
      let today = new Date();
      this.currentDate = today.getDate();
    }

    isCollapsed: boolean = true;

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
        if (this._viewService.retrieveLastView() == 'week'){
          this.emitChangeView('week');
          path += '/calendar/week';
        }
        else {
          this.emitChangeView('month');
          path += '/calendar/month';
        }
      }
      if(ev!=null)
        path += "(sidebar:detail/"+ev.id+")";
      else
        path += "(sidebar:list)";
      this._router.navigateByUrl(path);
    }

}
