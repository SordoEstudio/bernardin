export type { CMSConfig } from './core.js';
export { CMSError } from './core.js';
export * from './types.js';

import { CMSCore, type CMSConfig } from './core.js';
import { createNewsModule } from './entities/news.js';
import { createProductsModule } from './entities/products.js';
import { createPropertiesModule } from './entities/properties.js';
import { createBiddingsModule } from './entities/biddings.js';
import { createLegislationsModule } from './entities/legislations.js';
import { createComponentsModule } from './entities/cms-components.js';
import { createCategoriesModule } from './entities/categories.js';
import { createMediaModule } from './entities/media.js';
import { createFormsModule } from './entities/forms.js';
import { createClientConfigModule } from './entities/client-config.js';
import { createActivitiesModule } from './entities/activities.js';

export function createCMSClient(config: CMSConfig) {
  const core = new CMSCore(config);
  return {
    news: createNewsModule(core),
    products: createProductsModule(core),
    properties: createPropertiesModule(core),
    biddings: createBiddingsModule(core),
    legislations: createLegislationsModule(core),
    components: createComponentsModule(core),
    categories: createCategoriesModule(core),
    media: createMediaModule(core),
    forms: createFormsModule(core),
    clientConfig: createClientConfigModule(core),
    activities: createActivitiesModule(core),
  };
}

export type CMSClient = ReturnType<typeof createCMSClient>;
