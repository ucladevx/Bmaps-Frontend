import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayService } from '../services/display.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
    @Output() changeView: EventEmitter<string> = new EventEmitter();

    isMapSelected: boolean = true;

    constructor(private _displayService: DisplayService, private _router: Router) {
      this._displayService.currentView$.subscribe( view => {
        if(view == 'map')
          this.isMapSelected = true;
        else
          this.isMapSelected = false;
      });
      this._displayService.isMapView();
    }
    ngOnInit() { }

    isCollapsed: boolean = true;

    emitChangeView(newView: string): void {
      this.changeView.emit(newView);
      let d = new Date();
      if(this._displayService.getCurrentDate() != null){
        d = this._displayService.getCurrentDate();
      }
      this._displayService.updateDayEvents(d);
      this._displayService.updateMonthEvents(d);
      this._displayService.updateWeekEvents(d);
      this._displayService.resetFilters(newView);
      if(newView == 'map'){
          this._displayService.allCategories();
      }
    }

    public isFilterCollapsed: boolean = true;

    toggleMenuCollapse(): void {
      this.isCollapsed = !this.isCollapsed;
      this.isFilterCollapsed = true;
    }

    toggleFilterButtonCollapse(): void {
      this.isFilterCollapsed = !this.isFilterCollapsed;
      this.isCollapsed = true;
    }

    toggleViews(): void {
      let ev = this._displayService.getExpandedEvent();
      let path = "";
      if (this._displayService.isCalendarView()) {
        this.emitChangeView('map');
        this.isMapSelected = true;
        path += '/map';
      }
      else {
        this.isMapSelected = false;
        if (this._displayService.retrieveLastView() == 'week'){
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
