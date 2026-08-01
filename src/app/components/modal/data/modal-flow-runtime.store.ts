import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { RouteIntent } from './modal.types';
import { ModalStore } from './modal.store';

@Injectable({
  providedIn: 'root',
})
export class ModalFlowRuntimeStore {
  modalStore = inject(ModalStore);

  sessions = signal<Record<string, unknown>>({});

  readonly activeFlowSession = computed(
    () => this.sessions()[this.modalStore.activeFlow()?.key] ?? null,
  );

  constructor() {
    effect(() => {
      console.log('Active Flow Session:', this.activeFlowSession());
      console.log('Sessions:', this.sessions());
    });
  }

  initializeFlowSession(flow: any, step: any, context: Record<string, unknown> = {}) {}

  startSession(intent: RouteIntent) {
    this.sessions.update((sessions) => ({
      ...sessions,
      [intent.flow.key]: {
        flow: intent.flow,
        step: intent.step,
        context: intent.context ?? {},
      },
    }));
  }

  clearSession(flowKey: string) {
    this.sessions.update((sessions) => {
      const { [flowKey]: _, ...rest } = sessions;
      return rest;
    });
  }

  clearAllSessions() {
    this.sessions.set({});
  }

  applyRouteIntent(intent: RouteIntent) {
    if (intent.flow in this.sessions()) return;

    this.startSession(intent);
  }
}

// ModalFlowRuntimeStore
// ├── sessions
// ├── activeSession
// ├── applyRouteIntent()
// ├── initializeFlowSession()
// ├── activateStep()
// ├── pushSession()
// ├── popSession()
// └── clear()
