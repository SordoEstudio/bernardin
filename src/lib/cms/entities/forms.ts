import type { CMSCore, Params } from '../core.js';
import type { FormSchema, FormSubmitBody, FormSubmitResult, TestimonialsResult } from '../types.js';

export function createFormsModule(core: CMSCore) {
  return {
    async schema(slug: string, locale?: string, fetchOptions?: RequestInit): Promise<FormSchema> {
      const params: Params = {};
      if (locale) params.locale = locale;
      const res = await core.get<FormSchema>(`/forms/${slug}`, params, fetchOptions);
      return res.data;
    },

    async submit(
      slug: string,
      body: FormSubmitBody,
      locale?: string,
      fetchOptions?: RequestInit,
    ): Promise<FormSubmitResult> {
      const params: Params = {};
      if (locale) params.locale = locale;
      return core.post<FormSubmitResult>(`/forms/${slug}/submit`, body, params, fetchOptions);
    },

    async testimonials(
      slug: string,
      params?: { limit?: number },
      fetchOptions?: RequestInit,
    ): Promise<TestimonialsResult> {
      const res = await core.get<TestimonialsResult>(
        `/forms/${slug}/testimonials`,
        params as Params,
        fetchOptions,
      );
      return res.data;
    },
  };
}
