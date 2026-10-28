import type { CMSCore, Params } from '../core.js';
import type { NewsItem, Pagination } from '../types.js';

export interface NewsListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  tags?: string;
}

export function createNewsModule(core: CMSCore) {
  return {
    async list(params?: NewsListParams, fetchOptions?: RequestInit): Promise<{ items: NewsItem[]; pagination: Pagination }> {
      const res = await core.get<NewsItem[]>('/news', params, fetchOptions);
      return { items: res.data, pagination: res.pagination as Pagination };
    },

    async get(slug: string, fetchOptions?: RequestInit): Promise<NewsItem> {
      const res = await core.get<NewsItem>(`/news/${slug}`, undefined, fetchOptions);
      return res.data;
    },
  };
}
