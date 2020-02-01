import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MapBoxComponent } from './map-box.component';

@NgModule({
  declarations: [MapBoxComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: MapBoxComponent
    }])
  ]
})
export class MapBoxModule { }
