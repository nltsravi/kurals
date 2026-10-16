import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage, AppTranslations, TRANSLATIONS } from '../constants/translations';

export interface LanguageContextType {
  language: AppLanguage;
  isEnglish: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: AppTranslations;
  getCategoryName: (categoryNumber: number, fallbackTamil?: string, fallbackEnglish?: string) => string;
  getChapterName: (chapter: {
    nameTamil: string;
    nameEnglish?: string;
    transliteration?: string;
    chapterTransliteration?: string;
  }) => string;
  getGroupName: (
    group:
      | { nameTamil: string; nameEnglish?: string; transliteration?: string }
      | { groupTamil: string; groupEnglish?: string; transliteration?: string }
  ) => string;
}

export const LANGUAGE_STORAGE_KEY = '@thirukkural_app_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Consistent section names preserving Tamil / English transliteration as requested (Arathupaal, Porutpaal, Kaamathupaal)
const CATEGORY_NAMES: Record<number, { ta: string; en: string }> = {
  1: { ta: 'அறத்துப்பால்', en: 'Arathupaal' },
  2: { ta: 'பொருட்பால்', en: 'Porutpaal' },
  3: { ta: 'காமத்துப்பால்', en: 'Kaamathupaal' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('ta');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (saved === 'ta' || saved === 'en') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (newLang: AppLanguage) => {
    setLanguageState(newLang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  };

  const isEnglish = language === 'en';
  const t = TRANSLATIONS[language];

  const getCategoryName = (
    categoryNumber: number,
    fallbackTamil?: string,
    fallbackEnglish?: string
  ): string => {
    const predefined = CATEGORY_NAMES[categoryNumber];
    if (predefined) {
      return isEnglish ? predefined.en : predefined.ta;
    }
    if (isEnglish) {
      return fallbackEnglish || fallbackTamil || '';
    }
    return fallbackTamil || fallbackEnglish || '';
  };

  const getChapterName = (chapter: {
    nameTamil: string;
    nameEnglish?: string;
    transliteration?: string;
    chapterTransliteration?: string;
  }): string => {
    if (isEnglish) {
      return (
        chapter.transliteration ||
        chapter.chapterTransliteration ||
        chapter.nameEnglish ||
        chapter.nameTamil
      );
    }
    return chapter.nameTamil;
  };

  const getGroupName = (
    group:
      | { nameTamil: string; nameEnglish?: string; transliteration?: string }
      | { groupTamil: string; groupEnglish?: string; transliteration?: string }
  ): string => {
    if (isEnglish) {
      if ('transliteration' in group && group.transliteration) return group.transliteration;
      if ('nameEnglish' in group && group.nameEnglish) return group.nameEnglish;
      if ('groupEnglish' in group && group.groupEnglish) return group.groupEnglish;
    }
    if ('nameTamil' in group) return group.nameTamil;
    if ('groupTamil' in group) return group.groupTamil;
    return '';
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isEnglish,
        setLanguage,
        t,
        getCategoryName,
        getChapterName,
        getGroupName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
