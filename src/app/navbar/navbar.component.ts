import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    @Output() changeView: EventEmitter<string> = new EventEmitter();

    constructor() { }
    ngOnInit() {
    }

    isCollapsed: boolean = true;

    collapsed(event: any): void {
        // console.log(event);
    }

    expanded(event: any): void {
        // console.log(event);
    }

    emitChangeView(newView: string): void {
      this.changeView.emit(newView);
    }

    public isFilterCollapsed: boolean = true;

    toggleMenuCollapse(): void {
      this.isCollapsed = !this.isCollapsed;
      this.isFilterCollapsed = true;
    }

    toggleFilterCollapse(): void {
      this.isFilterCollapsed = !this.isFilterCollapsed;
      this.isCollapsed = true;
    }

}
