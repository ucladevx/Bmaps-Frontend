import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MonthComponent } from './month.component';

@NgModule({
  declarations: [MonthComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: MonthComponent
    }])
  ]
})
export class MonthModule { }
