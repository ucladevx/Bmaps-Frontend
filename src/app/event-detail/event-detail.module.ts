import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventDetailComponent } from './event-detail.component';

const routes: Routes = [
  { path: '', component: EventDetailComponent }
];

@NgModule({
  declarations: [EventDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EventDetailModule { }
