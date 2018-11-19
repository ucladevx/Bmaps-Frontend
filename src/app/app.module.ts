import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CategoryBarComponent } from './category-bar/category-bar.component';
import { CategoryService } from './category.service';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NavbarComponent } from './navbar/navbar.component';
import { EventService } from './event.service';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { CalendarComponent } from './calendar/calendar.component';
import { WeekComponent } from './week/week.component';

@NgModule({
  declarations: [
    AppComponent,
    MapBoxComponent,
    SidebarComponent,
    EventDetailComponent,
    CategoryBarComponent,
    DateSelectorComponent,
    NavbarComponent,
    CalendarComponent,
    WeekComponent
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
    ButtonsModule.forRoot()
  ],
  providers: [CategoryService, EventService],
  bootstrap: [AppComponent]
})
export class AppModule { }
