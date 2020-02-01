import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { WeekComponent } from './week.component';

const routes: Routes = [
  { path: '', component: WeekComponent }
];

@NgModule({
  declarations: [WeekComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class WeekModule { }
