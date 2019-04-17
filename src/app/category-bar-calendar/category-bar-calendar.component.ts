import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-category-bar-calendar',
  templateUrl: './category-bar-calendar.component.html',
  styleUrls: ['./category-bar-calendar.component.css']
})

export class CategoryBarCalendarComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = {};
  private filterHash = {};
  private events: GeoJson[];
  public selectedCategory = 'all categories';
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
    this._calendarService.dateSpan$.subscribe(clear => {
        this.clearCategories();
    });
  }

  filterClicked(filter: string): void {
    this._eventService.toggleFilter(filter);
  }

  categoryClicked(): void {
    var category = (<HTMLInputElement>document.getElementById("categories")).value;
    this._eventService.toggleCategory(category);
    this._categService.setSelectedCategory(category);
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
