import { Component, OnInit, HostListener, Input } from '@angular/core';
import { EventService } from '../services/event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-filter-bar-calendar',
  templateUrl: './filter-bar-calendar.component.html',
  styleUrls: ['./filter-bar-calendar.component.scss']
})

export class FilterBarCalendarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = {};
  private tagHash = {};
  public showDropdown = false;
  private wasInside = false;

  constructor(private _eventService: EventService) {}

  ngOnInit() {
    this._eventService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
    this._eventService.tagHash$.subscribe(tagHash => {
      this.tagHash = tagHash;
    });
  }

  setDateFilter(startDate: string, endDate: string){
    let first  = moment(startDate).toDate();
    let last = moment(endDate).toDate();
    this._eventService.setDateFilter(first,last);
  }

  getStartDate(){ if(this._eventService.getDateFilter()){ return moment(this._eventService.getDateFilter()[0]).format('YYYY-MM-DD'); }}
  getEndDate(){ if(this._eventService.getDateFilter()){ return moment(this._eventService.getDateFilter()[1]).format('YYYY-MM-DD'); }}

  setTimeFilter(startTime: string, endTime: string){
    let starttime = startTime.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let endtime = endTime.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.setTimeFilter(start,end);
  }

  getStartTime(){
    if(this._eventService.getTimeFilter()) return this.convertNumToTime(this._eventService.getTimeFilter()[0]);
    else return 0;
  }
  getEndTime(){
    if(this._eventService.getTimeFilter()) return this.convertNumToTime(this._eventService.getTimeFilter()[1]);
    else return 0;
  }

  setLocationFilter(locInput: string){
    this._eventService.setLocationFilter(locInput);
  }

  getLoc(){ return this._eventService.getLocationFilter(); }
  clearLoc(){ this._eventService.setLocationFilter(null); }

  convertNumToTime(minutes: number){
    let hours = (Math.floor(minutes / 60))%24;
    minutes = (minutes-(hours*60))%60;
    let minString = minutes.toString();
    if(minString.length == 1){
      minString = "0"+minString;
    }
    let hourString = hours.toString();
    if(hourString.length == 1){
      hourString = "0"+hourString;
    }
    let time = hourString+":"+minString;
    return time;
  }

  tagClicked(tag: string): void {
    this._eventService.toggleTag(tag);
  }

  categoryClicked(category: string): void {
    this._eventService.toggleCategory(category);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  clearCategories(): void { this._eventService.allCategories(); }

  clearFilters(): void {
    this._eventService.resetFilters();
  }

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

  private objectKeys(obj) {
    return Object.keys(obj);
  }

}
