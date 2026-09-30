/**
 * Normalizes text for search indexing and query matching:
 * - Unicode normalization (NFC)
 * - Lowercase conversion
 * - Trimming and collapsing consecutive spaces
 * - Stripping common punctuation for flexible matching
 */
export function normalizeSearchText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .normalize('NFC')
    .toLowerCase()
    // Replace non-word/non-Tamil punctuation with single space, retaining Tamil characters and alphanumeric
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if query is a numeric kural or chapter number
 */
export function parseQueryNumber(query: string): number | null {
  const trimmed = query.trim();
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Formats a Kural for sharing or copying
 */
export function formatKuralText(
  kural: {
    number: number;
    tamil: string;
    transliteration?: string;
    translation?: string;
    chapterNameTamil?: string;
    categoryTamil?: string;
  },
  mode: 'tamil' | 'transliteration' | 'both' | 'full' = 'full'
): string {
  const parts: string[] = [];

  if (mode === 'tamil') {
    return `குறள் ${kural.number}\n\n${kural.tamil}`;
  }

  if (mode === 'transliteration') {
    return `Kural ${kural.number}\n\n${kural.transliteration || ''}`;
  }

  if (mode === 'both') {
    return `குறள் ${kural.number}\n\n${kural.tamil}\n\n${kural.transliteration || ''}`;
  }

  // Full formatted share text
  parts.push('திருக்குறள் | Thirukkural');
  parts.push(`குறள் ${kural.number}`);
  parts.push(kural.tamil);
  if (kural.transliteration) {
    parts.push(kural.transliteration);
  }
  if (kural.translation) {
    parts.push(`Translation:\n${kural.translation}`);
  }
  const meta: string[] = [];
  if (kural.categoryTamil) meta.push(kural.categoryTamil);
  if (kural.chapterNameTamil) meta.push(kural.chapterNameTamil);
  if (meta.length > 0) {
    parts.push(meta.join(' • '));
  }

  return parts.join('\n\n');
}

/**
 * Sanitizes a string for safe filenames (e.g. "My Favorite Kurals" -> "My-Favorite-Kurals")
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\u0B80-\u0BFF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'document';
}
