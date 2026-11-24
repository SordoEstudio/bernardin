import type { Product } from './cms/types';

export const BRAND_CATEGORY_ID: Record<string, string> = {
    bernardin: '6af357d83e671a576debb0b2',
    unia: '6af357e63e671a576debb0b3',
    'antonio-carraro': '6af358033e671a576debb0b5',
    samasz: '6af357f63e671a576debb0b4',
    // casale has no CMS category — brand page shows empty state
};

const BRAND_CATEGORY_NAMES = new Set(['Bernardin', 'Unia', 'Antonio Carraro', 'SaMASZ']);

const BRAND_NAME_BY_ID: Record<string, string> = {
    bernardin: 'Bernardin',
    unia: 'Unia',
    'antonio-carraro': 'Antonio Carraro',
    samasz: 'SaMASZ',
};

export function getCategoryNames(p: Product): string[] {
    if (!p.categories?.length) return [];
    const first = p.categories[0];
    if (typeof first === 'string') return p.categories as string[];
    return (p.categories as { _id: string; name: string }[]).map((c) => c.name);
}

export function getTypeNamesForProduct(p: Product): string[] {
    return getCategoryNames(p).filter((n) => !BRAND_CATEGORY_NAMES.has(n));
}

export function getBrandIdForProduct(p: Product): string | undefined {
    const names = getCategoryNames(p);
    for (const [brandId, brandName] of Object.entries(BRAND_NAME_BY_ID)) {
        if (names.includes(brandName)) return brandId;
    }
    return undefined;
}

export function slugifyType(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
