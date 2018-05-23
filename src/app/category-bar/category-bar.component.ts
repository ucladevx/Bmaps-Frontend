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
  private events: GeoJson[];
  public selectedCategory = 'all categories';
  private showDropdown = false;
  private wasInside = false;
  private filters = ['happening now', 'upcoming', 'time period', 'on-campus', 'off-campus', 'nearby', 'popular', 'free food'];

  constructor(private categService: CategoryService, private eventService: EventService) {}

  ngOnInit() {
    this.eventService.currEvents$.subscribe(eventCollection => {
      this.events = eventCollection.features;
      // this.updateCategories();
    });
    this.eventService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
  }

  updateCategories(): void {
    console.log('UPDATING CATEGORIES');
    this.categService.getCategories()
      .subscribe(categs => {
        let eventMap = this.getEventMap();
        this.categories = [{
          category: 'all',
          formattedCategory: 'all',
          numEvents: eventMap['all']
        }];
        for (let categ of categs.categories) {
          let categName = categ.category.toLowerCase();
          let formattedCategName = categName.replace('_', ' ');
          let categObject = {
            category: categName,
            formattedCategory: formattedCategName,
            numEvents: eventMap[categName]
          };
          this.categories.push(categObject);
        }
      });
  }

  private getEventMap() {
    let eventMap = {};
    let total = 0;
    for (let event of this.events) {
      let eventCateg: string = event.properties.category.toLowerCase();
      if (eventMap[eventCateg] === undefined) {
        eventMap[eventCateg] = 1;
      } else {
        eventMap[eventCateg]++;
      }
      total++;
    }
    eventMap['all'] = total;
    return eventMap;
  }

  filter(category: string): void {
    if (category === 'all') this.selectedCategory = 'all categories';
    else this.selectedCategory = category.toLowerCase().replace('_', ' ');
    category = category.replace(' ', '_');
    this.eventService.filterEvents(category);
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
