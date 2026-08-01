import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { MODAL_FLOWS, ModalFlowKey, modalFlowKeys, ModalFlowStepKey } from './modal.types';
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

  subscribeToRouteChanges() {
    return this.activatedRoute.queryParamMap
      .pipe(
        tap((queryParam) => {
          const flowParam = queryParam.get('flow') as ModalFlowKey;
          const stepParam = queryParam.get('step') as ModalFlowStepKey;

          const isFlowValid = modalFlowKeys.includes(flowParam);

          if (!flowParam || !isFlowValid) {
            const [path] = this.router.url.split('?');
            this.router.navigate([path], { queryParams: {} });

            return;
          }

          const flow = MODAL_FLOWS[flowParam];
          const step = flow.steps[stepParam] ?? flow.initialStep.component;
          const routeIntent = { flow, step, context: {} };

          if (flow.isProtected && !this.authStore.isAuthenticated()) {
            // First we set the route intent, so that when the user logs in, we can redirect them to the correct step
            this.modalStore.setModalRouteIntent(routeIntent);
            this.modalFlowRuntimeStore.applyRouteIntent(routeIntent);

            const redirectParams = encodeURIComponent(
              JSON.stringify({
                flow: flowParam,
                step: stepParam,
                context: {},
              }),
            );

            this.router.navigate([], {
              queryParams: {
                ...this.utilsService.buildFlowQueryParams(
                  ModalFlowKey.AUTH_OTP,
                  ModalFlowStepKey.AUTH_OTP_STEP_PHONE,
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
}
