import { computed, inject, Service, Type } from '@angular/core';
import { ModalStore } from './modal.store';

export type ModalContent = Type<unknown> | null;

@Service()
export class ModalContentStore {
  private readonly modalStore = inject(ModalStore);

  modalContent = computed(() => {
    const step = this.modalStore.activeStep();
    const flow = this.modalStore.activeFlow();

    if (!flow) return null;

    const component = step?.component ?? flow[0]?.initialStep.component;

    return component;
  });
}
