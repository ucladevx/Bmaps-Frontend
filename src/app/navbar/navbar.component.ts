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
      if(this._displayService.getSelectedDay() != null){
        d = this._displayService.getSelectedDay();
      }
      this._displayService.updateDayEvents(d);
      this._displayService.updateMonthEvents(d);
      this._displayService.updateWeekEvents(d);
      this._displayService.resetFilters();
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
        if (this._displayService.isCalendarView()) {
            this.emitChangeView('map');
            this.isMapSelected = true;
            this._router.navigateByUrl('/map(sidebar:list)');
        }
        else {
            this.isMapSelected = false;
            if (this._displayService.retrieveLastView() == 'week'){
                this.emitChangeView('week')
                this._router.navigateByUrl('/calendar/week(sidebar:list)');
            }
            else {
                this.emitChangeView('month')
                this._router.navigateByUrl('/calendar/month(sidebar:list)');
            }
        }
    }
}
