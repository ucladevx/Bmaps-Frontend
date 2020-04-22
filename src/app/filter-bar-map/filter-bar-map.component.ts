import { Component, OnInit, HostListener, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FeatureCollection, GeoJson } from '../map';
import { DateService } from '../services/date.service'
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-filter-bar-map',
  templateUrl: './filter-bar-map.component.html',
  styleUrls: ['./filter-bar-map.component.scss']
})

export class FilterBarMapComponent implements OnInit {
  @Input() showToggleButton: boolean;
  private wasInside = false;

  // category hash
  private categHash = {};
  // filter tag hash
  private tagHash = {};
  // dropdown toggle
  public showDropdown = false;
  // day events
  private events = [];

  constructor(private _eventService: EventService, private _dateService: DateService) {}

  ngOnInit() {
    // whenever categories or tags are updated, update local variables
    this._eventService.categHash$.subscribe(categHash => { this.categHash = categHash; });
    this._eventService.tagHash$.subscribe(tagHash => { this.tagHash = tagHash; });
    // whenever day events change, update the local events variable
    this._eventService.dayEvents$.subscribe(events => { this.events = events; });
  }

  // behavior for filter or category click
  filterClicked(filter: string): void { this._eventService.toggleTag(filter); }
  categoryClicked(category: string): void { this._eventService.toggleCategory(category); }

  // dropdown toggle on/off
  toggleDropdown() { this.showDropdown = !this.showDropdown; }

  // clear filters and categories
  resetCategories(): void { this._eventService.clearCategories(); }
  clearFilters(): void { this._eventService.resetFilters(); }

  // click behavior
  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside)
      this.showDropdown = false;
    this.wasInside = false;
  }

  // helper function for returning object keys
  private objectKeys(obj) {
    return Object.keys(obj);
  }

}
