import {
  Category,
  Chapter,
  ChapterGroup,
  Kural,
  RawDetailRoot,
  RawThirukkuralDataset,
} from '../types/kural';

import { formatKuralCouplet } from '../utils/text';

// Load static bundled JSON datasets
const rawDataset: RawThirukkuralDataset = require('../../assets/data/thirukkural.json');
const rawDetailData: RawDetailRoot[] = require('../../assets/data/detail.json');

// Internal cached state
let kuralsCache: Kural[] | null = null;
let kuralMapCache: Map<number, Kural> | null = null;
let chaptersCache: Chapter[] | null = null;
let chapterMapCache: Map<number, Chapter> | null = null;
let categoriesCache: Category[] | null = null;

/**
 * Initializes and normalizes the master Thirukkural dataset and chapter hierarchy.
 * Runs once and caches results in memory for instant lookups.
 */
function initData() {
  if (kuralsCache && kuralMapCache && chaptersCache && chapterMapCache && categoriesCache) {
    return;
  }

  const chapters: Chapter[] = [];
  const chapterMap = new Map<number, Chapter>();
  const categories: Category[] = [];

  const sectionDetail = rawDetailData[0]?.section?.detail || [];

  for (const sec of sectionDetail) {
    const secChapters: Chapter[] = [];
    const secChapterGroups: ChapterGroup[] = [];

    for (const cg of sec.chapterGroup.detail) {
      const groupChapters: Chapter[] = [];

      for (const ch of cg.chapters.detail) {
        const chapterObj: Chapter = {
          number: ch.number,
          nameTamil: ch.name,
          nameEnglish: ch.translation,
          transliteration: ch.transliteration,
          startKural: ch.start,
          endKural: ch.end,
          kuralCount: ch.end - ch.start + 1,
          groupTamil: cg.name,
          groupEnglish: cg.translation,
          categoryTamil: sec.name,
          categoryEnglish: sec.translation,
        };

        chapters.push(chapterObj);
        chapterMap.set(ch.number, chapterObj);
        groupChapters.push(chapterObj);
        secChapters.push(chapterObj);
      }

      secChapterGroups.push({
        number: cg.number,
        nameTamil: cg.name,
        nameEnglish: cg.translation,
        transliteration: cg.transliteration,
        categoryTamil: sec.name,
        categoryEnglish: sec.translation,
        chapters: groupChapters,
      });
    }

    categories.push({
      number: sec.number,
      nameTamil: sec.name,
      nameEnglish: sec.translation,
      transliteration: sec.transliteration,
      chapterGroups: secChapterGroups,
      chapters: secChapters,
      kuralCount: secChapters.reduce((acc, c) => acc + c.kuralCount, 0),
    });
  }

  const rawKurals = rawDataset.kural || [];
  const kurals: Kural[] = [];
  const kuralMap = new Map<number, Kural>();

  for (const raw of rawKurals) {
    const num = raw.Number;
    const chNum = raw.chapterNumber || Math.floor((num - 1) / 10) + 1;
    const chapter = chapterMap.get(chNum);

    const { line1, line2, tamil } = formatKuralCouplet(raw.Line1, raw.Line2);

    const kural: Kural = {
      number: num,
      line1,
      line2,
      tamil,
      transliteration1: raw.transliteration1 || '',
      transliteration2: raw.transliteration2 || '',
      transliteration: `${raw.transliteration1 || ''}\n${raw.transliteration2 || ''}`.trim(),
      translation: raw.Translation || '',
      couplet: raw.couplet || '',
      explanation: raw.explanation || '',
      commentaryMV: raw.mv || '',
      commentarySP: raw.sp || '',
      commentaryMK: raw.mk || '',
      chapterNumber: chNum,
      chapterNameTamil: chapter ? chapter.nameTamil : raw.chapter || `அதிகாரம் ${chNum}`,
      chapterNameEnglish: chapter ? chapter.nameEnglish : `Chapter ${chNum}`,
      chapterTransliteration: chapter ? chapter.transliteration : '',
      chapterGroupTamil: chapter ? chapter.groupTamil : '',
      chapterGroupEnglish: chapter ? chapter.groupEnglish : '',
      categoryTamil: chapter ? chapter.categoryTamil : raw.category || '',
      categoryEnglish: chapter ? chapter.categoryEnglish : '',
    };

    kurals.push(kural);
    kuralMap.set(num, kural);
  }

  kuralsCache = kurals;
  kuralMapCache = kuralMap;
  chaptersCache = chapters;
  chapterMapCache = chapterMap;
  categoriesCache = categories;
}

export const KuralService = {
  /**
   * Retrieves all 1330 normalized Kurals
   */
  getAllKurals(): Kural[] {
    initData();
    return kuralsCache!;
  },

  /**
   * Retrieves a single Kural by its 1-based number (1 to 1330)
   */
  getKuralByNumber(num: number): Kural | undefined {
    initData();
    return kuralMapCache!.get(num);
  },

  /**
   * Retrieves all 133 normalized Chapters
   */
  getAllChapters(): Chapter[] {
    initData();
    return chaptersCache!;
  },

  /**
   * Retrieves a single Chapter by its 1-based number (1 to 133)
   */
  getChapterByNumber(num: number): Chapter | undefined {
    initData();
    return chapterMapCache!.get(num);
  },

  /**
   * Retrieves all 3 primary Categories (Arathuppaal, Porutpaal, Kaamathuppaal)
   */
  getAllCategories(): Category[] {
    initData();
    return categoriesCache!;
  },

  /**
   * Retrieves all 10 Kurals that belong to a specific Chapter
   */
  getKuralsByChapter(chapterNumber: number): Kural[] {
    initData();
    const chapter = chapterMapCache!.get(chapterNumber);
    if (!chapter) return [];
    const results: Kural[] = [];
    for (let i = chapter.startKural; i <= chapter.endKural; i++) {
      const k = kuralMapCache!.get(i);
      if (k) results.push(k);
    }
    return results;
  },

  /**
   * Resolves an array of Kural numbers into Kural objects (preserves order)
   */
  getKuralsByNumbers(numbers: number[]): Kural[] {
    initData();
    const kurals: Kural[] = [];
    for (const num of numbers) {
      const k = kuralMapCache!.get(num);
      if (k) kurals.push(k);
    }
    return kurals;
  },

  /**
   * Returns a random Kural from the entire collection
   */
  getRandomKural(): Kural {
    initData();
    const all = kuralsCache!;
    const randomIndex = Math.floor(Math.random() * all.length);
    return all[randomIndex];
  },

  /**
   * Total count of Kurals
   */
  getTotalKuralCount(): number {
    initData();
    return kuralsCache!.length;
  },

  /**
   * Total count of Chapters
   */
  getTotalChapterCount(): number {
    initData();
    return chaptersCache!.length;
  },
};
