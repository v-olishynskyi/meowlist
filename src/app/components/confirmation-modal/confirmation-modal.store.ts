import { Injectable, signal } from '@angular/core';

type ConfirmationModalOptions = {
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onConfirm: () => Promise<void>;
};

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalStore {
  isOpen = signal(false);

  modalOptions = signal<ConfirmationModalOptions | null>(null);
  isConfirming = signal(false);

  open({
    title,
    message,
    cancelButtonText,
    confirmButtonText,
    onConfirm,
  }: ConfirmationModalOptions) {
    this.modalOptions.set({
      title,
      message,
      cancelButtonText,
      confirmButtonText,
      onConfirm,
    });
    this.isOpen.set(true);
  }

  async confirm() {
    this.isConfirming.set(true);
    await this.modalOptions()?.onConfirm();
    this.isConfirming.set(false);
    this.close();
  }

  close() {
    this.isOpen.set(false);
    this.clear();
  }

  clear() {
    this.modalOptions.set(null);
  }
}
