import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './router-strategy';
import { SharedModule } from './shared.module';

import { AppComponent } from './app.component';
import { CategoryBarMapComponent } from './category-bar-map/category-bar-map.component';
import { CategoryBarCalendarComponent } from './category-bar-calendar/category-bar-calendar.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { CalendarContainerComponent } from './calendar-container/calendar-container.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewService } from './services/view.service';
import { EventService } from './services/event.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { MapBoxModule } from './map-box/map-box.module';
import { MonthModule } from './month/month.module';
import { WeekModule } from './week/week.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { EventDetailModule } from './event-detail/event-detail.module';

const appRoutes: Routes = [
  { path: 'map', loadChildren: './map-box/map-box.module#MapModule' },
  { path: 'calendar',
    component: CalendarContainerComponent,
    children: [
      {path: 'month', loadChildren: './month/month.module#MonthModule' },
      {path: 'week', loadChildren: './week/week.module#WeekModule' }
    ]
  },
  { path: 'list', outlet: 'sidebar', loadChildren: './sidebar/sidebar.module#SidebarModule' },
  { path: 'detail/:id', outlet: 'sidebar', loadChildren: './event-detail/event-detail.module#EventDetailModule' },
  { path: '**', redirectTo: '/map(sidebar:list)', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    CategoryBarMapComponent,
    CategoryBarCalendarComponent,
    DateSelectorComponent,
    NavbarComponent,
    CalendarContainerComponent,
    SearchBarComponent
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
    MapBoxModule,
    MonthModule,
    WeekModule,
    SidebarModule,
    EventDetailModule
  ],
  providers: [
    ViewService,
    EventService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
