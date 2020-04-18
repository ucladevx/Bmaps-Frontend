/*This shared module when imported by the app.module.ts provides all
its service as SINGLETONS since its at the root making it the
suggested place for utils and global varibles. At least that is what
I gathered from https://angular.io/guide/singleton-services. Apparently
will need to figure out forRoot if we have both declarations and providers*/

//TODO: Actually check DateService is a singleton

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateService } from './services/date.service';
import { LocationService } from './services/location.service'

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [DateService, LocationService]
})

export class SharedModule { }
