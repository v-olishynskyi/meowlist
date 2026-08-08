import { Tables } from '../../database.types';

export enum WishlistStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

export type Profile = Tables<'profiles'>;

export type OmitMeta<T> = Omit<T, 'created_at' | 'updated_at'>;

export enum WishlistFilter {
  ALL = 'all',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  WITH_EVENT = 'with-event',
  WITHOUT_EVENT = 'without-event',
}

type FilterOptions = {
  key: WishlistFilter;
  label: string;
};

export const WishlistFilters: Array<FilterOptions> = [
  { key: WishlistFilter.ALL, label: 'Усі' },
  { key: WishlistFilter.DRAFT, label: 'Чернетки' },
  { key: WishlistFilter.PUBLISHED, label: 'Опубліковані' },
  { key: WishlistFilter.HIDDEN, label: 'Приховані' },
  { key: WishlistFilter.WITH_EVENT, label: 'З подією' },
  { key: WishlistFilter.WITHOUT_EVENT, label: 'Без події' },
];

export const WishlistStatusLabels: Record<WishlistStatus, string> = {
  [WishlistStatus.DRAFT]: 'Чернетка',
  [WishlistStatus.PUBLISHED]: 'Опубліковано',
  [WishlistStatus.HIDDEN]: 'Приховано',
};
