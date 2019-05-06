import { Component, OnInit, HostListener, Input } from '@angular/core';
import { DateService } from '../services/date.service'
import { DisplayService } from '../services/display.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-category-bar-map',
  templateUrl: './category-bar-map.component.html',
  styleUrls: ['./category-bar-map.component.css']
})

export class CategoryBarMapComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = undefined;
  private filterHash = undefined;
  public selectedCategory = 'all categories';
  public showDropdown = false;
  private wasInside = false;
  private events;

  constructor(private _displayService: DisplayService, private _dateService: DateService) {}

  ngOnInit() {
    this._displayService.categHash$.subscribe(categHash => {
      this.categHash = categHash;
    });
    this._displayService.buttonHash$.subscribe(filterHash => {
      this.filterHash = filterHash;
    });
    this._displayService.dayEvents$.subscribe(events => {
      this.events = events;
    });
  }

  filterClicked(filter: string): void {
    this._displayService.toggleFilterButton(filter);
  }

  categoryClicked(category: string): void {
    this._displayService.toggleCategory(category);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  clearCategories(): void {
    this._displayService.allCategories();
  }

  clearFilters(): void {
    for (let key in this.filterHash) {
      if (this.filterHash[key]) {
        this._displayService.toggleFilterButton(key);
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
