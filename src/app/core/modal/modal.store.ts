import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getFlowDefinition, getStepDefinition, RouteIntent } from './modal.types';

@Injectable({
  providedIn: 'root',
})
export class ModalStore {
  readonly isModalOpenSubject = new BehaviorSubject<boolean>(false);

  readonly modalRouteIntent = signal<RouteIntent | null>(null);

  readonly activeFlow = computed(() =>
    this.modalRouteIntent() ? getFlowDefinition(this.modalRouteIntent()!.flow) : null,
  );
  readonly activeStep = computed(() =>
    this.modalRouteIntent()
      ? getStepDefinition(this.modalRouteIntent()!.flow, this.modalRouteIntent()!.step)
      : null,
  );

  constructor() {
    effect(() => {
      console.log('Modal Store:', this.modalRouteIntent(), this.activeFlow(), this.activeStep());
    });
  }

  setModalRouteIntent(intent: RouteIntent) {
    this.modalRouteIntent.update(() => intent);
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
