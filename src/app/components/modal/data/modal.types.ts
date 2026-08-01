import { Type } from '@angular/core';
import { AddNewGiftModal } from '../../../features/modals/feature-modals/add-new-gift/add-new-gift.component';
import { AuthOtpModal } from '../../../features/modals/feature-modals/auth-otp/auth-otp.component';
import { NewEventModal } from '../../../features/modals/feature-modals/new-event/new-event.component';
import { EditWishlistModal } from '../../../features/modals/feature-modals/edit-wishlist/edit-wishlist.component';

class FlowState<T> {
  constructor(readonly state: T) {
    return this;
  }
}

// FLOW KEYS
export enum ModalFlowKey {
  AUTH_OTP = 'auth-otp',
  NEW_WISHLIST = 'new-wishlist',
}

// FLOW STEP KEYS
export enum AuthOtpStepKey {
  PHONE = 'phone',
}

export enum NewWishlistStepKey {
  EVENT = 'create-event',
  EDIT_WISHLIST = 'edit-wishlist',
  ADD_GIFT = 'add-gift',
  EDIT_GIFT = 'edit-gift',
  REMOVE_GIFT = 'remove-gift',
}

export enum ViewWishlistStepKey {}

// FLOW STATE
export type AuthOtpFlowState = {
  phoneNumber: string | null;
};

export type NewWishlistFlowState = {
  event: NewWishlistEventDraft;
  gifts: GiftDraft[];
};

export type NewWishlistEventDraft = {
  name: string;
  description: string | null;
  date: string | null;
  location: string | null;
  coverImage: string | null;
};

export type GiftDraft = {
  id: string;
  name: string;
  description: string | null;
  link: string | null;
  price: number | null;
  imageUrl: string | null;
};

export type ModalFlowSpecMap = {
  [ModalFlowKey.AUTH_OTP]: {
    step: AuthOtpStepKey;
  } & FlowState<AuthOtpFlowState>;

  [ModalFlowKey.NEW_WISHLIST]: {
    step: NewWishlistStepKey;
  } & FlowState<NewWishlistFlowState>;
};

export type StepOf<K extends ModalFlowKey> = ModalFlowSpecMap[K]['step'];
export type StateOf<K extends ModalFlowKey> = FlowState<ModalFlowSpecMap[K]['state']>;

export type ModalStepDefinition = {
  component: Type<unknown>;
};

export type ModalFlowDefinition<Key extends ModalFlowKey> = {
  key: Key;
  isProtected: boolean;

  initialStep: StepOf<Key>;

  createInitialState: () => StateOf<Key>;

  steps: {
    [Step in StepOf<Key>]: ModalStepDefinition;
  };
};

export type ModalFlowSession<Key extends ModalFlowKey> = {
  readonly flow: Key;
  state: StateOf<Key>;
};

export type ModalFlowDefinitions = {
  [K in ModalFlowKey]: ModalFlowDefinition<K>;
};

export type AuthSession = ModalFlowSession<ModalFlowKey.AUTH_OTP>;
export type NewWishlistSession = ModalFlowSession<ModalFlowKey.NEW_WISHLIST>;

export type AnyModalFlowSession = {
  [Key in ModalFlowKey]: ModalFlowSession<Key>;
}[ModalFlowKey];

export type ModalFlowSessions = Partial<{
  [K in ModalFlowKey]: ModalFlowSession<K>;
}>;

export function defineModalFlow<K extends ModalFlowKey>(
  definition: ModalFlowDefinition<K>,
): ModalFlowDefinition<K> {
  return definition;
}

export const MODAL_FLOWS = {
  [ModalFlowKey.AUTH_OTP]: defineModalFlow<ModalFlowKey.AUTH_OTP>({
    key: ModalFlowKey.AUTH_OTP,
    isProtected: false,
    initialStep: AuthOtpStepKey.PHONE,
    steps: {
      [AuthOtpStepKey.PHONE]: {
        component: AuthOtpModal,
      },
    },
    createInitialState: (): FlowState<AuthOtpFlowState> =>
      new FlowState({
        phoneNumber: null,
      }),
  }),

  [ModalFlowKey.NEW_WISHLIST]: defineModalFlow<ModalFlowKey.NEW_WISHLIST>({
    key: ModalFlowKey.NEW_WISHLIST,
    isProtected: true,
    initialStep: NewWishlistStepKey.EVENT,
    steps: {
      [NewWishlistStepKey.EVENT]: {
        component: NewEventModal,
      },
      [NewWishlistStepKey.EDIT_WISHLIST]: {
        component: EditWishlistModal,
      },
      [NewWishlistStepKey.ADD_GIFT]: {
        component: AddNewGiftModal,
      },
      [NewWishlistStepKey.EDIT_GIFT]: {
        component: AddNewGiftModal,
      },
      [NewWishlistStepKey.REMOVE_GIFT]: {
        component: AddNewGiftModal,
      },
    },
    createInitialState() {
      return new FlowState<NewWishlistFlowState>({
        event: {
          coverImage: null,
          date: null,
          description: null,
          location: null,
          name: '',
        },
        gifts: [],
      });
    },
  }),
} satisfies ModalFlowDefinitions;

export const modalFlowKeys = Object.values(ModalFlowKey);

export type RouteIntent = {
  [Key in ModalFlowKey]: {
    flow: Key;
    step: StepOf<Key>;
  };
}[ModalFlowKey];

export function getFlowDefinition<K extends ModalFlowKey>(key: K): ModalFlowDefinitions[K] {
  return MODAL_FLOWS[key];
}

export function getStepDefinition<K extends ModalFlowKey>(
  flow: K,
  step: StepOf<K>,
): ModalStepDefinition {
  const flowDefinition: ModalFlowDefinitions[K] = getFlowDefinition<K>(flow);

  return flowDefinition.steps[step];
}
