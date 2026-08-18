import { Component, DOCUMENT, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ModalFlowRuntimeStore } from './modal-flow-runtime.store';
import { ModalStore } from './modal.store';
import { NgComponentOutlet } from '@angular/common';
import { ModalContentStore } from './modal-content.store';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalStore } from '../../shared/ui/confirmation-modal/confirmation-modal.store';
import { WishlistEditorStore } from '../../features/wishlists/data/wishlist-editor.store';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  imports: [NgComponentOutlet],
})
export class ModalComponent implements OnInit {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  modalStore = inject(ModalStore);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  modalContentStore = inject(ModalContentStore);
  confirmationModalStore = inject(ConfirmationModalStore);
  wishlistEditorStore = inject(WishlistEditorStore);

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
      this.router.navigate([], { relativeTo: this.activatedRoute });
      this.modalStore.clearModalRouteIntent();
      this.modalFlowRuntimeStore.clearAllSessions();
      this.wishlistEditorStore.reset();
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
