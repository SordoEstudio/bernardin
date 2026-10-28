export interface CMSConfig {
  /** URL base de la API pública. Ej: https://cms.harvi.com.ar/api/public/v1 */
  baseUrl: string;
  /**
   * Slug del cliente. Requerido en SSR (Astro build, Next.js server components)
   * y en desarrollo local/preview. En producción con dominio autorizado no es necesario,
   * pero agregarlo no genera conflicto.
   */
  clientSlug?: string;
  /** Locale por defecto para endpoints que lo soporten. Default: 'es' */
  defaultLocale?: string;
  /** Headers inyectados en cada request (ej. Origin para build-time SSG). */
  defaultHeaders?: Record<string, string>;
}

export type Params = Record<string, string | number | boolean | undefined | null>;

export class CMSError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'CMSError';
  }
}

export class CMSCore {
  readonly defaultLocale: string;

  constructor(private readonly config: CMSConfig) {
    this.defaultLocale = config.defaultLocale ?? 'es';
  }

  buildUrl(path: string, params: Params = {}): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const url = new URL(base + path);
    if (this.config.clientSlug) {
      url.searchParams.set('clientSlug', this.config.clientSlug);
    }
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
    return url.toString();
  }

  async get<T>(
    path: string,
    params?: Params,
    fetchOptions?: RequestInit,
  ): Promise<{ data: T; pagination?: unknown }> {
    const res = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      headers: { ...this.config.defaultHeaders, ...(fetchOptions?.headers ?? {}) },
    });
    const json = await res.json() as { success: boolean; data: T; pagination?: unknown; message?: string; code?: string };
    if (!json?.success) {
      throw new CMSError(json?.message ?? `HTTP ${res.status}`, res.status, json?.code);
    }
    return { data: json.data, pagination: json.pagination };
  }

  async post<T>(
    path: string,
    body: unknown,
    params?: Params,
    fetchOptions?: RequestInit,
  ): Promise<T> {
    const res = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.defaultHeaders,
        ...(fetchOptions?.headers ?? {}),
      },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { success: boolean; data: T; message?: string; code?: string };
    if (!json?.success) {
      throw new CMSError(json?.message ?? `HTTP ${res.status}`, res.status, json?.code);
    }
    return json.data;
  }
}
