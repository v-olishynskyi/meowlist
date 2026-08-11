import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilsService } from '../../shared/utils/utils.service';
import { ModalFlowKey } from '../../core/modal/modal.types';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [RouterLink],
})
export class HomePage implements OnInit {
  ModalFlowKey = ModalFlowKey;
  utilsService = inject(UtilsService);
  scroller = inject(ViewportScroller);

  ngOnInit() {
    this.scroller.scrollToPosition([0, 0]);
  }
}
