import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GeoJson, FeatureCollection } from './map';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  title = 'mappening';

  constructor(){}

  public pressed: boolean;
  public pressed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.pressed$.subscribe(pressed => this.pressed = pressed);
  }

  onPress(): void {
      this.pressed$.next(!this.pressed);
  }

  onSidebarRouterActivate(component: any): void {
    if (component instanceof SidebarComponent) {
      component.onPress = () => this.onPress();
      component.pressed$ = this.pressed$.asObservable();
    }
  }

}
