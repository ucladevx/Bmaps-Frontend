import { Component, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})

// @NgModule({
//   declarations: [AppComponent],
//   imports: [BrowserModule, GoogleMapsModule],
//   providers: [],
//   bootstrap: [AppComponent],
// })

export class GoogleMapsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
