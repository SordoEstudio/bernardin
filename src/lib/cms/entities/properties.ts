import type { CMSCore, Params } from '../core.js';
import type { Property, Pagination } from '../types.js';

export interface PropertiesListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  transactionType?: 'venta' | 'alquiler';
  propertyType?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function createPropertiesModule(core: CMSCore) {
  return {
    async list(
      params?: PropertiesListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ properties: Property[]; pagination: Pagination }> {
      const res = await core.get<{ properties: Property[]; pagination: Pagination }>('/properties', params, fetchOptions);
      return res.data;
    },

    async featured(fetchOptions?: RequestInit): Promise<Property[]> {
      const res = await core.get<{ properties: Property[] }>('/properties/featured', undefined, fetchOptions);
      return res.data.properties;
    },

    async get(id: string, fetchOptions?: RequestInit): Promise<Property> {
      const res = await core.get<Property>(`/properties/${id}`, undefined, fetchOptions);
      return res.data;
    },
  };
}
