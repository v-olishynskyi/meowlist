import { Component, inject, input } from '@angular/core';
import { ModalStore } from '../../data/modal.store';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  imports: [],
})
export class ModalBaseContainer {
  modalStore = inject(ModalStore);

  onClickBackButton = input<() => void>();

  closeModal() {
    this.modalStore.closeModal();
  }
}
