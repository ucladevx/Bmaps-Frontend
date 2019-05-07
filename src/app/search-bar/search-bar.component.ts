import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../services/display.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  constructor(private _displayService: DisplayService) { }

  ngOnInit() {
  }

  setUniversalFilter(){
    let uniInput = (<HTMLInputElement>document.getElementById('universal-search')).value;
    this._displayService.setUniversalSearch(uniInput);
  }

  getUni(){
    return this._displayService.getUniversalSearch();
  }

  clearUni(){
    this._displayService.setUniversalSearch(null);
  }

}
