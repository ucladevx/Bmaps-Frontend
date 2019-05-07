import { Component, OnInit, HostListener, Input } from '@angular/core';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-category-bar-calendar',
  templateUrl: './category-bar-calendar.component.html',
  styleUrls: ['./category-bar-calendar.component.css']
})

export class CategoryBarCalendarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = {};
  private filterHash = {};
  public showDropdown = false;
  private wasInside = false;

  constructor(private _eventService: EventService, private _viewService: ViewService) {}

  ngOnInit() {
    this._eventService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
    this._eventService.tagHash$.subscribe(filterHash => {
      this.filterHash = filterHash;
    });
  }

  setDateFilter(){
    let firstInput = (<HTMLInputElement>document.getElementById('start-date')).value;
    let first = moment(firstInput).toDate();
    let lastInput = (<HTMLInputElement>document.getElementById('end-date')).value;
    let last = moment(lastInput).toDate();
    this._eventService.setDateFilter(first,last);
  }

  getStartDate(){
    return moment(this._eventService.getDateFilter()[0]).format('YYYY-MM-DD');
  }

  getEndDate(){
    return moment(this._eventService.getDateFilter()[1]).format('YYYY-MM-DD');
  }

  setTimeFilter(){
    let firstInput = (<HTMLInputElement>document.getElementById('start-time')).value;
    let starttime = firstInput.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let lastInput = (<HTMLInputElement>document.getElementById('end-time')).value;
    let endtime = lastInput.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.setTimeFilter(start,end);
  }

  getStartTime(){
    return this.convertNumToTime(this._eventService.getTimeFilter()[0]);
  }

  getEndTime(){
    return this.convertNumToTime(this._eventService.getTimeFilter()[1]);
  }

  setLocationFilter(){
    let locInput = (<HTMLInputElement>document.getElementById('location')).value;
    this._eventService.setLocationFilter(locInput);
  }

  getLoc(){
    return this._eventService.getLocationFilter();
  }

  clearLoc(){
    this._eventService.setLocationFilter(null);
  }

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

  filterClicked(filter: string): void {
    this._eventService.toggleTag(filter);
  }

  categoryClicked(): void {
    let category = (<HTMLInputElement>document.getElementById("categories")).value;
    this._eventService.toggleCategory(category);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  clearCategories(): void {
    for (let key in this.categHash) {
      if (this.categHash[key].selected) {
        this._eventService.toggleCategory(key);
      }
    }
    if(this.categHash){
      this.categHash["all"].selected = true;
    }
  }

  clearFilters(): void {
    for (let key in this.filterHash) {
      if (this.filterHash[key]) {
        this._eventService.toggleTag(key);
      }
    }
  }



  clearAllFilters(){
    this._eventService.resetFilters('calendar');
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
