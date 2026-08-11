import { Tables } from '../../database.types';

export enum WishlistStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

export type Profile = Tables<'profiles'> & {
  reservations: Tables<'gifts_reservation'>[];
};

export type GiftReservation = Tables<'gifts_reservation'>;
export enum GiftReservationStatus {
  RESERVED = 'reserved',
  AVAILABLE = 'available',
}

export type ReservationWithGift = GiftReservation & {
  gift: Tables<'gifts'> & {
    wishlist: Pick<Tables<'wishlists'>, 'id' | 'slug'>;
  };
};

export type OmitMeta<T> = Omit<T, 'created_at' | 'updated_at'>;

export const WishlistStatusLabels: Record<WishlistStatus, string> = {
  [WishlistStatus.DRAFT]: 'Чернетка',
  [WishlistStatus.PUBLISHED]: 'Опубліковано',
  [WishlistStatus.HIDDEN]: 'Приховано',
};
