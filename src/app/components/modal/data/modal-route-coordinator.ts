import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import {
  AuthOtpStepKey,
  getFlowDefinition,
  getStepDefinition,
  MODAL_FLOWS,
  ModalFlowKey,
  RouteIntent,
  StepOf,
} from './modal.types';
import { ModalStore } from './modal.store';
import { AuthStore } from '../../../core/auth.store';
import { ModalFlowRuntimeStore } from './modal-flow-runtime.store';
import { UtilsService } from '../../../shared/utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class ModalRouteCoordinator {
  private utilsService = inject(UtilsService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private modalStore = inject(ModalStore);
  private modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  private authStore = inject(AuthStore);

  resolveRouteIntent(flowParam: string | null, stepParam: string | null): RouteIntent | null {
    switch (flowParam) {
      case ModalFlowKey.AUTH_OTP: {
        const flow = getFlowDefinition(ModalFlowKey.AUTH_OTP);

        const step = this.utilsService.isKeyOf(stepParam, flow.steps)
          ? stepParam
          : flow.initialStep;

        return {
          flow: ModalFlowKey.AUTH_OTP,
          step,
        };
      }
      case ModalFlowKey.NEW_WISHLIST: {
        const flow = getFlowDefinition(ModalFlowKey.NEW_WISHLIST);

        const step = this.utilsService.isKeyOf(stepParam, flow.steps)
          ? stepParam
          : flow.initialStep;

        return {
          flow: ModalFlowKey.NEW_WISHLIST,
          step,
        };
      }
      default:
        return null;
    }
  }

  subscribeToRouteChanges() {
    return this.activatedRoute.queryParamMap
      .pipe(
        tap((queryParam) => {
          console.log('here', this.router.url);
          const flowParam = queryParam.get('flow') as ModalFlowKey;
          const stepParam = queryParam.get('step') as StepOf<ModalFlowKey>;

          if (!flowParam) {
            this.modalStore.clearModalRouteIntent();
            return;
          }

          const isFlowValid = this.utilsService.isKeyOf(flowParam, MODAL_FLOWS);
          const routeIntent = this.resolveRouteIntent(flowParam, stepParam);

          if (!isFlowValid || !routeIntent) {
            this.clearModalQueryParams();

            return;
          }

          const flow = getFlowDefinition(routeIntent.flow);
          const step = getStepDefinition(routeIntent.flow, routeIntent.step);

          if (flow.isProtected && !this.authStore.isAuthenticated()) {
            // First we set the route intent, so that when the user logs in, we can redirect them to the correct step
            this.modalStore.setModalRouteIntent(routeIntent);
            this.modalFlowRuntimeStore.applyRouteIntent(routeIntent);

            const redirectParams = encodeURIComponent(JSON.stringify(routeIntent));

            this.router.navigate([], {
              queryParams: {
                ...this.utilsService.buildFlowQueryParams(
                  ModalFlowKey.AUTH_OTP,
                  AuthOtpStepKey.PHONE,
                ),
                redirectFlow: redirectParams,
              },
              queryParamsHandling: 'merge',
            });
            return;
          }

          this.modalStore.setModalRouteIntent(routeIntent);
          this.modalFlowRuntimeStore.applyRouteIntent(routeIntent);

          this.modalStore.openModal();
        }),
      )
      .subscribe();
  }

  private clearModalQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        flow: null,
        step: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
