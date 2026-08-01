import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  getFlowDefinition,
  ModalFlowKey,
  ModalFlowSession,
  ModalFlowSessions,
  RouteIntent,
} from './modal.types';
import { ModalStore } from './modal.store';

@Injectable({
  providedIn: 'root',
})
export class ModalFlowRuntimeStore {
  modalStore = inject(ModalStore);

  private readonly _sessions = signal<ModalFlowSessions>({});
  readonly sessions = this._sessions.asReadonly();

  constructor() {
    effect(() => {});
  }

  getSession<K extends ModalFlowKey>(flow: K): ModalFlowSession<K> | undefined {
    return this._sessions()[flow];
  }

  startSession<K extends ModalFlowKey>(flow: K): ModalFlowSession<K> {
    const existingSession = this.getSession(flow);

    if (existingSession) {
      return existingSession;
    }

    const flowDefinition = getFlowDefinition(flow);

    const newSession: ModalFlowSession<K> = {
      flow,
      state: flowDefinition.createInitialState(),
    };

    this._sessions.update((sessions) => ({
      ...sessions,
      [flow]: newSession,
    }));

    return newSession;
  }

  clearSession(flowKey: ModalFlowKey) {
    this._sessions.update((sessions) => {
      const { [flowKey]: _, ...rest } = sessions;
      return rest;
    });
  }

  clearAllSessions() {
    this._sessions.set({});
  }

  applyRouteIntent(intent: RouteIntent) {
    if (intent.flow in this.sessions()) return;

    this.startSession(intent.flow);
  }
}
