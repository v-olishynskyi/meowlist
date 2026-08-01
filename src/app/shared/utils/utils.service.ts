import { Injectable } from '@angular/core';
import { ModalFlowKey, ModalFlowStepKey } from '../../components/modal/data/modal.types';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  ModalFlowKey = ModalFlowKey;
  ModalFlowStepKey = ModalFlowStepKey;

  buildFlowQueryParams = (
    flow: ModalFlowKey,
    step: ModalFlowStepKey,
    context: Record<string, any> = {},
  ): Params => {
    switch (flow) {
      case ModalFlowKey.AUTH_OTP:
        return { flow: ModalFlowKey.AUTH_OTP, step, context };
      case ModalFlowKey.NEW_WISHLIST:
        return { flow: ModalFlowKey.NEW_WISHLIST, step, context };
      default:
        return {};
    }
  };
}
