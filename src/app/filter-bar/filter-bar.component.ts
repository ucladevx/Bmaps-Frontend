import { Component, OnInit, HostListener, Input, ViewChildren, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../services/modal.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})

export class FilterBarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  @ViewChildren('modal_2') modal_2: TemplateRef<any>;
  @ViewChildren('vc') vc: ViewContainerRef;
  private wasInside = false;

  // category hash
  private categHash = {};
  // tag hash
  private locFilter = 'none';
  private locations = [];
  private dateFilter = 'none';
  private timeFilter = 'none';
  // dropdown toggle
  public showDropdown = false;
  public showModal = false;
  // calendar events
  public events = [];

  constructor(private _eventService: EventService, private _dateService: DateService, private modalService: ModalService) {}

  ngOnInit() {
    // whenever categories or tags are updated, update local variables
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.locFilter$.subscribe(locInfo => { this.locFilter = locInfo.tag; });
    this._eventService.locations$.subscribe(locOptions => { this.locations = locOptions; });
    this._eventService.dateFilter$.subscribe(dateInfo => { this.dateFilter = dateInfo.tag; });
    this._eventService.timeFilter$.subscribe(timeInfo => { this.timeFilter = timeInfo.tag; });
    // whenever calendar events change, update the local events variable
    this._eventService.monthEvents$.subscribe(events => {
      if(this._eventService.getCurrentView() == ViewState.month)
        this.events = events;
    });
    this._eventService.weekEvents$.subscribe(events => {
      if(this._eventService.getCurrentView() == ViewState.week)
        this.events = events;
    });
    this._eventService.threeDayEvents$.subscribe(events => {
      if(this._eventService.getCurrentView() == ViewState.threeday)
        this.events = events;
    });
  }

  // determine whether a category should be displayed
  displayCategory(categKey: string){
    switch(this._eventService.getCurrentView()){
      case ViewState.month:
        return (this.categHash[categKey].numEventsMonth > 0); break;
      case ViewState.week:
        return (this.categHash[categKey].numEventsWeek > 0); break;
      case ViewState.threeday:
        return (this.categHash[categKey].numEventsThreeDay > 0); break;
    }
    return false;
  }

  // update date filter
  setDateFilter(dateInput: string){
    this._eventService.setDateFilter(dateInput);
    /* let first  = moment(startDate).toDate();
    let last = moment(endDate).toDate();
    this._eventService.setDateFilter(first,last); */
  }

  // retrieve date filter
  getStartDate(){
    if(this._eventService.getDateFilter())
      return moment(this._eventService.getDateFilter().start).format('YYYY-MM-DD');
  }
  getEndDate(){
    if(this._eventService.getDateFilter())
      return moment(this._eventService.getDateFilter().end).format('YYYY-MM-DD');
  }

  // update time filter
  setTimeFilter(timeInput: string){
    this._eventService.setTimeFilter(timeInput);
    /* let starttime = startTime.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let endtime = endTime.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.setTimeFilter(start,end); */
  }

  // retrieve time filter
  getStartTime(){
    if(this._eventService.getTimeFilter())
      return this._dateService.convertNumToTime(this._eventService.getTimeFilter().start);
    else return 0;
  }
  getEndTime(){
    if(this._eventService.getTimeFilter())
      return this._dateService.convertNumToTime(this._eventService.getTimeFilter().end);
    else return 0;
  }

  // update location filter
  setLocFilter(locInput: string){ this._eventService.setLocFilter(locInput); }

  // retrieve location filter
  clearLoc(){ this._eventService.setLocFilter('none'); }

  // update category
  categoryClicked(category: string): void { this._eventService.toggleCategory(category); }

  // toggle dropdown on/off
  toggleDropdown() { this.showDropdown = !this.showDropdown; }

  // clear categories
  resetCategories(): void { this._eventService.clearCategories(); }

  // clear filters
  clearFilters(): void { this._eventService.resetFilters(); }

  // click behavior
  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside && !this.showModal) {
      this.showDropdown = false;
    }
    this.wasInside = false;
  }

  // helper function for returning object keys
  private objectKeys(obj) {
    return Object.keys(obj);
  }

  openModal(id: string) {
    this.modalService.open(id);
    this.showModal = true;
  }

  closeModal(id: string) {
    this.modalService.close(id);
    this.showModal = false;
  }

}
