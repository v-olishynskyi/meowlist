import { Type } from '@angular/core';
import { AddNewGiftModal } from '../../../features/modals/feature-modals/add-new-gift/add-new-gift.component';
import { AuthOtpModal } from '../../../features/modals/feature-modals/auth-otp/auth-otp.component';

export enum ModalAction {
  AUTH_OTP = 'auth-otp',
  NEW_WISHLIST = 'new-wishlist',
}

export enum ModalFlowKey {
  AUTH_OTP = 'auth-otp',
  NEW_WISHLIST = 'new-wishlist',
}

export enum ModalFlowStepKey {
  AUTH_OTP_STEP_PHONE = 'phone',
  NEW_WISHLIST_STEP_NEW_EVENT = 'create-event',
  NEW_WISHLIST_STEP_NEW_GIFT = 'create-gift',
}

export type StepDefinition = {
  key: ModalFlowStepKey;
  component: Type<unknown>;
};

export type ModalFlowDefinition<Key extends ModalFlowKey> = {
  key: Key;
  initialStep: StepDefinition;
  isProtected: boolean;
  // steps: Record<Step in ModalFlowStepMap[Key], StepDefinition>;
};

export const MODAL_FLOWS: Record<ModalFlowKey, any> = {
  [ModalFlowKey.AUTH_OTP]: {
    key: ModalFlowKey.AUTH_OTP,
    initialStep: {
      key: ModalFlowStepKey.AUTH_OTP_STEP_PHONE,
      component: AuthOtpModal,
    },
    isProtected: false,
    steps: {
      [ModalFlowStepKey.AUTH_OTP_STEP_PHONE]: {
        key: ModalFlowStepKey.AUTH_OTP_STEP_PHONE,
        component: AuthOtpModal,
      },
    },
  },
  [ModalFlowKey.NEW_WISHLIST]: {
    key: ModalFlowKey.NEW_WISHLIST,
    initialStep: {
      key: ModalFlowStepKey.NEW_WISHLIST_STEP_NEW_EVENT,
      component: AddNewGiftModal,
    },
    isProtected: true,
    steps: {
      [ModalFlowStepKey.NEW_WISHLIST_STEP_NEW_EVENT]: {
        component: AddNewGiftModal,
      },
      [ModalFlowStepKey.NEW_WISHLIST_STEP_NEW_GIFT]: {
        component: AddNewGiftModal,
      },
    },
  },
};

export const modalFlowKeys = Object.values(ModalFlowKey);

export type RouteIntent = {
  flow: any;
  step: any;
  context?: Record<string, unknown>;
};
