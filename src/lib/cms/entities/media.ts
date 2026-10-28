import type { CMSCore, Params } from '../core.js';
import type { MediaItem, Pagination } from '../types.js';

export interface MediaListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'image' | 'video' | 'document';
  tags?: string;
}

export function createMediaModule(core: CMSCore) {
  return {
    async list(
      params?: MediaListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ items: MediaItem[]; pagination: Pagination }> {
      const res = await core.get<MediaItem[]>('/media', params, fetchOptions);
      return { items: res.data, pagination: res.pagination as Pagination };
    },
  };
}
