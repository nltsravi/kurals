export type AppLanguage = 'ta' | 'en';

export interface AppTranslations {
  common: {
    kural: string;
    thirukkural: string;
    chapters: string;
    collections: string;
    sections: string;
    search: string;
    settings: string;
    back: string;
    cancel: string;
    delete: string;
    save: string;
    create: string;
    share: string;
    export: string;
    copy: string;
    both: string;
    translit: string;
    offline: string;
  };
  tabs: {
    home: string;
    search: string;
    chapters: string;
    collections: string;
    settings: string;
  };
  stackHeaders: {
    kuralDetail: string;
    chapterDetail: string;
    newCollection: string;
    collectionDetail: string;
  };
  home: {
    title: string;
    subTitle: string;
    tagline: string;
    searchPlaceholder: string;
    searchBadge: string;
    searchActionTitle: string;
    searchActionSub: string;
    browseActionTitle: string;
    browseActionSub: string;
    collectionsActionTitle: string;
    collectionsActionSub: string;
    randomKuralTitle: string;
    viewKural: string;
    muppaalTitle: string;
    viewAll: string;
    chapterCountSuffix: string;
  };
  searchScreen: {
    placeholder: string;
    searching: string;
    emptyTitle: string;
    emptyDesc: string;
    noResultsTitle: string;
    noResultsDesc: string;
    resultsFound: string;
    singleResultFound: string;
  };
  chaptersScreen: {
    sectionPrefix: string;
    groupPrefix: string;
    chaptersSuffix: string;
    kuralsRange: string;
  };
  collectionsScreen: {
    title: string;
    subtitle: string;
    newBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    deleteTitle: string;
    deleteConfirm: string;
    emptyCollectionTitle: string;
    emptyCollectionDesc: string;
  };
  createCollectionScreen: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    colorLabel: string;
    createBtn: string;
  };
  collectionDetailScreen: {
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    deleteTitle: string;
    deleteConfirm: string;
    removeKuralTitle: string;
    removeKuralConfirm: string;
    editTitle: string;
  };
  kuralDetailScreen: {
    header: string;
    transliterationHeader: string;
    translationHeader: string;
    commentaryHeader: string;
    structureHeader: string;
    categoryLabel: string;
    groupLabel: string;
    chapterLabel: string;
    kuralNumberLabel: string;
    ofTotal: string;
    prevKural: string;
    nextKural: string;
    shareKural: string;
    exportDoc: string;
    copyTamil: string;
    copyTranslit: string;
    copyBoth: string;
    toastTamilCopied: string;
    toastTranslitCopied: string;
    toastBothCopied: string;
    authorMV: string;
    authorSP: string;
    authorMK: string;
    authorPRM: string;
    authorMNK: string;
  };
  chapterDetailScreen: {
    chapterPrefix: string;
    prevChapter: string;
    nextChapter: string;
    exportChapter: string;
    notFound: string;
    goBack: string;
  };
  settingsScreen: {
    title: string;
    subtitle: string;
    languageSectionTitle: string;
    languageSectionSubtitle: string;
    langTamil: string;
    langEnglish: string;
    themeSectionTitle: string;
    themeSectionSubtitle: string;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
    cardImageSectionTitle: string;
    cardImageSectionSubtitle: string;
    notificationSectionTitle: string;
    notificationSectionSubtitle: string;
    scheduledTimeLabel: string;
    testNotificationLabel: string;
    testNotificationSubtitle: string;
    supportSectionTitle: string;
    rateAppLabel: string;
    rateAppSubtitle: string;
    shareAppLabel: string;
    shareAppSubtitle: string;
    privacySectionTitle: string;
    privacyPolicyLabel: string;
    privacyPolicySubtitle: string;
    dataSafetyLabel: string;
    dataSafetySubtitle: string;
    dataSectionTitle: string;
    offlineLabel: string;
    offlineValue: string;
    datasetLabel: string;
    datasetValue: string;
    commentariesLabel: string;
    commentariesValue: string;
    aboutSectionTitle: string;
    buildNumberLabel: string;
    copyrightLabel: string;
    testNoticeSent: string;
    testNoticeDesc: string;
    buildNumberAlertTitle: string;
    buildNumberCopiedMsg: string;
    addCustomImageBtn: string;
    customImageDesc: string;
    removeCustomImage: string;
  };
  shareModal: {
    title: string;
    tabImage: string;
    tabText: string;
    selectMeaningTitle: string;
    selectImageTitle: string;
    shareImageHero: string;
    imageCreating: string;
    shareGridImageTitle: string;
    shareGridTextTitle: string;
    quickCopyTextBtnTitle: string;
    quickCopyTextBtnSub: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, AppTranslations> = {
  ta: {
    common: {
      kural: 'குறள்',
      thirukkural: 'திருக்குறள்',
      chapters: 'அதிகாரங்கள்',
      collections: 'தொகுப்புகள்',
      sections: 'முப்பால்',
      search: 'தேடல்',
      settings: 'அமைப்புகள்',
      back: 'பின்னே',
      cancel: 'ரத்து செய்',
      delete: 'நீக்கு',
      save: 'சேமி',
      create: 'உருவாக்கு',
      share: 'பகிர்',
      export: 'ஏற்றுமதி',
      copy: 'நகலெடு',
      both: 'இரண்டும்',
      translit: 'எழுத்துப்பெயர்ப்பு',
      offline: 'ஆஃப்லைன்',
    },
    tabs: {
      home: 'முகப்பு',
      search: 'தேடல்',
      chapters: 'அதிகாரங்கள்',
      collections: 'தொகுப்புகள்',
      settings: 'அமைப்புகள்',
    },
    stackHeaders: {
      kuralDetail: 'குறள் விவரம்',
      chapterDetail: 'அதிகாரம்',
      newCollection: 'புதிய தொகுப்பு',
      collectionDetail: 'தொகுப்பு',
    },
    home: {
      title: 'திருக்குறள்',
      subTitle: 'Thirukkural',
      tagline: '133 அதிகாரங்கள் • 1330 அருங்குறள்கள் • உலகப் பொதுமறை',
      searchPlaceholder: 'திருக்குறள் தேடுக...',
      searchBadge: 'குறள்',
      searchActionTitle: 'Search Kural',
      searchActionSub: 'தேடல்',
      browseActionTitle: 'Browse',
      browseActionSub: 'அதிகாரங்கள்',
      collectionsActionTitle: 'Collections',
      collectionsActionSub: 'தொகுப்புகள்',
      randomKuralTitle: 'இன்றைய குறள்',
      viewKural: 'குறளைக் காண்க',
      muppaalTitle: 'முப்பால் (Categories)',
      viewAll: 'அனைத்தும் →',
      chapterCountSuffix: 'அதிகாரங்கள்',
    },
    searchScreen: {
      placeholder: 'திருக்குறள் தேடுக...',
      searching: 'குறள்கள் தேடப்படுகின்றன...',
      emptyTitle: 'திருக்குறள் தேடல்',
      emptyDesc: 'குறள் எண், சொல், அதிகாரம் அல்லது பொருள் கொண்டு தேடுங்கள்.',
      noResultsTitle: 'குறள்கள் கிடைக்கவில்லை',
      noResultsDesc: 'குறள் எண் (1-1330) அல்லது வேறு சொல்லை உள்ளிட்டு தேடவும்.',
      resultsFound: 'குறள்கள் உள்ளன',
      singleResultFound: 'குறள் உள்ளது',
    },
    chaptersScreen: {
      sectionPrefix: 'பால்',
      groupPrefix: 'இயல்',
      chaptersSuffix: 'அதிகாரங்கள்',
      kuralsRange: 'குறள்கள்',
    },
    collectionsScreen: {
      title: 'என் தொகுப்புகள்',
      subtitle: 'தொகுப்புகள்',
      newBtn: 'புதியது',
      emptyTitle: 'தொகுப்புகள் எதுவும் இல்லை',
      emptyDesc: 'உங்களுக்குப் பிடித்த குறள்களைத் தனிப்பயன் தொகுப்புகளாகச் சேமிக்கவும்.',
      deleteTitle: 'தொகுப்பை நீக்கு',
      deleteConfirm: 'இந்தத் தொகுப்பை நீக்க விரும்புகிறீர்களா?',
      emptyCollectionTitle: 'வெற்றுத் தொகுப்பு',
      emptyCollectionDesc: 'ஏற்றுமதி செய்வதற்கு முன் சில குறள்களைச் சேர்க்கவும்.',
    },
    createCollectionScreen: {
      title: 'புதிய தொகுப்பு',
      nameLabel: 'தொகுப்பின் பெயர்',
      namePlaceholder: 'எ.கா. பிடித்த குறள்கள், தேர்வுத் தயாரிப்பு',
      descLabel: 'விளக்கம் (விருப்பத்தேர்வு)',
      descPlaceholder: 'இந்தத் தொகுப்பு பற்றிய குறிப்பு',
      colorLabel: 'வண்ணம்',
      createBtn: 'உருவாக்கு',
    },
    collectionDetailScreen: {
      subtitle: 'குறள்கள்',
      emptyTitle: 'குறள்கள் இல்லை',
      emptyDesc: 'இந்தத் தொகுப்பில் இன்னும் குறள்கள் சேர்க்கப்படவில்லை.',
      deleteTitle: 'தொகுப்பை நீக்கு',
      deleteConfirm: 'இந்தத் தொகுப்பை நிச்சயமாக நீக்க வேண்டுமா?',
      removeKuralTitle: 'குறளை நீக்கு',
      removeKuralConfirm: 'இந்தக் குறளைத் தொகுப்பிலிருந்து நீக்கவா?',
      editTitle: 'பெயரை மாற்று',
    },
    kuralDetailScreen: {
      header: 'குறள் விவரம்',
      transliterationHeader: 'ஆங்கில ஒலிபெயர்ப்பு',
      translationHeader: 'ஆங்கில மொழிபெயர்ப்பு',
      commentaryHeader: 'உரைகள்',
      structureHeader: 'அமைப்பு விவரங்கள்',
      categoryLabel: 'பால்',
      groupLabel: 'இயல்',
      chapterLabel: 'அதிகாரம்',
      kuralNumberLabel: 'குறள் எண்',
      ofTotal: 'இல் 1330',
      prevKural: 'முந்தைய குறள்',
      nextKural: 'அடுத்த குறள்',
      shareKural: 'குறளைப் பகிர்',
      exportDoc: 'ஏற்றுமதி செய்',
      copyTamil: 'குறள் நகல்',
      copyTranslit: 'ஒலிபெயர்ப்பு',
      copyBoth: 'இரண்டும்',
      toastTamilCopied: 'குறள் நகலெடுக்கப்பட்டது!',
      toastTranslitCopied: 'ஒலிபெயர்ப்பு நகலெடுக்கப்பட்டது!',
      toastBothCopied: 'குறளும் ஒலிபெயர்ப்பும் நகலெடுக்கப்பட்டது!',
      authorMV: 'மு. வரதராசனார் உரை',
      authorSP: 'சாலமன் பாப்பையா உரை',
      authorMK: 'கலைஞர் மு. கருணாநிதி உரை',
      authorPRM: 'பரிமேலழகர் உரை',
      authorMNK: 'மணக்குடவர் உரை',
    },
    chapterDetailScreen: {
      chapterPrefix: 'அதிகாரம்',
      prevChapter: 'முந்தைய அதிகாரம்',
      nextChapter: 'அடுத்த அதிகாரம்',
      exportChapter: 'ஏற்றுமதி செய்',
      notFound: 'அதிகாரம் கிடைக்கவில்லை',
      goBack: 'பின்னே செல்',
    },
    settingsScreen: {
      title: 'அமைப்புகள்',
      subtitle: 'Settings & About',
      languageSectionTitle: 'பயன்பாட்டு மொழி',
      languageSectionSubtitle: 'செயலியின் மொழியைத் தேர்ந்தெடுக்கவும்',
      langTamil: 'தமிழ்',
      langEnglish: 'English',
      themeSectionTitle: 'வண்ண அமைப்பு',
      themeSectionSubtitle: 'பயன்படுத்த விரும்பும் வண்ண அமைப்பைத் தேர்ந்தெடுக்கவும்',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      cardImageSectionTitle: 'பகிர்வு & ஸ்டேட்டஸ் படம்',
      cardImageSectionSubtitle: 'சமூக ஊடகங்கள் மற்றும் ஸ்டேட்டஸ் பகிர்வுக்கான திருவள்ளுவர் படம் & வண்ணத் தீம்',
      notificationSectionTitle: 'தினசரி குறள் அறிவிப்பு',
      notificationSectionSubtitle: 'தினமும் ஒரு திருக்குறளை உரைகளுடன் அறிவிப்பாகப் பெறுக',
      scheduledTimeLabel: 'அறிவிப்பு நேரம்',
      testNotificationLabel: 'உடனடி சோதனை அறிவிப்பு',
      testNotificationSubtitle: 'சீரற்ற குறள் அறிவிப்பை இப்போதே உங்கள் சாதனத்தில் சோதிக்கவும்',
      supportSectionTitle: 'ஆதரவு & பகிர்வு',
      rateAppLabel: 'மதிப்பீடு செய்ய',
      rateAppSubtitle: '5-நட்சத்திர மதிப்பீட்டின் மூலம் பிறருக்குப் பகிருங்கள்',
      shareAppLabel: 'நண்பர்களுடன் பகிர',
      shareAppSubtitle: 'இந்த விளம்பரமற்ற திருக்குறள் செயலியை மற்றவர்களுடன் பகிருங்கள்',
      privacySectionTitle: 'தனியுரிமை & பாதுகாப்பு',
      privacyPolicyLabel: 'தனியுரிமைக் கொள்கை',
      privacyPolicySubtitle: 'எந்தத் தரவும் சேகரிக்கப்படுவதில்லை • 100% விளம்பரமற்றது',
      dataSafetyLabel: 'Google Play Data Safety',
      dataSafetySubtitle: 'தனிப்பட்ட தரவு எதுவும் பகிரப்படுவதில்லை. அனைத்தும் உங்கள் சாதனத்திலேயே உள்ளன.',
      dataSectionTitle: 'தரவு மற்றும் ஆஃப்லைன்',
      offlineLabel: '100% Offline-First',
      offlineValue: 'இணையம் இன்றி முற்றிலும் இயங்கும். அனைத்து 1,330 குறள்களும் சாதனத்திலேயே உள்ளன.',
      datasetLabel: 'அமைப்புத் தகவல்',
      datasetValue: '3 பால் • 133 அதிகாரங்கள் • 1,330 குறள்கள்',
      commentariesLabel: 'சேர்க்கப்பட்டுள்ள உரைகள்',
      commentariesValue: 'மு. வரதராசனார் உரை, சாலமன் பாப்பையா உரை, கலைஞர் மு.க உரை & ஜி.யு. போப் ஆங்கில உரை',
      aboutSectionTitle: 'செயலி பற்றி',
      buildNumberLabel: 'கட்டமைப்பு எண்',
      copyrightLabel: 'பதிப்புரிமை',
      testNoticeSent: 'சோதனை அறிவிப்பு அனுப்பப்பட்டது!',
      testNoticeDesc: 'உங்கள் அறிவிப்புப் பட்டியைச் சரிபார்க்கவும்.',
      buildNumberAlertTitle: 'கட்டமைப்பு எண்',
      buildNumberCopiedMsg: 'நகலெடுக்கப்பட்டது:',
      addCustomImageBtn: 'உங்கள் படம் சேர்க்க',
      customImageDesc: 'உங்கள் சாதனத்திலிருந்து படம் தேர்வு செய்க',
      removeCustomImage: 'படத்தை நீக்கு',
    },
    shareModal: {
      title: 'குறள் பகிர்வு',
      tabImage: 'படம்',
      tabText: 'உரை',
      selectMeaningTitle: 'உரை தேர்வு',
      selectImageTitle: 'திருவள்ளுவர் படம் தேர்வு',
      shareImageHero: 'படம் பகிர்',
      imageCreating: 'படம் உருவாக்கப்படுகிறது...',
      shareGridImageTitle: 'படத்தை பகிர',
      shareGridTextTitle: 'உரையை பகிர',
      quickCopyTextBtnTitle: 'குறள் உரையை நகலெடு',
      quickCopyTextBtnSub: '(நகலெடு)',
    },
  },
  en: {
    common: {
      kural: 'Kural',
      thirukkural: 'Thirukkural',
      chapters: 'Chapters',
      collections: 'Collections',
      sections: 'Sections',
      search: 'Search',
      settings: 'Settings',
      back: 'Back',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      create: 'Create',
      share: 'Share',
      export: 'Export',
      copy: 'Copy',
      both: 'Both',
      translit: 'Translit',
      offline: 'Offline',
    },
    tabs: {
      home: 'Home',
      search: 'Search',
      chapters: 'Chapters',
      collections: 'Collections',
      settings: 'Settings',
    },
    stackHeaders: {
      kuralDetail: 'Kural Details',
      chapterDetail: 'Chapter',
      newCollection: 'New Collection',
      collectionDetail: 'Collection',
    },
    home: {
      title: 'Thirukkural',
      subTitle: 'திருக்குறள்',
      tagline: '133 Chapters • 1330 Kurals • Universal Wisdom',
      searchPlaceholder: 'Search Thirukkural...',
      searchBadge: 'Kural',
      searchActionTitle: 'Search Kural',
      searchActionSub: 'Quick Search',
      browseActionTitle: 'Browse',
      browseActionSub: 'All Chapters',
      collectionsActionTitle: 'Collections',
      collectionsActionSub: 'Saved Kurals',
      randomKuralTitle: 'Kural of the Day',
      viewKural: 'View Kural',
      muppaalTitle: 'Muppaal (Sections)',
      viewAll: 'View All →',
      chapterCountSuffix: 'Chapters',
    },
    searchScreen: {
      placeholder: 'Search Thirukkural...',
      searching: 'Searching Kurals...',
      emptyTitle: 'Search Thirukkural',
      emptyDesc: 'Find any Kural by number, Tamil phrase, English transliteration, chapter, or category.',
      noResultsTitle: 'No Kurals found',
      noResultsDesc: 'Try searching with a Kural number (1-1330), chapter name, category, or keyword.',
      resultsFound: 'Kurals found',
      singleResultFound: 'Kural found',
    },
    chaptersScreen: {
      sectionPrefix: 'Section',
      groupPrefix: 'Group',
      chaptersSuffix: 'Chapters',
      kuralsRange: 'Kurals',
    },
    collectionsScreen: {
      title: 'My Collections',
      subtitle: 'Collections',
      newBtn: 'New',
      emptyTitle: 'No Collections Yet',
      emptyDesc: 'Save and organize your favorite Kurals into custom personal collections.',
      deleteTitle: 'Delete Collection',
      deleteConfirm: 'Are you sure you want to delete this collection?',
      emptyCollectionTitle: 'Empty Collection',
      emptyCollectionDesc: 'Add some Kurals to this collection before exporting.',
    },
    createCollectionScreen: {
      title: 'New Collection',
      nameLabel: 'Collection Name',
      namePlaceholder: 'e.g. My Favorite Kurals, Exam Prep',
      descLabel: 'Description (Optional)',
      descPlaceholder: 'Brief note about this collection',
      colorLabel: 'Accent Color',
      createBtn: 'Create Collection',
    },
    collectionDetailScreen: {
      subtitle: 'Kurals',
      emptyTitle: 'No Kurals in this collection',
      emptyDesc: 'Browse Kurals and tap bookmark to add them here.',
      deleteTitle: 'Delete Collection',
      deleteConfirm: 'Are you sure you want to delete this collection? This cannot be undone.',
      removeKuralTitle: 'Remove Kural',
      removeKuralConfirm: 'Remove this Kural from the collection?',
      editTitle: 'Edit Title',
    },
    kuralDetailScreen: {
      header: 'Kural Details',
      transliterationHeader: 'English Transliteration',
      translationHeader: 'English Translation',
      commentaryHeader: 'Urai (Commentaries)',
      structureHeader: 'Structure Details',
      categoryLabel: 'Category (Paal)',
      groupLabel: 'Group (Iyal)',
      chapterLabel: 'Chapter (Adhigaram)',
      kuralNumberLabel: 'Kural Number',
      ofTotal: 'of 1330',
      prevKural: 'Previous Kural',
      nextKural: 'Next Kural',
      shareKural: 'Share Kural',
      exportDoc: 'Export Document',
      copyTamil: 'Copy Tamil',
      copyTranslit: 'Translit',
      copyBoth: 'Both',
      toastTamilCopied: 'Tamil text copied!',
      toastTranslitCopied: 'Transliteration copied!',
      toastBothCopied: 'Tamil & Transliteration copied!',
      authorMV: 'Mu. Varadarasanar Urai',
      authorSP: 'Solomon Pappaiah Urai',
      authorMK: 'Kalaignar Karunanidhi Urai',
      authorPRM: 'Parimelazhagar Urai',
      authorMNK: 'Manakkudavar Urai',
    },
    chapterDetailScreen: {
      chapterPrefix: 'Chapter',
      prevChapter: 'Previous Chapter',
      nextChapter: 'Next Chapter',
      exportChapter: 'Export Chapter',
      notFound: 'Chapter not found',
      goBack: 'Go Back',
    },
    settingsScreen: {
      title: 'Settings',
      subtitle: 'Settings & About',
      languageSectionTitle: 'Language (மொழி)',
      languageSectionSubtitle: 'Choose your preferred app display language',
      langTamil: 'தமிழ் (Tamil)',
      langEnglish: 'English',
      themeSectionTitle: 'Appearance (Theme)',
      themeSectionSubtitle: 'Choose your preferred reading color scheme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      cardImageSectionTitle: 'Social Share & Status Image',
      cardImageSectionSubtitle: 'Choose the Thiruvalluvar image and color theme for your status and social cards',
      notificationSectionTitle: 'Daily Kural Notification',
      notificationSectionSubtitle: 'Receive a random Thirukkural with Tamil & English commentaries daily',
      scheduledTimeLabel: 'Scheduled Time',
      testNotificationLabel: 'Test Notification Now',
      testNotificationSubtitle: 'Preview a random couplet notification right now on your device',
      supportSectionTitle: 'Support & Share',
      rateAppLabel: 'Rate on Google Play',
      rateAppSubtitle: 'Help others discover Tamil wisdom with a 5-star review',
      shareAppLabel: 'Share App with Friends',
      shareAppSubtitle: 'Share this ad-free Thirukkural app with friends & family',
      privacySectionTitle: 'Privacy & Data Safety',
      privacyPolicyLabel: 'Privacy Policy',
      privacyPolicySubtitle: 'Zero data collected • 100% private & ad-free',
      dataSafetyLabel: 'Google Play Data Safety',
      dataSafetySubtitle: 'No personal data collected or shared. Your collections stay on your device.',
      dataSectionTitle: 'Data & Offline',
      offlineLabel: '100% Offline-First',
      offlineValue: 'Works completely without internet. All 1,330 Kurals are bundled on your device.',
      datasetLabel: 'Dataset Content',
      datasetValue: '3 Sections (Paal) • 133 Chapters • 1,330 Kurals',
      commentariesLabel: 'Commentaries Included',
      commentariesValue: 'Mu. Varadarajan Urai, Solomon Pappaiah Urai, Kalaignar Karunanidhi Urai, & G.U. Pope Couplet',
      aboutSectionTitle: 'About App',
      buildNumberLabel: 'Build Number',
      copyrightLabel: 'Copyright',
      testNoticeSent: 'Test notification scheduled!',
      testNoticeDesc: 'Check your notification shade now.',
      buildNumberAlertTitle: 'Build Number',
      buildNumberCopiedMsg: 'Copied to clipboard:',
      addCustomImageBtn: 'Add Custom Photo',
      customImageDesc: 'Choose a photo from your device photo library',
      removeCustomImage: 'Remove Photo',
    },
    shareModal: {
      title: 'Share Kural',
      tabImage: 'Image Card',
      tabText: 'Text Format',
      selectMeaningTitle: 'Select Urai / Commentary',
      selectImageTitle: 'Select Thiruvalluvar Image',
      shareImageHero: 'Share Image Card',
      imageCreating: 'Generating image...',
      shareGridImageTitle: 'Share Image to Social Apps',
      shareGridTextTitle: 'Share Text to Social Apps',
      quickCopyTextBtnTitle: 'Copy Kural Text',
      quickCopyTextBtnSub: '(குறள் உரையை நகலெடு)',
    },
  },
};
