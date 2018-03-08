import { Component, OnInit } from '@angular/core';


declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor() { }
  ngOnInit() {
  }

  toggleNav(){
      $('.navbar-toggler').slideToggle();
  }

}
