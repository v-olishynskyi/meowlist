import { Injectable, signal } from '@angular/core';

type ToastData = {
  message: string;
  type: 'success' | 'error' | 'info';
};

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  currentToast = signal<ToastData | null>(null);

  showToast(toastData: ToastData, duration: number = 3000): void {
    this.currentToast.set(toastData);

    setTimeout(() => {
      this.currentToast.set(null);
    }, duration);
  }
}
