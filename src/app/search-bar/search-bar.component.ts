import { Component, OnInit } from '@angular/core';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  constructor(private _eventService: EventService, private _viewService: ViewService) { }

  ngOnInit() {}

  setUniversalFilter(){
    let uniInput = (<HTMLInputElement>document.getElementById('universal-search')).value;
    this._eventService.setUniversalSearch(uniInput);
  }

  getUni(){ return this._eventService.getUniversalSearch(); }
  clearUni(){ this._eventService.setUniversalSearch(null); }

}
