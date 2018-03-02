import { Component, OnInit, EventEmitter, Output} from '@angular/core';

import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-bar',
  templateUrl: './category-bar.component.html',
  styleUrls: ['./category-bar.component.css']
})
export class CategoryBarComponent implements OnInit {
  categories: string[];
  @Output() onCategorySelect = new EventEmitter<string>();

  constructor(private categService: CategoryService) { }

  ngOnInit() {
    this.categories = [];
  }

  getCategories(events): void {
    this.categService.getCategories()
      .subscribe(categs => {
        for (let categ of categs.categories) {
          this.categories.push(categ.category);
        }
      });
    // Add bubble numbers using events
    console.log("in here");
    console.log(events);
  }

  filter(category: string): void {
    this.onCategorySelect.emit(category);
  }
}
