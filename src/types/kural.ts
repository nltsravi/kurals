export interface RawKuralItem {
  Number: number;
  Line1: string;
  Line2: string;
  Translation: string;
  mv?: string;
  sp?: string;
  mk?: string;
  explanation?: string;
  couplet?: string;
  transliteration1?: string;
  transliteration2?: string;
  // Optional metadata if enriched
  chapter?: string;
  chapterNumber?: number;
  category?: string;
}

export interface RawThirukkuralDataset {
  kural: RawKuralItem[];
  repo?: string;
}

export interface RawDetailChapter {
  name: string;
  translation: string;
  transliteration: string;
  number: number;
  start: number;
  end: number;
}

export interface RawDetailChapterGroup {
  name: string;
  transliteration: string;
  translation: string;
  number: number;
  chapters: {
    tamil: string;
    detail: RawDetailChapter[];
  };
}

export interface RawDetailSection {
  name: string;
  transliteration: string;
  translation: string;
  number: number;
  chapterGroup: {
    tamil: string;
    detail: RawDetailChapterGroup[];
  };
}

export interface RawDetailRoot {
  tamil: string;
  section: {
    tamil: string;
    detail: RawDetailSection[];
  };
}

export interface Chapter {
  number: number;
  nameTamil: string;
  nameEnglish: string;
  transliteration: string;
  startKural: number;
  endKural: number;
  kuralCount: number;
  groupTamil: string;
  groupEnglish: string;
  categoryTamil: string;
  categoryEnglish: string;
}

export interface ChapterGroup {
  number: number;
  nameTamil: string;
  nameEnglish: string;
  transliteration: string;
  categoryTamil: string;
  categoryEnglish: string;
  chapters: Chapter[];
}

export interface Category {
  number: number;
  nameTamil: string;
  nameEnglish: string;
  transliteration: string;
  chapterGroups: ChapterGroup[];
  chapters: Chapter[];
  kuralCount: number;
}

export interface Kural {
  number: number;
  line1: string;
  line2: string;
  tamil: string;
  transliteration1: string;
  transliteration2: string;
  transliteration: string;
  translation: string;
  couplet: string;
  explanation: string;
  commentaryMV: string;
  commentarySP: string;
  commentaryMK: string;
  chapterNumber: number;
  chapterNameTamil: string;
  chapterNameEnglish: string;
  chapterTransliteration: string;
  chapterGroupTamil: string;
  chapterGroupEnglish: string;
  categoryTamil: string;
  categoryEnglish: string;
}

export interface SearchRecord {
  kural: Kural;
  normalizedNumber: string;
  normalizedLine1: string;
  normalizedLine2: string;
  normalizedTamil: string;
  normalizedTransliteration: string;
  normalizedChapterTamil: string;
  normalizedChapterEnglish: string;
  normalizedChapterTransliteration: string;
  normalizedChapterNumber: string;
  normalizedCategoryTamil: string;
  normalizedCategoryEnglish: string;
  normalizedTranslation: string;
  normalizedCouplet: string;
}

export interface SearchFilter {
  category?: string;
  chapterNumber?: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  kuralNumbers: number[];
  createdAt: string;
  updatedAt: string;
  icon?: string;
  color?: string;
}

export type ExportFormat = 'pdf' | 'docx';
