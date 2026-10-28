import type { CMSCore } from '../core.js';
import type { Category } from '../types.js';

export function createCategoriesModule(core: CMSCore) {
  return {
    async list(fetchOptions?: RequestInit): Promise<Category[]> {
      const res = await core.get<Category[]>('/categories', undefined, fetchOptions);
      return res.data;
    },
  };
}
