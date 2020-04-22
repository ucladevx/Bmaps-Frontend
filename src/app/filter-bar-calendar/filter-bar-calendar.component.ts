import { Component, OnInit, HostListener, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

@Component({
  selector: 'app-filter-bar-calendar',
  templateUrl: './filter-bar-calendar.component.html',
  styleUrls: ['./filter-bar-calendar.component.scss']
})

export class FilterBarCalendarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private wasInside = false;

  // category hash
  private categHash = {};
  // tag hash
  private tagHash = {};
  // dropdown toggle
  public showDropdown = false;
  // calendar events
  public events = [];

  constructor(private _eventService: EventService) {}

  ngOnInit() {
    // whenever categories or tags are updated, update local variables
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.tagHash$.subscribe(tagHash => { this.tagHash = tagHash; });
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
  setDateFilter(startDate: string, endDate: string){
    let first  = moment(startDate).toDate();
    let last = moment(endDate).toDate();
    this._eventService.setDateFilter(first,last);
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
  setTimeFilter(startTime: string, endTime: string){
    let starttime = startTime.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let endtime = endTime.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.setTimeFilter(start,end);
  }

  // retrieve time filter
  getStartTime(){
    if(this._eventService.getTimeFilter())
      return this.convertNumToTime(this._eventService.getTimeFilter().start);
    else return 0;
  }
  getEndTime(){
    if(this._eventService.getTimeFilter())
      return this.convertNumToTime(this._eventService.getTimeFilter().end);
    else return 0;
  }

  // convert number to equivalent time (via minutes)
  convertNumToTime(minutes: number){
    let hours = (Math.floor(minutes / 60))%24;
    minutes = (minutes-(hours*60))%60;
    let minString = minutes.toString();
    if(minString.length == 1) minString = "0"+minString;
    let hourString = hours.toString();
    if(hourString.length == 1) hourString = "0"+hourString;
    let time = hourString+":"+minString;
    return time;
  }

  // update location filter
  setLocationFilter(locInput: string){ this._eventService.setLocationFilter(locInput); }

  // retrieve location filter
  getLoc(){ return this._eventService.getLocationFilter(); }
  clearLoc(){ this._eventService.setLocationFilter(null); }

  // update tag
  tagClicked(tag: string): void { this._eventService.toggleTag(tag); }

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
    if (!this.wasInside) {
      this.showDropdown = false;
    }
    this.wasInside = false;
  }

  // helper function for returning object keys
  private objectKeys(obj) {
    return Object.keys(obj);
  }

}
