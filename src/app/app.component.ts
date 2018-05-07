import { Component } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { CategoryService } from './category.service';
import { GeoJson, FeatureCollection } from './map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mappening';

  public mapEvents: FeatureCollection;

  constructor(private categService: CategoryService){}

  ngOnInit(): void {
    // this.categService.getCategories()
    //   .subscribe(categs => console.log(categs));
  }
  pressed = false;

  onPressed(pressed) {
      console.log("hello");
      this.pressed = !this.pressed;
  }
}
