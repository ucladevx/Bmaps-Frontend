import { Component, OnInit, HostListener, Input, ViewChildren, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../services/modal.service';
import { ViewState } from '../view-enum';
import { CompleterService, CompleterData } from 'ng2-completer';
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

  private dataService: CompleterData;

  // category hash
  private categHash = {};
  // tag hash
  private locFilter = {};
  private locations = [];
  private dateFilter = {};
  private displayStartDate;
  private displayEndDate;
  private timeFilter = {};
  private displayStartTime;
  private displayEndTime;
  // dropdown toggle
  public showDropdown = false;
  public showModal = false;
  // calendar events
  public events = [];

  constructor(private _eventService: EventService, private _dateService: DateService, private modalService: ModalService) {}

  ngOnInit() {
    // whenever categories or tags are updated, update local variables
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.locFilter$.subscribe(locInfo => { this.locFilter = locInfo; });
    this._eventService.locations$.subscribe(locOptions => { this.locations = locOptions; });
    this._eventService.dateFilter$.subscribe(dateInfo => {
      this.dateFilter = dateInfo;
      this.displayStartDate = moment(dateInfo.start).format('YYYY-MM-DD');
      this.displayEndDate = moment(dateInfo.end).format('YYYY-MM-DD');
    });
    this._eventService.timeFilter$.subscribe(timeInfo => {
      this.timeFilter = timeInfo;
      this.displayStartTime = this._dateService.convertNumToTime(timeInfo.start);
      this.displayEndTime = this._dateService.convertNumToTime(timeInfo.end);
    });
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

  autofill() {
    let search = document.querySelector('#search');
    let results = document.querySelector('#searchresults');
    while (results.children.length) results.removeChild(results.firstChild);
    let inputVal = new RegExp((<HTMLInputElement>search).value.trim(), 'i');
    let set = Array.prototype.reduce.call(this.locations, function searchFilter(frag, item, i) {
      if (inputVal.test(item) && frag.children.length < 5){
        let option = document.createElement('option');
        let span = document.createElement('span');
        let abbrev = item.substring(0,35);
        if(abbrev != item) abbrev = abbrev + "...";
        span.innerHTML = item;
        option.value = item;
        option.appendChild(span);
        frag.appendChild(option);
      }
      return frag;
    }, document.createDocumentFragment());
    results.appendChild(set);
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
    let tag = timeInput;
    if(this.timeFilter.hasOwnProperty('tag') && this.timeFilter['tag'] == timeInput)
      tag = 'none';
    this._eventService.setTimeFilter(tag,tag,0,1439);
  }

  setCustomTimeFilter(startTime: string, endTime: string) {
    let starttime = startTime.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let endtime = endTime.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    let tag = this._dateService.convertTo12Hour(startTime)+" - "+this._dateService.convertTo12Hour(endTime.toLocaleString());
    this._eventService.setTimeFilter("Custom",tag,start,end);
  }

  openTimeModal() {
    if(this.timeFilter['tag'] != 'Custom') {
      this.displayStartTime = this._dateService.convertNumToTime(0);
      (<HTMLInputElement>document.getElementById('start-time')).value = this.displayStartTime;
      this.displayEndTime = this._dateService.convertNumToTime(1439);
      (<HTMLInputElement>document.getElementById('end-time')).value = this.displayEndTime;
      this.modalService.open('custom-modal-4');
    } else {
      this.setTimeFilter('none');
    }
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
    if (!this.wasInside) {
      //this.showDropdown = false;
    }
    this.wasInside = false;
  }

  // helper function for returning object keys
  private objectKeys(obj) {
    return Object.keys(obj);
  }

  openDateModal() {
    this.modalService.open('custom-modal-3');
  }

  openLocModal() {
    this.modalService.open('custom-modal-2');
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
