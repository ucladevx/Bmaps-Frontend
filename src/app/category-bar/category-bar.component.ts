import { Component, OnInit } from '@angular/core';

import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-bar',
  templateUrl: './category-bar.component.html',
  styleUrls: ['./category-bar.component.css']
})
export class CategoryBarComponent implements OnInit {
  categories: string[];

  constructor(private categService: CategoryService) { }

  ngOnInit() {
    this.categories = [];
    this.getCategories();
  }

  getCategories(): void {
    this.categService.getCategories()
      .subscribe(categs => {
        for (let categ of categs.categories) {
          this.categories.push(categ.category);
        }
      });
  }
}
