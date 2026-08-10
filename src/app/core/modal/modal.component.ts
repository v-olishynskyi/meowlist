import { Component, DOCUMENT, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ModalFlowRuntimeStore } from './modal-flow-runtime.store';
import { ModalStore } from './modal.store';
import { NgComponentOutlet } from '@angular/common';
import { ModalContentStore } from './modal-content.store';
import { Router } from '@angular/router';
import { ConfirmationModalStore } from '../../shared/ui/confirmation-modal/confirmation-modal.store';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  imports: [NgComponentOutlet],
})
export class ModalComponent implements OnInit {
  router = inject(Router);
  modalStore = inject(ModalStore);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  modalContentStore = inject(ModalContentStore);
  confirmationModalStore = inject(ConfirmationModalStore);

  private document = inject(DOCUMENT);

  private modalDialog = viewChild<ElementRef<HTMLDialogElement>>('modalElement');

  constructor() {
    this.modalStore.isModalOpenSubject.subscribe((isOpen) => {
      const modalEl = this.modalDialog()?.nativeElement;
      const body = this.document.body;

      if (!modalEl) return;

      if (isOpen) {
        if (!modalEl.open) modalEl.showModal();
        body.style.setProperty('overflow', 'hidden');
        body.style.setProperty('touch-action', 'none');
        body.style.setProperty('-webkit-overflow-scrolling', 'auto');
      } else {
        if (modalEl.open) modalEl.close();
        body.style.removeProperty('overflow');
        body.style.removeProperty('touch-action');
        body.style.removeProperty('-webkit-overflow-scrolling');
      }
    });
  }

  ngOnInit() {
    const modalEl = this.modalDialog()?.nativeElement;

    if (!modalEl) return;

    modalEl.addEventListener('close', () => {
      // TODO:
      this.router.navigateByUrl(this.router.url.split('?')[0]);
      this.modalStore.clearModalRouteIntent();
      this.modalFlowRuntimeStore.clearAllSessions();
    });

    modalEl.addEventListener('cancel', (event) => {
      this.confirmationModalStore.open({
        title: 'Підтвердження',
        message:
          'Ви впевнені, що хочете закрити модальне вікно? Всі незбережені дані будуть втрачені.',
        cancelButtonText: 'Скасувати',
        confirmButtonText: 'Закрити',
        onConfirm: async () => {
          this.modalStore.closeModal();
        },
      });
      event.preventDefault();
    });
  }

  onBackdropClick(event: MouseEvent) {
    const modalEl = this.modalDialog()?.nativeElement;

    if (!modalEl) return;

    const rect = modalEl.getBoundingClientRect();

    const isInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInDialog) {
      this.modalStore.closeModal();
    }
  }
}
