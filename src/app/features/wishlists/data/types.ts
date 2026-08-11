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
