// ─── Shared ──────────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages?: number; // biddings
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface CMSImage {
  url: string;
  title?: string;
  alt?: string;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  summary?: string;
  content?: string;
  image?: CMSImage;
  gallery?: CMSImage[];
  author?: string;
  tags?: string[];
  featured: boolean;
  category?: { name: string; slug: string };
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductAttribute {
  key: string;
  label: string;
  value: string;
}

export interface ProductLocale {
  title: string;
  summary?: string;
  description?: string;
  seo?: Record<string, unknown>;
  attachments?: unknown[];
}

export interface Product {
  _id: string;
  slug: string;
  productType?: string;
  visible: boolean;
  is_for_sale: boolean;
  sale_link_label?: string | null;
  sale_link_url?: string | null;
  locale?: ProductLocale;
  categories?: string[] | { _id: string; name: string }[];
  tags?: string[];
  images?: string[];
  attributes?: ProductAttribute[];
  price?: number;
  priceWholesale?: number;
  featured: boolean;
  order?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeConfig {
  _id: string;
  productType: string;
  attributes: { key: string; label: string; type: string; unit?: string }[];
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface Property {
  _id: string;
  title: string;
  description?: string;
  transactionType: 'venta' | 'alquiler' | string;
  propertyType?: string;
  condition?: string;
  address?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  addressLink?: string;
  price?: number;
  currency?: string;
  rooms?: Record<string, unknown>;
  features?: Record<string, unknown>;
  image?: string;
  images?: CMSImage[];
  tags?: string[];
  amenities?: string[];
  year?: number;
  isFeatured: boolean;
  categorias?: { _id: string; name: string; slug: string }[];
  status?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Biddings ─────────────────────────────────────────────────────────────────

export interface Bidding {
  _id: string;
  id?: string;
  title: string;
  bidding_number?: string;
  description?: string;
  effective_status: string;
  publication_status?: string;
  bidding_status?: string;
  dates?: {
    opening?: string;
    closing?: string;
    award?: string;
  };
  winner?: {
    company_name?: string;
    cuit?: string;
    award_amount?: number;
  };
  attachments?: { url: string; name?: string }[];
  createdAt: string;
  updatedAt?: string;
}

// ─── Legislations ─────────────────────────────────────────────────────────────

export type LegislationType = 'ordinance' | 'decree' | 'boletin';
export type LegislationStatus = 'vigente' | 'modificada' | 'derogada' | 'vetada';
export type BoletinAttachmentCategory = 'decreto' | 'ordenanza' | 'licitacion' | 'balance';

export interface BoletinAttachment {
  category: BoletinAttachmentCategory;
  label: string;
  source: 'url' | 'file';
  url?: string;
  file_url?: string;
  decreto_adjudicacion?: string;
}

export interface Legislation {
  _id: string;
  type: LegislationType;
  number: number;
  numberPadded: string;
  year?: number;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  tags?: string[];
  area?: string;
  status: LegislationStatus;
  signedAt?: string;
  publishedAt?: string;
  file?: {
    url: string;
    size?: number;
    mimeType?: string;
    originalFilename?: string;
    pages?: number;
  };
  attachments?: BoletinAttachment[];
  createdAt: string;
  updatedAt?: string;
}

// ─── CMS Component data field primitives ─────────────────────────────────────
//
// The `data` object of a CMSComponent uses a key-prefix convention that the
// CMS editor (DynamicForm) reads to auto-generate the correct input widget.
//
// PREFIX → WIDGET → TYPE
//   txt_*            single-line text input          string
//   txtp_*           auto-grow textarea              string
//   img_*            image picker (Vercel Blob URL)  string
//   icon_*           React Icons name picker         string
//   link_* / btn_*   label + URL + optional icon     CMSLinkField
//   item_*           icon + text pair                CMSItemField
//   gallery_*        array of image objects          CMSGalleryItem[]
//   social_*         label + URL + icon              CMSSocialField
//   contact_*        label + URL + icon              CMSSocialField
//   lista_contacto   contact list (special renderer) CMSContactItem[]
//   template_email*  email subject + body            CMSEmailTemplate
//
// SUFFIX / SPECIAL KEYS
//   *_optional       field is optional (not required in the form)
//   _configuracion   component config object, NOT shown in editor  CMSComponentConfig
//   _config          same as _configuracion
//   _orden           ordering hint                                  number
//   meta_title_X     groups all fields whose key contains X        string (group label)
//
// EXCLUDED FROM EDITOR
//   keys starting with `id`, ending with `_id`, or named `style` / `className`

/** `btn_*` and `link_*` fields */
export interface CMSLinkField {
  label: string;
  url: string;
  icon?: string;
}

/** @deprecated Shape was wrong — use CMSLinkField for btn_* / link_* fields */
export interface CMSButtonField {
  label: string;
  url: string;
  icon?: string;
}

/** `item_*` fields */
export interface CMSItemField {
  icon: string;
  text: string;
}

/** `gallery_*` array items */
export interface CMSGalleryItem {
  url: string;
  alt?: string;
  order?: number;
}

/** `social_*` and `contact_*` fields (generic renderer) */
export interface CMSSocialField {
  label: string;
  url: string;
  icon: string;
}

/** `lista_contacto` array items (special contact renderer) */
export interface CMSContactItem {
  icon_contacto: string;
  txt_label: string;
  link_destino: string;
  txt_valor?: string;
}

/** `template_email*` fields */
export interface CMSEmailTemplate {
  text_subject: string;
  text_body: string;
}

/** `_configuracion` / `_config` objects */
export interface CMSComponentConfig {
  variant?: string;
  layout?: string;
  [key: string]: unknown;
}

// ─── CMS Components ───────────────────────────────────────────────────────────

export interface CMSComponent {
  _id: string;
  name: string;
  type: string;
  page?: string;
  /**
   * Component content. Keys follow the prefix convention described above.
   * Cast to a typed interface per component type:
   *   const d = cms.components.getByType<MyHeroData>(components, 'hero');
   */
  data: Record<string, unknown>;
  content?: Record<string, unknown>;
  order: number;
  thumbnail?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CMSComponentsClient {
  id: string;
  name: string;
  slug: string;
  locale: string;
  defaultLocale: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
}

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaItem {
  _id: string;
  title?: string;
  alt?: string;
  description?: string;
  url: string;
  type: 'image' | 'video' | 'document' | string;
  tags?: string[];
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

// ─── Client Config ────────────────────────────────────────────────────────────

export interface ClientConfig {
  name: string;
  slug: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  locales?: string[];
  defaultLocale?: string;
  theme?: Record<string, unknown>;
  modules?: Record<string, boolean>;
  domains?: string[];
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export type FormFieldType =
  | 'text' | 'email' | 'tel' | 'textarea' | 'number'
  | 'select' | 'checkbox' | 'radio' | 'date' | 'file';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: Record<string, unknown>;
}

export interface FormSchema {
  _id: string;
  slug: string;
  name: string;
  fields: FormField[];
  settings?: {
    success_message?: string;
    send_email_notification?: boolean;
  };
  locale?: string;
}

export type FormSubmitBody = Record<string, string | number | boolean | string[]>;

export interface FormSubmitResult {
  message?: string;
}

export interface Testimonial {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface TestimonialsResult {
  testimonials: Testimonial[];
  total: number;
}

// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityModalidad = 'presencial' | 'virtual' | 'hibrido';

export interface ActivitySession {
  fecha: string;
  hora: string;
  duracion_min: number;
}

export interface ActivityExtraField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
}

export interface Activity {
  _id: string;
  nombre: string;
  descripcion_corta: string;
  modalidad: ActivityModalidad;
  precio: number;
  cupo?: number;
  fecha_cierre_inscripcion?: string;
  fechas: ActivitySession[];
  audiencia: string[];
  categoria?: string;
  extra_fields: ActivityExtraField[];
  inscripciones_abiertas: boolean;
  registrations_count: number;
  createdAt: string;
}

export interface ActivitiesResult {
  activities: Activity[];
  pagination: Pagination;
}

export type ActivityRegisterBody = {
  _hp: '';
  nombre: string;
  telefono: string;
} & Record<string, string | number>;

export interface ActivityRegisterResult {
  message: string;
}
