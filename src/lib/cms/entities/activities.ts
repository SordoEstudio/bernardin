import type { CMSCore, Params } from '../core.js';
import type {
  Activity,
  ActivitiesResult,
  ActivityRegisterBody,
  ActivityRegisterResult,
} from '../types.js';

export function createActivitiesModule(core: CMSCore) {
  return {
    async list(
      params?: { page?: number; limit?: number; search?: string; categoria?: string },
      fetchOptions?: RequestInit,
    ): Promise<ActivitiesResult> {
      const res = await core.get<ActivitiesResult>('/activities', params as Params, fetchOptions);
      return res.data;
    },

    async get(id: string, fetchOptions?: RequestInit): Promise<Activity> {
      const res = await core.get<Activity>(`/activities/${id}`, {}, fetchOptions);
      return res.data;
    },

    async register(
      activityId: string,
      body: ActivityRegisterBody,
      fetchOptions?: RequestInit,
    ): Promise<ActivityRegisterResult> {
      return core.post<ActivityRegisterResult>(
        `/activities/${activityId}/register`,
        body,
        {},
        fetchOptions,
      );
    },
  };
}
