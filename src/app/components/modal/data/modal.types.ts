import { Type } from '@angular/core';
import { AddNewGiftModal } from '../../../features/modals/feature-modals/add-new-gift/add-new-gift.component';
import { AuthOtpModal } from '../../../features/modals/feature-modals/auth-otp/auth-otp.component';
import { NewEventModal } from '../../../features/modals/feature-modals/new-event/new-event.component';
import { EditWishlistModal } from '../../../features/modals/feature-modals/edit-wishlist/edit-wishlist.component';
import { Tables } from '../../../../database.types';
import { OmitMeta, WishlistStatus } from '../../../core/types';

export type StateUpdater<T> = ((state: T) => T) | Partial<T>;

export class FlowState<T extends object> {
  constructor(readonly state: T) {
    Object.assign(this, state);
  }

  update(updater: (state: T) => T): FlowState<T> {
    // if (typeof updater === 'function') {
    return new FlowState(updater(this.state));
    // }

    // const newState: T = {
    //   ...this.state,
    //   ...updater,
    // };

    // return new FlowState(newState);
  }
}

export class ModalFlowSession<Key extends ModalFlowKey> {
  constructor(
    readonly flow: Key,
    private readonly flowState: FlowState<StateOf<Key>>,
  ) {}

  get state(): StateOf<Key> {
    return this.flowState.state;
  }

  updateState(updater: (state: StateOf<Key>) => StateOf<Key>): ModalFlowSession<Key> {
    return new ModalFlowSession(this.flow, this.flowState.update(updater));
  }
}

// FLOW KEYS
export enum ModalFlowKey {
  AUTH_OTP = 'auth-otp',
  NEW_WISHLIST = 'new-wishlist',
  EDIT_WISHLIST = 'edit-wishlist',
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

export enum EditWishListStepKey {
  EVENT = 'edit-event',
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

export type CreateWishlistFlowState = {
  wishlist: Wishlist | null;
  event: EventDraft;
  gifts: Gift[];
};

export type EventDraft = {
  name: string | null;
  description: string | null;
  event_date: string | null;
  location: string | null;
};

export type GiftDraft = {
  name: string;
  description: string | null;
  link: string | null;
  price: number | null;
  imageUrl: string;
};

export type Gift = OmitMeta<Tables<'gifts'>>;
export type Event = OmitMeta<Tables<'events'>>;
export type Wishlist = OmitMeta<Tables<'wishlists'>>;

export type EditWishlistFlowState = {
  wishlist: Wishlist;
  event: Event;
  gifts: Gift[];
};

export type ModalFlowSpecMap = {
  [ModalFlowKey.AUTH_OTP]: {
    step: AuthOtpStepKey;
    state: FlowState<AuthOtpFlowState>;
  };

  [ModalFlowKey.NEW_WISHLIST]: {
    step: NewWishlistStepKey;
    state: FlowState<CreateWishlistFlowState>;
  };

  [ModalFlowKey.EDIT_WISHLIST]: {
    step: EditWishListStepKey;
    state: FlowState<EditWishlistFlowState>;
  };
};

export type StepOf<K extends ModalFlowKey> = ModalFlowSpecMap[K]['step'];

export type FlowStateOf<K extends ModalFlowKey> = ModalFlowSpecMap[K]['state'];
export type StateOf<K extends ModalFlowKey> = FlowStateOf<K> extends FlowState<infer T> ? T : never;

export type ModalStepDefinition = {
  component: Type<unknown>;
};

export type ModalFlowDefinition<Key extends ModalFlowKey> = {
  key: Key;
  isProtected: boolean;

  initialStep: StepOf<Key>;

  createInitialState: (state?: StateOf<Key>) => FlowState<StateOf<Key>>;

  steps: {
    [Step in StepOf<Key>]: ModalStepDefinition;
  };
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

export const NEW_WISHLIST_FLOW = defineModalFlow<ModalFlowKey.NEW_WISHLIST>({
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
  createInitialState: (): FlowState<CreateWishlistFlowState> => {
    return new FlowState<CreateWishlistFlowState>({
      wishlist: null,
      event: {
        event_date: null,
        description: null,
        location: null,
        name: '',
      },
      gifts: [],
    });
  },
});

export const EDIT_WISHLIST_FLOW = defineModalFlow<ModalFlowKey.EDIT_WISHLIST>({
  key: ModalFlowKey.EDIT_WISHLIST,
  isProtected: true,
  initialStep: EditWishListStepKey.EVENT,
  steps: {
    [EditWishListStepKey.EVENT]: {
      component: NewEventModal,
    },
    [EditWishListStepKey.EDIT_WISHLIST]: {
      component: EditWishlistModal,
    },
    [EditWishListStepKey.ADD_GIFT]: {
      component: AddNewGiftModal,
    },
    [EditWishListStepKey.EDIT_GIFT]: {
      component: AddNewGiftModal,
    },
    [EditWishListStepKey.REMOVE_GIFT]: {
      component: AddNewGiftModal,
    },
  },
  createInitialState: (state): FlowState<EditWishlistFlowState> => {
    return new FlowState<EditWishlistFlowState>({
      wishlist: state?.wishlist || {
        id: '',
        owner_id: '',
        status: WishlistStatus.DRAFT,
      },
      event: state?.event || {
        wishlist_id: '',
        name: '',
        description: null,
        event_date: null,
        location: null,
      },
      gifts: state?.gifts || [],
    });
  },
});

export const AUTH_OTP_FLOW = defineModalFlow<ModalFlowKey.AUTH_OTP>({
  key: ModalFlowKey.AUTH_OTP,
  isProtected: false,
  initialStep: AuthOtpStepKey.PHONE,
  steps: {
    [AuthOtpStepKey.PHONE]: {
      component: AuthOtpModal,
    },
  },
  createInitialState: (): FlowState<AuthOtpFlowState> =>
    new FlowState<AuthOtpFlowState>({
      phoneNumber: null,
    }),
});

export const MODAL_FLOWS = {
  [ModalFlowKey.AUTH_OTP]: AUTH_OTP_FLOW,

  [ModalFlowKey.NEW_WISHLIST]: NEW_WISHLIST_FLOW,

  [ModalFlowKey.EDIT_WISHLIST]: EDIT_WISHLIST_FLOW,
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
