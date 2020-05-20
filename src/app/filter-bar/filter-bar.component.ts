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
  private locFilter = {};
  private filterCount = 0;
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
  public isMap = false;
  public events = [];

  constructor(private _eventService: EventService, private _dateService: DateService, private modalService: ModalService) {}

  ngOnInit() {
    // whenever categories or tags are updated, update local variables
    this._eventService.filterCount$.subscribe(filterCount => { this.filterCount = filterCount; });
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.locFilter$.subscribe(locInfo => { this.locFilter = locInfo; });
    this._eventService.locations$.subscribe(locOptions => { this.locations = locOptions; });
    this._eventService.currentView$.subscribe(view => { this.isMap = (view == ViewState.map); });
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
        option.text = item;
        option.value = item;
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
    let tag = dateInput;
    if(this.dateFilter.hasOwnProperty('tag') && this.dateFilter['tag'] == dateInput)
      tag = 'none';
    let bounds = this._dateService.getViewBounds(this._eventService.getSelectedDate(), this._eventService.getCurrentView());
    let startDate = bounds.startDate;
    let endDate = bounds.endDate;
    switch(tag) {
      case 'Today':
        startDate = moment();
        endDate = moment();
        break;
      case 'Tomorrow':
        startDate = moment().add(1, 'd');
        endDate = startDate;
        break;
      case 'This Weekend':
        startDate = moment().endOf('week').startOf('day').add(-1, 'd');
        endDate = startDate.add(1, 'd');
        break;
      case 'This Week':
        startDate = moment().startOf('week').startOf('day');
        endDate = moment().endOf('week').startOf('day');
        break;
      case 'This Month':
        startDate = moment().startOf('month').startOf('day');
        endDate = moment().endOf('month').startOf('day');
        break;
    }
    this._eventService.setDateFilter(tag,tag,startDate.toDate(),endDate.toDate());
  }

  setCustomDateFilter(startDate: string, endDate: string) {
    let start = moment(startDate).toDate();
    let end = moment(endDate).toDate();
    if(this.isMap)
      end = moment(startDate).toDate();
    let tag = moment(start).format("MM/DD")+"-"+moment(end).format("MM/DD");
    if(moment(start).isSame(moment(end),'d'))
      tag = moment(start).format("MM/DD");
    this._eventService.setDateFilter("Custom",tag,start,end);
    this.closeModal('custom-modal-3');
  }

  openDateModal() {
    if(this.dateFilter['tag'] != 'Custom') {
      let bounds = this._dateService.getViewBounds(this._eventService.getSelectedDate(), this._eventService.getCurrentView());
      this.displayStartDate= bounds.startDate.format('YYYY-MM-DD');
      (<HTMLInputElement>document.getElementById('start-date')).value = this.displayStartDate;
      this.displayEndDate= bounds.endDate.format('YYYY-MM-DD');
      (<HTMLInputElement>document.getElementById('end-date')).value = this.displayEndDate;
      this.modalService.open('custom-modal-3');
      this.showModal = true;
    } else {
      this._eventService.resetDateFilter();
    }
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
    let tag = this._dateService.convertTo12Hour(startTime)+"-"+this._dateService.convertTo12Hour(endTime.toLocaleString());
    this._eventService.setTimeFilter("Custom",tag,start,end);
    this.closeModal('custom-modal-4');
  }

  openTimeModal() {
    if(this.timeFilter['tag'] != 'Custom') {
      this.displayStartTime = this._dateService.convertNumToTime(0);
      (<HTMLInputElement>document.getElementById('start-time')).value = this.displayStartTime;
      this.displayEndTime = this._dateService.convertNumToTime(1439);
      (<HTMLInputElement>document.getElementById('end-time')).value = this.displayEndTime;
      this.modalService.open('custom-modal-4');
      this.showModal = true;
    } else {
      this._eventService.resetTimeFilter();
    }
  }

  // update location filter
  setLocFilter(locInput: string){
    let tag = locInput;
    if(this.locFilter.hasOwnProperty('tag') && this.locFilter['tag'] == locInput)
      tag = 'none';
    this._eventService.setLocFilter(tag,tag,'');
  }
  setCustomLocFilter(locSearch: string){
    let abbrev = locSearch.substring(0,10);
    if(locSearch != abbrev) abbrev = abbrev+"...";
    this._eventService.setLocFilter('Custom', abbrev, locSearch);
    this.closeModal('custom-modal-2');
  }

  openLocModal() {
    if(this.locFilter['tag'] != 'Custom') {
      (<HTMLInputElement>document.getElementById('search')).value = '';
      this.modalService.open('custom-modal-2');
      this.showModal = true;
    } else {
      this._eventService.resetLocFilter();
    }
  }


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
    if (this.showDropdown && !this.wasInside && !document.body.classList.contains('jw-modal-open')) {
      this.showDropdown = false;
    }
    this.wasInside = false;
  }

  // helper function for returning object keys
  private objectKeys(obj) {
    let keys = [];
    Object.keys(obj).forEach(k => {
      if(k != 'all') keys.push(k);
    });
    return keys;
  }

  closeModal(id: string) {
    this.modalService.close(id);
    let _this = this;
    setTimeout(function(){
      document.getElementById('toggle-btn').click();
    }, 0.1);
  }

}
