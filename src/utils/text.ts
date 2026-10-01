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

export type MeaningType = 'mv' | 'sp' | 'mk' | 'translation' | 'both';

export interface SocialShareOptions {
  meaningType?: MeaningType;
  includeTransliteration?: boolean;
  includeHashtags?: boolean;
  includeStructure?: boolean;
}

/**
 * Formats a Kural with meaning and structure for social media sharing
 * Supports Facebook, Twitter (X), Threads, Instagram, WhatsApp Status
 */
export function formatKuralForSocialShare(
  kural: {
    number: number;
    line1?: string;
    line2?: string;
    tamil?: string;
    transliteration?: string;
    translation?: string;
    commentaryMV?: string;
    commentarySP?: string;
    commentaryMK?: string;
    chapterNameTamil?: string;
    categoryTamil?: string;
  },
  options: SocialShareOptions = {}
): string {
  const {
    meaningType = 'mv',
    includeTransliteration = false,
    includeHashtags = true,
    includeStructure = true,
  } = options;

  const parts: string[] = [];

  // Header / Structure
  let header = `குறள் ${kural.number}`;
  if (includeStructure && kural.chapterNameTamil) {
    header += ` • ${kural.chapterNameTamil}`;
    if (kural.categoryTamil) {
      header += ` (${kural.categoryTamil})`;
    }
  }
  parts.push(header);

  // Kural 2 lines
  let kuralLines = '';
  if (kural.line1 && kural.line2) {
    kuralLines = `${kural.line1}\n${kural.line2}`;
  } else if (kural.tamil) {
    kuralLines = kural.tamil;
  }
  if (kuralLines) {
    parts.push(kuralLines);
  }

  // Transliteration
  if (includeTransliteration && kural.transliteration) {
    parts.push(kural.transliteration);
  }

  // Meaning based on selected type
  if (meaningType === 'mv' && kural.commentaryMV) {
    parts.push(`பொருள் (மு. வரதராசனார்):\n${kural.commentaryMV}`);
  } else if (meaningType === 'sp' && kural.commentarySP) {
    parts.push(`பொருள் (சாலமன் பாப்பையா):\n${kural.commentarySP}`);
  } else if (meaningType === 'mk' && kural.commentaryMK) {
    parts.push(`பொருள் (கலைஞர் உரை):\n${kural.commentaryMK}`);
  } else if (meaningType === 'translation' && kural.translation) {
    parts.push(`Meaning (English):\n${kural.translation}`);
  } else if (meaningType === 'both') {
    const tamilMeaning = kural.commentaryMV || kural.commentarySP || kural.commentaryMK;
    if (tamilMeaning) {
      parts.push(`பொருள் (மு. வரதராசனார்):\n${tamilMeaning}`);
    }
    if (kural.translation) {
      parts.push(`Meaning (English):\n${kural.translation}`);
    }
  }

  // Hashtags for social media reach
  if (includeHashtags) {
    parts.push('#திருக்குறள் #Thirukkural #Tamil #Wisdom');
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
