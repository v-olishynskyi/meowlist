import {
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ModalActionsComponent } from '../modal/components/modal-actions.component';
import { ConfirmationModalStore } from './confirmation-modal.store';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent implements OnInit {
  confirmationModalStore = inject(ConfirmationModalStore);
  modalOptions = this.confirmationModalStore.modalOptions;
  isOpen = this.confirmationModalStore.isOpen;
  isConfirming = this.confirmationModalStore.isConfirming;

  modalRef = viewChild<ElementRef<HTMLDialogElement>>('confirmationModal');
  document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const modalEl = this.modalRef()?.nativeElement;
      if (modalEl) {
        if (this.isOpen() && !modalEl.open) {
          modalEl.showModal();
        } else {
          modalEl.close();
        }
      }
    });
  }

  ngOnInit() {
    const modalEl = this.modalRef()?.nativeElement;
    if (!modalEl) return;

    modalEl.addEventListener('close', () => {
      this.confirmationModalStore.clear();
    });

    modalEl.addEventListener('cancel', (event) => {
      console.log('Confirmation modal canceled');
      this.confirmationModalStore.close();
    });
  }

  onBackdropClick(event: MouseEvent) {
    const modalEl = this.modalRef()?.nativeElement;
    if (modalEl && event.target === modalEl) {
      this.confirmationModalStore.close();
    }
  }
}
