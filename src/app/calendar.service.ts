import { Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }

  delta : Number = 0;

  @Output() change: EventEmitter<Number> = new EventEmitter();

  changeDateSpan(delta : Number) {
    this.delta = delta;
    this.change.emit(this.delta);
    this.delta = 0;
  }
}
