import type { CMSCore, Params } from '../core.js';
import type { CMSComponent, CMSComponentsClient } from '../types.js';

export interface ComponentsListParams extends Params {
  type?: string;
  page_filter?: string;
  locale?: string;
}

export function createComponentsModule(core: CMSCore) {
  return {
    async list(
      params?: ComponentsListParams,
      fetchOptions?: RequestInit,
    ): Promise<{ components: CMSComponent[]; client: CMSComponentsClient }> {
      const p = { locale: core.defaultLocale, ...params };
      const res = await core.get<{ components: CMSComponent[]; client: CMSComponentsClient }>('/cms-components', p, fetchOptions);
      return res.data;
    },

    async get(id: string, fetchOptions?: RequestInit): Promise<CMSComponent> {
      const res = await core.get<CMSComponent>(`/cms-components/${id}`, undefined, fetchOptions);
      return res.data;
    },

    /** Filtra por tipo dentro de una lista ya fetcheada, ordenado por `order` */
    byType(components: CMSComponent[], type: string): CMSComponent[] {
      return components.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
    },

    /** Retorna el `data` del primer componente del tipo indicado, tipado como T */
    getByType<T>(components: CMSComponent[], type: string): T | undefined {
      const found = components.find((c) => c.type === type);
      return found?.data as T | undefined;
    },
  };
}
