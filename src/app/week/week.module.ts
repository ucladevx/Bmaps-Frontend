import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WeekComponent } from './week.component';

@NgModule({
  declarations: [WeekComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: WeekComponent
    }])
  ]
})
export class WeekModule { }
