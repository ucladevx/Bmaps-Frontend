import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './router-strategy';
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
import { NavbarComponent } from './navbar/navbar.component';
import { EventService } from './event.service';
import { DateSelectorComponent } from './date-selector/date-selector.component';

const appRoutes: Routes = [
  { path: 'map', component: MapBoxComponent },
  //{ path: 'calendar', component: CalendarComponent },
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
    RouterModule.forRoot(appRoutes, {useHash: true}),
  ],
  providers: [
    CategoryService,
    EventService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
