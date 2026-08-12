import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalFlowRuntimeStore } from './modal-flow-runtime.store';
import { getFlowDefinition, ModalFlowKey, StateOf, StepOf } from './modal.types';

@Injectable({
  providedIn: 'root',
})
export class ModalFlowLauncher {
  private readonly router = inject(Router);

  private readonly modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  async openFlow<K extends ModalFlowKey>(
    flow: K,
    state: StateOf<K>,
    step?: StepOf<K>,
  ): Promise<void> {
    const flowDefinition = getFlowDefinition(flow);

    if (!flowDefinition) {
      throw new Error(`Flow definition for ${flow} not found.`);
    }

    this.modalFlowRuntimeStore.startSession(flow, state);

    await this.router.navigate([this.router.url.split('?')[0]], {
      queryParams: {
        flow,
        step: step || flowDefinition.initialStep,
      },
      queryParamsHandling: 'replace',
    });
  }
}
