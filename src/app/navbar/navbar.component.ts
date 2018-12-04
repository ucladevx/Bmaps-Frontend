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
    public isFilterCollapsed: boolean = true;

    toggleMenuCollapse(): void {
      this.isCollapsed = !this.isCollapsed;
      this.isFilterCollapsed = true;
    }

    toggleFilterCollapse(): void {
      this.isFilterCollapsed = !this.isFilterCollapsed;
      this.isCollapsed = true;
    }

    emitChangeView(newView: string): void {
      this.changeView.emit(newView);
    }
}
