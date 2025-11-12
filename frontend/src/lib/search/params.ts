export type ProductFilters = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  stock?: 'in';
  sort?: string;
  page?: number;
  per_page?: number;
};

const VALID_KEYS = ['q', 'category', 'min', 'max', 'stock', 'sort', 'page', 'per_page'];

export function parse(searchParams: Record<string, string | string[] | undefined>): ProductFilters {
  const filters: ProductFilters = {};

  for (const key of VALID_KEYS) {
    const value = searchParams[key];
    if (!value || Array.isArray(value)) continue;

    switch (key) {
      case 'q':
      case 'category':
      case 'sort':
        if (value.trim()) filters[key] = value.trim();
        break;
      case 'min':
      case 'max':
      case 'page':
      case 'per_page':
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) filters[key] = num;
        break;
      case 'stock':
        if (value === 'in') filters.stock = 'in';
        break;
    }
  }

  return filters;
}

export function toQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.min) params.set('min', String(filters.min));
  if (filters.max) params.set('max', String(filters.max));
  if (filters.stock) params.set('stock', filters.stock);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));

  return params.toString();
}
