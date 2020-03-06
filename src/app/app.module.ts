import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './router-strategy';
import { SharedModule } from './shared.module';

import { AppComponent } from './app.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CategoryBarMapComponent } from './category-bar-map/category-bar-map.component';
import { CategoryBarCalendarComponent } from './category-bar-calendar/category-bar-calendar.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewService } from './services/view.service';
import { EventService } from './services/event.service';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MonthComponent } from './month/month.component';
import { WeekComponent } from './week/week.component';
import { CalendarContainerComponent } from './calendar-container/calendar-container.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ModalComponent } from './sidebar-popup/sidebar-popup.component';


const appRoutes: Routes = [
  { path: 'map', component: MapBoxComponent },
  { path: 'calendar',
    component: CalendarContainerComponent,
    children: [
      {path: 'month', component: MonthComponent},
      {path: 'week', component: WeekComponent}
    ]
  },
  { path: 'list', outlet: 'sidebar', component: SidebarComponent },
  { path: 'detail/:id', outlet: 'sidebar', component: EventDetailComponent },
  { path: '**', redirectTo: '/map(sidebar:list)', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    MapBoxComponent,
    SidebarComponent,
    EventDetailComponent,
    CategoryBarMapComponent,
    CategoryBarCalendarComponent,
    DateSelectorComponent,
    NavbarComponent,
    MonthComponent,
    WeekComponent,
    CalendarContainerComponent,
    SearchBarComponent,
    ModalComponent
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
    ServiceWorkerModule.register('../ngsw-worker.js', {enabled: environment.production}),
    ButtonsModule.forRoot(),
    RouterModule.forRoot(appRoutes, {useHash: true}),
  ],
  providers: [
    ViewService,
    EventService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
