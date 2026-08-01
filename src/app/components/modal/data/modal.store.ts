import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RouteIntent } from './modal.types';

@Injectable({
  providedIn: 'root',
})
export class ModalStore {
  readonly isModalOpenSubject = new BehaviorSubject<boolean>(false);

  readonly modalRouteIntent = signal<RouteIntent | null>(null);

  readonly activeFlow = computed(() => this.modalRouteIntent()?.flow);
  readonly activeStep = computed(() => this.modalRouteIntent()?.step);
  readonly activeContext = computed(() => this.modalRouteIntent()?.context);

  constructor() {
    effect(() => {
      console.log('Modal Store:', this.activeFlow(), this.activeStep());
    });
  }

  setModalRouteIntent(intent: RouteIntent) {
    if (this.activeFlow()?.key === intent.flow.key) return;
    if (this.activeStep()?.key === intent.step.key)
      return this.modalRouteIntent.set({
        flow: intent.flow,
        step: intent.step,
        context: intent.context,
      });

    this.modalRouteIntent.set(intent);
  }

  clearModalRouteIntent() {
    this.modalRouteIntent.set(null);
  }

  openModal() {
    this.isModalOpenSubject.next(true);
  }

  closeModal() {
    this.isModalOpenSubject.next(false);
  }
}
