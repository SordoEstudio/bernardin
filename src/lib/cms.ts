import { createCMSClient } from './cms/index';

export const cms = createCMSClient({
  baseUrl: import.meta.env.PUBLIC_CMS_API,
  clientSlug: import.meta.env.PUBLIC_CLIENT_SLUG,
  defaultHeaders: {
    Origin: import.meta.env.PUBLIC_SITE_ORIGIN ?? import.meta.env.SITE,
  },
});
