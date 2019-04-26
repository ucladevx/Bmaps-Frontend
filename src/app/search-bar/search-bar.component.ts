import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  constructor(private _eventService: EventService) { }

  ngOnInit() {
  }

  setUniversalFilter(){
    console.log('setUniversalFilter()')
    let uniInput = (<HTMLInputElement>document.getElementById('universal-search')).value;
    this._eventService.setUniversalSearch(uniInput);
  }

  getUni(){
    return this._eventService.getUniversalSearch();
  }
}
