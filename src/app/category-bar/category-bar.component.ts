import { Component, OnInit, HostListener } from '@angular/core';

import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-category-bar',
  templateUrl: './category-bar.component.html',
  styleUrls: ['./category-bar.component.css']
})

export class CategoryBarComponent implements OnInit {
  private categories;
  private categHash = undefined;
  private filterHash = undefined;
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
  }

  categoryClicked(category: string): void {
    this.eventService.toggleCategory(category);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  clearCategories(): void {
    for (let key in this.categHash) {
      if (this.categHash[key].selected) {
        this.eventService.toggleCategory(key);
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
