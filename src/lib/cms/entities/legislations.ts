import type { CMSCore, Params } from '../core.js';
import type { Legislation, LegislationType, LegislationStatus, Pagination } from '../types.js';

export interface LegislationsListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  type?: LegislationType;
  status?: LegislationStatus;
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  area?: string;
  tags?: string;
  sortBy?: 'year' | 'number' | 'publishedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export function createLegislationsModule(core: CMSCore) {
  return {
    async list(
      params?: LegislationsListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ items: Legislation[]; pagination: Pagination }> {
      const res = await core.get<Legislation[]>('/legislations', params, fetchOptions);
      return { items: res.data, pagination: res.pagination as Pagination };
    },

    async get(slug: string, fetchOptions?: RequestInit): Promise<Legislation> {
      const res = await core.get<Legislation>(`/legislations/${slug}`, undefined, fetchOptions);
      return res.data;
    },
  };
}
