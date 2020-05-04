import { Component, OnInit, HostListener, Input, ViewChildren, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeatureCollection, GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../services/modal.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

const HAPPENINGNOW_LEN = 1;
// how many hours from now does upcoming start? (inclusive)
const UPCOMING_START = 1;
// how many hours after UPCOMING_START does upcoming end? (inclusive)
const UPCOMING_LEN = 5;
// what time does morning start? (inclusive)
const MORNING_START = 4;
// what time does morning end? (exclusive)
const MORNING_END = 12;
// what time does afternoon start? (inclusive)
const AFTERNOON_START = 12;
// what time does afternoon end? (exclusive)
const AFTERNOON_END = 17;
// what time does evening start? (inclusive)
const EVENING_START = 17;
// what time does evening end? (exclusive)
const EVENING_END = 4;

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
    let start = 0;
    let end = 1439;
    if(this.timeFilter.hasOwnProperty('tag') && this.timeFilter['tag'] == timeInput)
      tag = 'none';
    else {
      switch(timeInput) {
        case 'Happening Now':
          start = this._dateService.convertTimeToNum(moment());
          end = this._dateService.convertTimeToNum(moment().add(HAPPENINGNOW_LEN, 'hours'));
          break;
        case 'Upcoming':
          start = this._dateService.convertTimeToNum(moment().add(UPCOMING_START, 'hours'));
          end = this._dateService.convertTimeToNum(moment().add(UPCOMING_START + UPCOMING_LEN, 'hours'));
          break;
        case 'Morning':
          start = MORNING_START;
          end = MORNING_END;
          break;
        case 'Afternoon':
          start = AFTERNOON_START;
          end = AFTERNOON_END;
          break;
        case 'Evening':
          start = EVENING_START;
          end = EVENING_END;
          break;
      }
    }
    this._eventService.setTimeFilter(tag,start,end);
  }

  setCustomTimeFilter(startTime: string, endTime: string) {
    /** let starttime = startTime.split(":");
    let start = parseInt(starttime[0])*60 + parseInt(starttime[1]);
    let endtime = endTime.split(":");
    let end = parseInt(endtime[0])*60 + parseInt(endtime[1]);
    this._eventService.setTimeFilter(start,end); **/
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
