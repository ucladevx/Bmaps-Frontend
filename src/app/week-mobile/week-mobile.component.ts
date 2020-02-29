import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-week-mobile',
    templateUrl: './week-mobile.component.html',
    styleUrls: ['./week-mobile.component.scss']
})

export class WeekMobileComponent implements OnInit {
	ngOnInit() {
		//do stuff
	}
}