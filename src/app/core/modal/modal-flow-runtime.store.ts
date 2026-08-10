import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  FlowState,
  getFlowDefinition,
  ModalFlowKey,
  ModalFlowSession,
  ModalFlowSessions,
  RouteIntent,
  StateOf,
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
    effect(() => {
      console.log('ModalFlowRuntimeStore sessions changed:', this._sessions());
    });
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

    const newSession = new ModalFlowSession<K>(flow, flowDefinition.createInitialState());

    this._sessions.update((sessions) => ({
      ...sessions,
      [flow]: newSession,
    }));

    return newSession;
  }

  updateSessionState<K extends ModalFlowKey>(
    flow: K,
    updater: (state: StateOf<K>) => StateOf<K>,
  ): void {
    const session = this.getSession(flow);

    if (!session) {
      throw new Error(`No session found for flow: ${flow}`);
    }

    const updatedState = session.updateState(updater);

    this._sessions.update((sessions) => ({
      ...sessions,
      [flow]: updatedState,
    }));
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
