import { computed, inject, Service, Type } from '@angular/core';
import { ModalStore } from './modal.store';

export type ModalContent = Type<unknown> | null;

@Service()
export class ModalContentStore {
  private readonly modalStore = inject(ModalStore);

  modalContent = computed(() => {
    const flow = this.modalStore.activeFlow();
    const step = this.modalStore.activeStep();

    if (!flow) return null;

    const component = step!.component;

    return component;
  });
}
