import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';

import { AppComponent } from './app.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CategoryBarComponent } from './category-bar/category-bar.component';
import { CategoryService } from './category.service';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NavbarComponent } from './navbar/navbar.component';
import { EventService } from './event.service';
import { DateSelectorComponent } from './date-selector/date-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    MapBoxComponent,
    SidebarComponent,
    EventDetailComponent,
    CategoryBarComponent,
    DateSelectorComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    AngularFontAwesomeModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    IonicModule.forRoot(AppComponent),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent
  ],
  providers: [
    CategoryService,
    EventService,
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule { }
