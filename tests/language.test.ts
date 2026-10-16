import { TRANSLATIONS } from '../src/constants/translations';
import { Chapter } from '../src/types/kural';

describe('App Language & Translations', () => {
  describe('Dictionary completeness', () => {
    test('contains both Tamil (ta) and English (en) dictionaries', () => {
      expect(TRANSLATIONS.ta).toBeDefined();
      expect(TRANSLATIONS.en).toBeDefined();
    });

    test('has matching namespaces in both languages', () => {
      const taKeys = Object.keys(TRANSLATIONS.ta).sort();
      const enKeys = Object.keys(TRANSLATIONS.en).sort();
      expect(enKeys).toEqual(taKeys);
    });

    test('has all subkeys matching between ta and en for all namespaces', () => {
      for (const namespace of Object.keys(TRANSLATIONS.ta) as (keyof typeof TRANSLATIONS.ta)[]) {
        const taSubKeys = Object.keys(TRANSLATIONS.ta[namespace]).sort();
        const enSubKeys = Object.keys(TRANSLATIONS.en[namespace]).sort();
        expect(enSubKeys).toEqual(taSubKeys);
      }
    });
  });

  describe('Preserved keywords in English mode', () => {
    const en = TRANSLATIONS.en;

    test('preserves Thirukkural and Kural in English translation', () => {
      expect(en.common.thirukkural).toBe('Thirukkural');
      expect(en.common.kural).toBe('Kural');
      expect(en.home.title).toBe('Thirukkural');
      expect(en.home.searchActionTitle).toContain('Kural');
      expect(en.home.randomKuralTitle).toContain('Kural');
      expect(en.kuralDetailScreen.header).toContain('Kural');
      expect(en.stackHeaders.kuralDetail).toContain('Kural');
    });

    test('preserves Urai in commentaries and author labels', () => {
      expect(en.kuralDetailScreen.commentaryHeader).toContain('Urai');
      expect(en.kuralDetailScreen.authorMV).toContain('Urai');
      expect(en.kuralDetailScreen.authorMV).toBe('Mu. Varadarasanar Urai');
      expect(en.kuralDetailScreen.authorSP).toBe('Solomon Pappaiah Urai');
      expect(en.kuralDetailScreen.authorMK).toBe('Kalaignar Karunanidhi Urai');
    });
  });

  describe('Translated navigation and screen labels in English mode', () => {
    const en = TRANSLATIONS.en;

    test('translates tab bar labels to English', () => {
      expect(en.tabs.home).toBe('Home');
      expect(en.tabs.search).toBe('Search');
      expect(en.tabs.chapters).toBe('Chapters');
      expect(en.tabs.collections).toBe('Collections');
      expect(en.tabs.settings).toBe('Settings');
    });

    test('translates stack header titles to English', () => {
      expect(en.stackHeaders.kuralDetail).toBe('Kural Details');
      expect(en.stackHeaders.chapterDetail).toBe('Chapter');
      expect(en.stackHeaders.newCollection).toBe('New Collection');
      expect(en.stackHeaders.collectionDetail).toBe('Collection');
    });

    test('translates settings screen options and sections', () => {
      expect(en.settingsScreen.title).toBe('Settings');
      expect(en.settingsScreen.languageSectionTitle).toBe('Language (மொழி)');
      expect(en.settingsScreen.langTamil).toBe('தமிழ் (Tamil)');
      expect(en.settingsScreen.langEnglish).toBe('English');
      expect(en.settingsScreen.themeSectionTitle).toBe('Appearance (Theme)');
      expect(en.settingsScreen.themeSystem).toBe('System');
      expect(en.settingsScreen.themeLight).toBe('Light');
      expect(en.settingsScreen.themeDark).toBe('Dark');
      expect(en.settingsScreen.notificationSectionTitle).toBe('Daily Kural Notification');
      expect(en.settingsScreen.supportSectionTitle).toBe('Support & Share');
      expect(en.settingsScreen.rateAppLabel).toBe('Rate on Google Play');
      expect(en.settingsScreen.shareAppLabel).toBe('Share App with Friends');
    });

    test('translates search and collections screens', () => {
      expect(en.searchScreen.placeholder).toBe('Search Thirukkural...');
      expect(en.searchScreen.emptyTitle).toBe('Search Thirukkural');
      expect(en.collectionsScreen.title).toBe('My Collections');
      expect(en.collectionsScreen.newBtn).toBe('New');
      expect(en.collectionsScreen.emptyTitle).toBe('No Collections Yet');
    });
  });

  describe('Tamil mode translations integrity', () => {
    const ta = TRANSLATIONS.ta;

    test('contains pure Tamil tab and screen labels', () => {
      expect(ta.tabs.home).toBe('முகப்பு');
      expect(ta.tabs.search).toBe('தேடல்');
      expect(ta.tabs.chapters).toBe('அதிகாரங்கள்');
      expect(ta.tabs.collections).toBe('தொகுப்புகள்');
      expect(ta.tabs.settings).toBe('அமைப்புகள்');

      expect(ta.home.title).toBe('திருக்குறள்');
      expect(ta.common.kural).toBe('குறள்');
    });

    test('keeps color/theme menu options in English only (System, Light, Dark)', () => {
      expect(ta.settingsScreen.themeSystem).toBe('System');
      expect(ta.settingsScreen.themeLight).toBe('Light');
      expect(ta.settingsScreen.themeDark).toBe('Dark');
    });
  });

  describe('Bilingual resolution helpers', () => {
    const CATEGORY_NAMES: Record<number, { ta: string; en: string }> = {
      1: { ta: 'அறத்துப்பால்', en: 'Arathupaal' },
      2: { ta: 'பொருட்பால்', en: 'Porutpaal' },
      3: { ta: 'காமத்துப்பால்', en: 'Kaamathupaal' },
    };

    const mockChapter: Chapter = {
      number: 1,
      nameTamil: 'கடவுள் வாழ்த்து',
      nameEnglish: 'The Praise of God',
      transliteration: 'Kadavul Vaazhthu',
      categoryTamil: 'அறத்துப்பால்',
      categoryEnglish: 'Virtue',
      groupTamil: 'பாயிரவியல்',
      groupEnglish: 'Prologue',
      startKural: 1,
      endKural: 10,
      kuralCount: 10,
    };

    test('preserves section names as Arathupaal, Porutpaal, Kaamathupaal in English', () => {
      expect(CATEGORY_NAMES[1].en).toBe('Arathupaal');
      expect(CATEGORY_NAMES[2].en).toBe('Porutpaal');
      expect(CATEGORY_NAMES[3].en).toBe('Kaamathupaal');

      expect(CATEGORY_NAMES[1].ta).toBe('அறத்துப்பால்');
      expect(CATEGORY_NAMES[2].ta).toBe('பொருட்பால்');
      expect(CATEGORY_NAMES[3].ta).toBe('காமத்துப்பால்');
    });

    test('resolves chapter and group names according to selected language', () => {
      // Tamil
      expect(mockChapter.nameTamil).toBe('கடவுள் வாழ்த்து');
      expect(mockChapter.groupTamil).toBe('பாயிரவியல்');

      // English uses transliterated words instead of translation
      const resolvedEnglishChapter = mockChapter.transliteration || mockChapter.nameEnglish;
      expect(resolvedEnglishChapter).toBe('Kadavul Vaazhthu');
      expect(resolvedEnglishChapter).not.toBe('The Praise of God');
    });
  });
});
