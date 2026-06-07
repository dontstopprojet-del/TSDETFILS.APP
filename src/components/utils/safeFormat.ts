export function safeLocale(val: number | string | null | undefined, _lang?: string): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('fr-FR');
}

export function safeNumber(val: unknown, fallback: number = 0): number {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export function safeText(val: string | null | undefined, fallback: string = '-'): string {
  return val ?? fallback;
}

export function safeFixed(val: number | string | null | undefined, decimals: number = 2, fallback: string = '0'): string {
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return num.toFixed(decimals);
}

export function safeDate(val: string | Date | null | undefined, lang?: string): string {
  if (!val) return '-';
  try {
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '-';
    const locale = lang === 'en' ? 'en-US' : 'fr-FR';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
}
