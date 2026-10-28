import type { CMSCore, Params } from '../core.js';
import type { ClientConfig } from '../types.js';

export function createClientConfigModule(core: CMSCore) {
  return {
    async get(host?: string, fetchOptions?: RequestInit): Promise<ClientConfig> {
      const params: Params = {};
      if (host) params.host = host;
      const res = await core.get<ClientConfig>('/client-config', params, fetchOptions);
      return res.data;
    },
  };
}
