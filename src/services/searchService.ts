import { Kural, SearchRecord } from '../types/kural';
import { normalizeSearchText, parseQueryNumber } from '../utils/text';
import { KuralService } from './kuralService';

let searchIndex: SearchRecord[] | null = null;

function getSearchIndex(): SearchRecord[] {
  if (searchIndex) return searchIndex;

  const kurals = KuralService.getAllKurals();
  searchIndex = kurals.map((kural) => ({
    kural,
    normalizedNumber: String(kural.number),
    normalizedLine1: normalizeSearchText(kural.line1),
    normalizedLine2: normalizeSearchText(kural.line2),
    normalizedTamil: normalizeSearchText(kural.tamil),
    normalizedTransliteration: normalizeSearchText(kural.transliteration),
    normalizedChapterTamil: normalizeSearchText(kural.chapterNameTamil),
    normalizedChapterEnglish: normalizeSearchText(kural.chapterNameEnglish),
    normalizedChapterTransliteration: normalizeSearchText(kural.chapterTransliteration),
    normalizedChapterNumber: String(kural.chapterNumber),
    normalizedCategoryTamil: normalizeSearchText(kural.categoryTamil),
    normalizedCategoryEnglish: normalizeSearchText(kural.categoryEnglish),
    normalizedTranslation: normalizeSearchText(kural.translation),
    normalizedCouplet: normalizeSearchText(kural.couplet),
  }));

  return searchIndex;
}

export interface SearchResult {
  kural: Kural;
  matchScore: number;
  matchReason?: string;
}

export const SearchService = {
  /**
   * Searches the normalized index using multi-field matching and relevance ranking.
   */
  search(rawQuery: string, limit = 50): Kural[] {
    const normalizedQuery = normalizeSearchText(rawQuery);
    if (!normalizedQuery) {
      return [];
    }

    const index = getSearchIndex();
    const queryNum = parseQueryNumber(rawQuery);
    const scoredResults: SearchResult[] = [];

    for (const record of index) {
      let score = 0;
      let matched = false;

      // 1. Exact Kural number match (highest priority: 1000)
      if (queryNum !== null && record.kural.number === queryNum) {
        score += 1000;
        matched = true;
      }

      // 2. Exact Chapter number match (priority: 800)
      if (queryNum !== null && record.kural.chapterNumber === queryNum) {
        score += 800;
        matched = true;
      }

      // 3. Exact Chapter name match (Tamil / English / Transliteration: 700)
      if (
        record.normalizedChapterTamil === normalizedQuery ||
        record.normalizedChapterEnglish === normalizedQuery ||
        record.normalizedChapterTransliteration === normalizedQuery
      ) {
        score += 700;
        matched = true;
      }
      // Chapter name starts with (600) or contains (500)
      else if (
        record.normalizedChapterTamil.startsWith(normalizedQuery) ||
        record.normalizedChapterEnglish.startsWith(normalizedQuery) ||
        record.normalizedChapterTransliteration.startsWith(normalizedQuery)
      ) {
        score += 600;
        matched = true;
      } else if (
        record.normalizedChapterTamil.includes(normalizedQuery) ||
        record.normalizedChapterEnglish.includes(normalizedQuery) ||
        record.normalizedChapterTransliteration.includes(normalizedQuery)
      ) {
        score += 500;
        matched = true;
      }

      // 4. Category match (Exact: 550, Contains: 450)
      if (
        record.normalizedCategoryTamil === normalizedQuery ||
        record.normalizedCategoryEnglish === normalizedQuery
      ) {
        score += 550;
        matched = true;
      } else if (
        record.normalizedCategoryTamil.includes(normalizedQuery) ||
        record.normalizedCategoryEnglish.includes(normalizedQuery)
      ) {
        score += 450;
        matched = true;
      }

      // 5. Exact phrase match in Tamil or Transliteration (400)
      if (
        record.normalizedTamil === normalizedQuery ||
        record.normalizedTransliteration === normalizedQuery
      ) {
        score += 400;
        matched = true;
      }

      // 6. Tamil Line Starts With (350)
      if (
        record.normalizedLine1.startsWith(normalizedQuery) ||
        record.normalizedLine2.startsWith(normalizedQuery)
      ) {
        score += 350;
        matched = true;
      }

      // 7. Transliteration Starts With (300)
      if (record.normalizedTransliteration.startsWith(normalizedQuery)) {
        score += 300;
        matched = true;
      }

      // 8. Contains query in Tamil text (250)
      if (
        record.normalizedLine1.includes(normalizedQuery) ||
        record.normalizedLine2.includes(normalizedQuery) ||
        record.normalizedTamil.includes(normalizedQuery)
      ) {
        score += 250;
        matched = true;
      }

      // 9. Contains query in English transliteration (200)
      if (record.normalizedTransliteration.includes(normalizedQuery)) {
        score += 200;
        matched = true;
      }

      // 10. Contains query in English translation / couplet (150)
      if (
        record.normalizedTranslation.includes(normalizedQuery) ||
        record.normalizedCouplet.includes(normalizedQuery)
      ) {
        score += 150;
        matched = true;
      }

      if (matched) {
        scoredResults.push({
          kural: record.kural,
          matchScore: score,
        });
      }
    }

    // Sort by match score descending, then by Kural number ascending
    scoredResults.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.kural.number - b.kural.number;
    });

    return scoredResults.slice(0, limit).map((r) => r.kural);
  },
};
