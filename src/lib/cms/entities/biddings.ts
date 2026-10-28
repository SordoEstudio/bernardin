import type { CMSCore, Params } from '../core.js';
import type { Bidding, Pagination } from '../types.js';

export interface BiddingsListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function createBiddingsModule(core: CMSCore) {
  return {
    async list(
      params?: BiddingsListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ items: Bidding[]; pagination: Pagination }> {
      const res = await core.get<{ items: Bidding[]; pagination: Pagination }>('/biddings', params, fetchOptions);
      return res.data;
    },

    async get(id: string, fetchOptions?: RequestInit): Promise<Bidding> {
      const res = await core.get<Bidding>(`/biddings/${id}`, undefined, fetchOptions);
      return res.data;
    },
  };
}
