import { Component, OnInit, HostListener, Input } from '@angular/core';

import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';

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

  constructor(private categService: CategoryService, private eventService: EventService) {}

  ngOnInit() {
    this.eventService.currEvents$.subscribe(eventCollection => {
      this.events = eventCollection.features;
    });
    this.eventService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
    this.eventService.filterHash$.subscribe(filterHash => {
      this.filterHash = filterHash;
    });
  }

  filterClicked(filter: string): void {
    this.eventService.toggleFilter(filter);
    console.log(this.filterHash);
  }

  categoryClicked(): void {
    var category = (<HTMLInputElement>document.getElementById("categories")).value;
    console.log(category);
    this.eventService.toggleCategory(category);
    console.log(this.categHash);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.eventService.updateCategories();
  }

  clearCategories(): void {
    for (let key in this.categHash) {
      if (this.categHash[key].selected) {
        this.eventService.toggleCategory(key);
      }
    }
  }

  clearFilters(): void {
    for (let key in this.filterHash) {
      if (this.filterHash[key]) {
        this.eventService.toggleFilter(key);
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
