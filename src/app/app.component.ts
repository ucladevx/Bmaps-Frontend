import { Component } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { CategoryService } from './category.service';
import { GeoJson, FeatureCollection } from './map';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'mappening';

  public mapEvents: FeatureCollection;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private categService: CategoryService) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

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
