import { Component, OnInit } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
    selector: 'modal',
    template: `
        <div class="mmodal">
            <div class="mmodal-body">
                <ng-content></ng-content>
            </div>
        </div>
        <div class="mmodal-background"></div>
    `,
  styleUrls: ['./sidebar-popup.component.scss']
})
export class ModalComponent implements OnInit {
    constructor(private el: ElementRef) { }
    ngOnInit() {
        // we added this so that when the backdrop is clicked the modal is closed.
        this.el.nativeElement.addEventListener('click', ()=> {
            this.close()
        })
    }
    close() {
        this.el.nativeElement.classList.remove('sshow')
        this.el.nativeElement.classList.add('hhidden')
    }
}