import { Tables } from '../../database.types';

export enum WishlistStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

export type Profile = Tables<'profiles'>;

export type OmitMeta<T> = Omit<T, 'created_at' | 'updated_at'>;
