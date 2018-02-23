import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';

import { MapService } from './map.service';
import { AppComponent } from './app.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CategoryBarComponent } from './category-bar/category-bar.component';
import { CategoryService } from './category.service';

@NgModule({
  declarations: [
    AppComponent,
    MapBoxComponent,
    SidebarComponent,
    EventDetailComponent,
    CategoryBarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [MapService, CategoryService],
  bootstrap: [AppComponent]
})
export class AppModule { }
