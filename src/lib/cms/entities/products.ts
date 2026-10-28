import type { CMSCore, Params } from '../core.js';
import type { Product, ProductAttributeConfig, Pagination } from '../types.js';

export interface ProductsListParams extends Params {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  category?: string;
  productType?: string;
  featured?: boolean;
  status?: string;
}

export function createProductsModule(core: CMSCore) {
  return {
    async list(
      params?: ProductsListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ products: Product[]; pagination: Pagination }> {
      const p = { locale: core.defaultLocale, ...params };
      const res = await core.get<{ products: Product[]; pagination: Pagination }>('/products', p, fetchOptions);
      return res.data;
    },

    async get(slug: string, locale?: string, fetchOptions?: RequestInit): Promise<Product> {
      const res = await core.get<Product>(`/products/${slug}`, { locale: locale ?? core.defaultLocale }, fetchOptions);
      return res.data;
    },

    async attributeConfig(productType?: string, fetchOptions?: RequestInit): Promise<ProductAttributeConfig[]> {
      const res = await core.get<ProductAttributeConfig[]>('/product-attribute-config', productType ? { productType } : undefined, fetchOptions);
      return res.data;
    },
  };
}
