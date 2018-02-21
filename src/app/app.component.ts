import { Component } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { MapService } from './map.service';
import { GeoJson, FeatureCollection } from './map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public mapEvents: FeatureCollection;

  constructor(){}
}
