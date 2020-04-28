import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CustomReuseStrategy } from './router-strategy';
import { SharedModule } from './shared.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { EventService } from './services/event.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { CalendarContainerComponent } from './calendar-container/calendar-container.component';
import { MonthComponent } from './month/month.component';
import { WeekComponent } from './week/week.component';
import { ThreeDayComponent } from './three-day/three-day.component';
import { FilterBarMapComponent } from './filter-bar-map/filter-bar-map.component';
import { FilterBarCalendarComponent } from './filter-bar-calendar/filter-bar-calendar.component';
import { ModalComponent } from './modal/modal.component';

const appRoutes: Routes = [
  { path: 'map', component: MapBoxComponent  },
  { path: 'calendar',
    component: CalendarContainerComponent,
    children: [
      {path: 'month', component: MonthComponent},
      {path: 'week', component: WeekComponent},
      {path: 'three-day', component: ThreeDayComponent}
    ]
  },
  { path: 'list', outlet: 'sidebar', component: SidebarComponent },
  { path: 'detail/:id', outlet: 'sidebar', component: EventDetailComponent },
  { path: '**', redirectTo: '/map(sidebar:list)', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    EventDetailComponent,
    DateSelectorComponent,
    MapBoxComponent,
    CalendarContainerComponent,
    MonthComponent,
    WeekComponent,
    ThreeDayComponent,
    FilterBarMapComponent,
    FilterBarCalendarComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    RouterModule.forRoot(appRoutes, {useHash: true}),
    HammerModule,
    ServiceWorkerModule.register('../ngsw-worker.js', {enabled: environment.production}),
    // AngularFontAwesomeModule
  ],
  providers: [
    EventService,
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
