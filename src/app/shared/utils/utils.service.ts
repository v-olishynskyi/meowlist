import { Injectable } from '@angular/core';
import {
  AuthOtpStepKey,
  EditWishListStepKey,
  ModalFlowKey,
  NewWishlistStepKey,
  RouteIntent,
  StepOf,
} from '../../core/modal/modal.types';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  ModalFlowKey = ModalFlowKey;

  buildFlowQueryParams = <K extends ModalFlowKey>(flow: K, step?: StepOf<K>): RouteIntent => {
    switch (flow) {
      case ModalFlowKey.AUTH_OTP:
        return {
          flow: ModalFlowKey.AUTH_OTP,
          step: (step as StepOf<ModalFlowKey.AUTH_OTP>) ?? AuthOtpStepKey.PHONE,
        };
      case ModalFlowKey.NEW_WISHLIST:
        return {
          flow: ModalFlowKey.NEW_WISHLIST,
          step: (step as StepOf<ModalFlowKey.NEW_WISHLIST>) ?? NewWishlistStepKey.EVENT,
        };

      case ModalFlowKey.EDIT_WISHLIST:
        return {
          flow: ModalFlowKey.EDIT_WISHLIST,
          step: (step as StepOf<ModalFlowKey.EDIT_WISHLIST>) ?? EditWishListStepKey.EVENT,
        };
    }
  };

  isKeyOf = <T extends object>(
    value: PropertyKey | null | undefined,
    object: T,
  ): value is keyof T => {
    return value !== null && value !== undefined && value in object;
  };
}
