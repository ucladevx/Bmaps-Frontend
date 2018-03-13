import { Component, OnInit } from '@angular/core';

import { CategoryService } from '../category.service';
import { EventService } from '../event.service';
import { FeatureCollection, GeoJson } from '../map';

@Component({
  selector: 'app-category-bar',
  templateUrl: './category-bar.component.html',
  styleUrls: ['./category-bar.component.css']
})
export class CategoryBarComponent implements OnInit {
  private categories: string[];
  private events: GeoJson[];
  private selectedCategory = "all categories";
  private categObjects = [];

  constructor(private categService: CategoryService, private eventService: EventService) { }

  ngOnInit() {
    this.resetCategories();
    this.eventService.currEvents$.subscribe(eventCollection => {
      this.events = eventCollection.features;
      this.updateCategories();
    });
  }

  private resetCategories(): void {
    this.categories = ["all"];
  }

  private updateCategories(): void {
    console.log("UPDATING CATEGORIES");
    this.categService.getCategories()
      .subscribe(categs => {
        this.resetCategories();
        for (let categ of categs.categories) {
          this.categories.push(categ.category.toLowerCase().replace('_', ' '));
        }
      });
    // Add bubble numbers using events object
  }

  filter(category: string): void {
    if (category === "all") this.selectedCategory = "all categories";
    else this.selectedCategory = category.toLowerCase();
    category = category.replace(' ', '_');
    this.eventService.filterEvents(category);
  }
}
