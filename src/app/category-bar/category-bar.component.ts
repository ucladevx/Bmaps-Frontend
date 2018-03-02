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
    this.categories = ["all"];
  }

  getCategories(events): void {
    this.categService.getCategories()
      .subscribe(categs => {
        for (let categ of categs.categories) {
          this.categories.push(categ.category.toLowerCase());
        }
      });
    // Add bubble numbers using events object
  }

  filter(category: string): void {
    this.onCategorySelect.emit(category);
  }
}
