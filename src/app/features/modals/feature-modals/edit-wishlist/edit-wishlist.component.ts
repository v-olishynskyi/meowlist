import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { ModalFlowKey } from '../../../../components/modal/data/modal.types';
import { ModalActionsComponent } from '../../../../components/modal/components/modal-actions.component';
@Component({
  selector: 'app-edit-wishlist',
  templateUrl: './edit-wishlist.component.html',
  imports: [DecimalPipe, DatePipe, ModalActionsComponent],
})
export class EditWishlistModal {
  router = inject(Router);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  event = this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST)?.state.event;

  gifts = this.modalFlowRuntimeStore.getSession(ModalFlowKey.NEW_WISHLIST)?.state.gifts || [];

  addGift() {
    this.router.navigate([], {
      queryParams: {
        flow: 'new-wishlist',
        step: 'add-gift',
      },
    });
  }

  removeGift(giftId: string) {
    this.modalFlowRuntimeStore.updateSessionState(ModalFlowKey.NEW_WISHLIST, (state) => ({
      ...state,
      gifts: state.gifts.filter((gift) => gift.id !== giftId),
    }));
  }
}
