import { Component, OnInit } from '@angular/core';

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
  private events: GeoJson[];
  private selectedCategory = "all categories";

  constructor(private categService: CategoryService, private eventService: EventService) { }

  ngOnInit() {
    this.eventService.currEvents$.subscribe(eventCollection => {
      this.events = eventCollection.features;
      this.updateCategories();
    });
  }

  updateCategories(): void {
    console.log("UPDATING CATEGORIES");
    this.categService.getCategories()
      .subscribe(categs => {
        let eventMap = this.getEventMap();
        this.categories = [{
          category: "all",
          formattedCategory: "all",
          numEvents: eventMap["all"]
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
      if (eventMap[eventCateg] == undefined) {
        eventMap[eventCateg] = 1
      }
      else {
        eventMap[eventCateg]++;
      }
      total++;
    }
    eventMap['all'] = total;
    return eventMap;
  }

  filter(category: string): void {
    if (category === "all") this.selectedCategory = "all categories";
    else this.selectedCategory = category.toLowerCase();
    category = category.replace(' ', '_');
    this.eventService.filterEvents(category);
  }
}
