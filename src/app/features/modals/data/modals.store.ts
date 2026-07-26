import { Component, computed, inject, Injectable, signal, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from './modals.service';
import { BehaviorSubject, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
})
export class ModalRouterStore {
  route = inject(ActivatedRoute);

  private _activeComponentSubject$ = new BehaviorSubject<ComponentType<unknown> | null>(null);
  private readonly _activeComponent$ = this._activeComponentSubject$.asObservable();
  private readonly _activeComponent = toSignal(this._activeComponent$);

  activeComponent = computed(() => this._activeComponent());

  changeActiveComponent(component: Type<any> | null) {
    this._activeComponentSubject$.next(component);
  }
}
