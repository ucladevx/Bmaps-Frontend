import { Component, OnInit, HostListener, Input } from '@angular/core';
import { DateService } from '../services/date.service'
import { EventService } from '../services/event.service';
import { FeatureCollection, GeoJson } from '../map';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-filter-bar-map',
  templateUrl: './filter-bar-map.component.html',
  styleUrls: ['./filter-bar-map.component.scss']
})

export class FilterBarMapComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private categHash = undefined;
  private filterHash = undefined;
  public selectedCategory = 'all categories';
  public showDropdown = false;
  private wasInside = false;
  private events = [];

  constructor(private _eventService: EventService, private _dateService: DateService) {}

  ngOnInit() {
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.tagHash$.subscribe(filterHash => { this.filterHash = filterHash; });
    this._eventService.dayEvents$.subscribe(events => { this.events = events; });
  }

  filterClicked(filter: string): void { this._eventService.toggleTag(filter); }
  categoryClicked(category: string): void { this._eventService.toggleCategory(category); }

  toggleDropdown() { this.showDropdown = !this.showDropdown; }
  clearCategories(): void { this._eventService.allCategories(); }

  clearFilters(): void {
    for (let key in this.filterHash)
      if (this.filterHash[key])
        this._eventService.toggleTag(key);
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
