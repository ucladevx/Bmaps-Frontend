import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';
import { CalendarService } from '../calendar.service';
import * as moment from 'moment';

@Component({
  selector: 'app-category-bar-calendar',
  templateUrl: './category-bar-calendar.component.html',
  styleUrls: ['./category-bar-calendar.component.scss']
})

export class CategoryBarCalendarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = {};
  private filterHash = {};
  private events: GeoJson[];
  public selectedCategory = 'all';
  public showDropdown = false;
  private wasInside = false;

  constructor(private _categService: CategoryService, private _eventService: EventService, private _calendarService: CalendarService) {}

  ngOnInit() {
    this._eventService.dayEvents$.subscribe(eventCollection => {
      this.events = eventCollection.features;
    });
    this._eventService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
    this._eventService.filterHash$.subscribe(filterHash => {
      this.filterHash = filterHash;
    });
  }

  setDateFilter(){
    let firstInput = (<HTMLInputElement>document.getElementById('start-date')).value;
    let first = moment(firstInput).toDate();
    let lastInput = (<HTMLInputElement>document.getElementById('end-date')).value;
    let last = moment(lastInput).toDate();
    this._eventService.initDateHash(first,last);
    this._eventService.applyFiltersAndCategories();
  }

  getStartDate(){
    return moment(this._eventService.getDateHash()[0]).format('YYYY-MM-DD');
  }

  getEndDate(){
    return moment(this._eventService.getDateHash()[1]).format('YYYY-MM-DD');
  }

  setTimeFilter(){
    let firstInput = (<HTMLInputElement>document.getElementById('start-time')).value;
    var starttime = firstInput.split(":");
    var start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let lastInput = (<HTMLInputElement>document.getElementById('end-time')).value;
    var endtime = lastInput.split(":");
    var end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.initTimeHash(start,end);
    this._eventService.applyFiltersAndCategories();
  }

  getStartTime(){
    return this.convertNumToTime(this._eventService.getTimeHash()[0]);
  }

  getEndTime(){
    return this.convertNumToTime(this._eventService.getTimeHash()[1]);
  }

  setLocationFilter(){
    let locInput = (<HTMLInputElement>document.getElementById('location')).value;
    this._eventService.setLocationSearch(locInput);
  }

  getLoc(){
    return this._eventService.getLocationSearch();
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
    this._eventService.toggleFilter(filter);
  }

  categoryClicked(): void {
    var category = (<HTMLInputElement>document.getElementById("categories")).value;
    this._eventService.toggleCategory(category);
    this._categService.setSelectedCategory(category);
    this.selectedCategory = category;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this._eventService.updateCategories();
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
    this._categService.setSelectedCategory("all");
    this.selectedCategory = "all";
  }

  clearFilters(): void {
    for (let key in this.filterHash) {
      if (this.filterHash[key]) {
        this._eventService.toggleFilter(key);
      }
    }
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
