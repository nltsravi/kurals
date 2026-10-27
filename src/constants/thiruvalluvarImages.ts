import { ImageSourcePropType } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThiruvalluvarImageId =
  | 'thiruvalluvar-color'
  | 'thiruvalluvar-bw'
  | 'beach-statue'
  | 'statue'
  | 'hide'
  | 'thiruvalluvar-outline'
  | 'custom';

export const APP_ICON_SOURCE = require('../../assets/images/icon.png');
export const TRADITIONAL_TEMPLATE_BG_SOURCE = require('../../assets/images/templates/traditional_template_bg.png');
export const TRADITIONAL_TEMPLATE_NO_IMAGE_BG_SOURCE = require('../../assets/images/templates/traditional_template_no_image_bg.png');
export const THALIR_LOGO_SOURCE = require('../../assets/images/thalir_kalvikkoodam_icon.png');

export const THIRUVALLUVAR_IMAGE_STORAGE_KEY = '@thirukkural_card_image';
export const CUSTOM_IMAGE_STORAGE_KEY = '@thirukkural_custom_image_uri';
export const ALLOW_MODIFY_CARD_IMAGE_KEY = '@thirukkural_allow_modify_card_image';
export const DEFAULT_THIRUVALLUVAR_IMAGE_ID: ThiruvalluvarImageId = 'thiruvalluvar-color';

export interface CardImageTheme {
  canvasBg: string;
  cardBg: string;
  borderColor: string;
  headerTitleColor: string;
  badgeBg: string;
  badgeText: string;
  imageContainerBg: string;
  imageBorderColor: string;
  heroBg: string;
  heroBorder: string;
  heroAccent: string;
  coupletColor: string;
  commentaryColor: string;
  translationColor: string;
  footerBorder: string;
  footerTextColor: string;
}

export interface ThiruvalluvarImageOption {
  id: ThiruvalluvarImageId;
  nameTamil: string;
  nameEnglish: string;
  descriptionTamil: string;
  descriptionEnglish: string;
  source: ImageSourcePropType;
  resizeMode: 'contain' | 'cover';
  theme: CardImageTheme;
}

export const THIRUVALLUVAR_IMAGES: ThiruvalluvarImageOption[] = [
  {
    id: 'thiruvalluvar-color',
    nameTamil: 'திருவள்ளுவர் (வண்ணம்)',
    nameEnglish: 'Thiruvalluvar (Color)',
    descriptionTamil: 'பாரம்பரிய வண்ண ஓவியம்',
    descriptionEnglish: 'Classic traditional color portrait',
    source: require('../../assets/images/thiruvalluvar/thiruvalluvar-color.png'),
    resizeMode: 'contain',
    theme: {
      canvasBg: '#FAF5EC',
      cardBg: '#FAF5EC',
      borderColor: '#DFD4BD',
      headerTitleColor: '#1E140C',
      badgeBg: '#EFE6D6',
      badgeText: '#1E140C',
      imageContainerBg: '#F3E9D7',
      imageBorderColor: '#DFD4BD',
      heroBg: '#F5EBD9',
      heroBorder: '#E6D7BD',
      heroAccent: '#D97706',
      coupletColor: '#120600',
      commentaryColor: '#261C13',
      translationColor: '#32251A',
      footerBorder: '#EBE2D0',
      footerTextColor: '#7B6C5C',
    },
  },
  {
    id: 'thiruvalluvar-bw',
    nameTamil: 'திருவள்ளுவர் (கருப்பு-வெள்ளை)',
    nameEnglish: 'Thiruvalluvar (B&W)',
    descriptionTamil: 'பாரம்பரிய கருப்பு-வெள்ளை உருவம்',
    descriptionEnglish: 'Classic monochrome heritage portrait',
    source: require('../../assets/images/thiruvalluvar/thiruvalluvar-bw.jpg'),
    resizeMode: 'contain',
    theme: {
      canvasBg: '#F4F5F7',
      cardBg: '#FFFFFF',
      borderColor: '#D1D5DB',
      headerTitleColor: '#111827',
      badgeBg: '#E5E7EB',
      badgeText: '#1F2937',
      imageContainerBg: '#F3F4F6',
      imageBorderColor: '#D1D5DB',
      heroBg: '#F3F4F6',
      heroBorder: '#E5E7EB',
      heroAccent: '#374151',
      coupletColor: '#111827',
      commentaryColor: '#1F2937',
      translationColor: '#374151',
      footerBorder: '#E5E7EB',
      footerTextColor: '#6B7280',
    },
  },
  {
    id: 'beach-statue',
    nameTamil: 'கடற்கரை சிலை (கன்னியாகுமரி)',
    nameEnglish: 'Beach Statue (Kanyakumari)',
    descriptionTamil: 'கடல் நடுவே 133 அடி கம்பீர சிலை',
    descriptionEnglish: 'Majestic 133ft statue at ocean coast',
    source: require('../../assets/images/thiruvalluvar/beach-statue.png'),
    resizeMode: 'cover',
    theme: {
      canvasBg: '#F0F8FA',
      cardBg: '#FFFFFF',
      borderColor: '#BAE6FD',
      headerTitleColor: '#0C4A6E',
      badgeBg: '#E0F2FE',
      badgeText: '#0369A1',
      imageContainerBg: '#E0F2FE',
      imageBorderColor: '#7DD3FC',
      heroBg: '#F0F9FF',
      heroBorder: '#BAE6FD',
      heroAccent: '#0284C7',
      coupletColor: '#082F49',
      commentaryColor: '#0C4A6E',
      translationColor: '#164E63',
      footerBorder: '#BAE6FD',
      footerTextColor: '#0284C7',
    },
  },
  {
    id: 'statue',
    nameTamil: 'வள்ளுவர் சிலை (கன்னியாகுமரி)',
    nameEnglish: 'Thiruvalluvar Statue (Kanyakumari)',
    descriptionTamil: 'பாறைச் சிற்ப கம்பீரம்',
    descriptionEnglish: 'Monumental granite stone statue',
    source: require('../../assets/images/thiruvalluvar/statue.png'),
    resizeMode: 'cover',
    theme: {
      canvasBg: '#FAF5F0',
      cardBg: '#FFFFFF',
      borderColor: '#E7DACB',
      headerTitleColor: '#26160F',
      badgeBg: '#FCE7D8',
      badgeText: '#9A3412',
      imageContainerBg: '#F5ECE1',
      imageBorderColor: '#E7DACB',
      heroBg: '#FAF4ED',
      heroBorder: '#E7DACB',
      heroAccent: '#C2410C',
      coupletColor: '#26160F',
      commentaryColor: '#2E180E',
      translationColor: '#3D2214',
      footerBorder: '#E7DACB',
      footerTextColor: '#9A3412',
    },
  },
  {
    id: 'hide',
    nameTamil: 'செயலி சின்னம் (படம் மறை)',
    nameEnglish: 'App Icon (Hide Image)',
    descriptionTamil: 'திருவள்ளுவர் உருவத்திற்குப் பதில் செயலி சின்னம்',
    descriptionEnglish: 'Show App Icon in place of Thiruvalluvar portrait',
    source: APP_ICON_SOURCE,
    resizeMode: 'contain',
    theme: {
      canvasBg: '#FAF5EC',
      cardBg: '#FAF5EC',
      borderColor: '#DFD4BD',
      headerTitleColor: '#1E140C',
      badgeBg: '#EFE6D6',
      badgeText: '#1E140C',
      imageContainerBg: '#FFEDD5',
      imageBorderColor: '#FED7AA',
      heroBg: '#F5EBD9',
      heroBorder: '#E6D7BD',
      heroAccent: '#EA580C',
      coupletColor: '#120600',
      commentaryColor: '#261C13',
      translationColor: '#32251A',
      footerBorder: '#EBE2D0',
      footerTextColor: '#7B6C5C',
    },
  },
];

/**
 * Returns the matching ThiruvalluvarImageOption for an ID, defaulting to 'thiruvalluvar-color'.
 */
export function getThiruvalluvarImage(id?: string | null): ThiruvalluvarImageOption {
  if (id === 'thiruvalluvar-outline') {
    const hideOpt = THIRUVALLUVAR_IMAGES.find((img) => img.id === 'hide');
    if (hideOpt) return hideOpt;
  }
  const match = THIRUVALLUVAR_IMAGES.find((img) => img.id === id);
  return match || THIRUVALLUVAR_IMAGES[0];
}

/**
 * Loads the saved Thiruvalluvar image ID from AsyncStorage.
 */
export async function getSavedCardImageId(): Promise<ThiruvalluvarImageId> {
  try {
    const saved = await AsyncStorage.getItem(THIRUVALLUVAR_IMAGE_STORAGE_KEY);
    if (
      saved === 'thiruvalluvar-color' ||
      saved === 'thiruvalluvar-bw' ||
      saved === 'beach-statue' ||
      saved === 'statue' ||
      saved === 'hide' ||
      saved === 'custom'
    ) {
      return saved as ThiruvalluvarImageId;
    }
  } catch (e) {
    console.error('Failed to load card image preference:', e);
  }
  return DEFAULT_THIRUVALLUVAR_IMAGE_ID;
}

/**
 * Saves the selected Thiruvalluvar image ID to AsyncStorage.
 */
export async function saveCardImageId(id: ThiruvalluvarImageId): Promise<void> {
  try {
    await AsyncStorage.setItem(THIRUVALLUVAR_IMAGE_STORAGE_KEY, id);
  } catch (e) {
    console.error('Failed to save card image preference:', e);
  }
}

/**
 * Loads the saved custom image URI from AsyncStorage.
 */
export async function getSavedCustomImageUri(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CUSTOM_IMAGE_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to load custom image URI:', e);
    return null;
  }
}

/**
 * Saves the selected custom image URI to AsyncStorage.
 */
export async function saveCustomImageUri(uri: string | null): Promise<void> {
  try {
    if (uri) {
      await AsyncStorage.setItem(CUSTOM_IMAGE_STORAGE_KEY, uri);
    } else {
      await AsyncStorage.removeItem(CUSTOM_IMAGE_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save custom image URI:', e);
  }
}

/**
 * Loads the setting that determines whether modifying/adding card images is enabled.
 * Default is false (off).
 */
export async function getSavedAllowModifyCardImage(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(ALLOW_MODIFY_CARD_IMAGE_KEY);
    return saved === 'true';
  } catch (e) {
    console.error('Failed to load allow modify card image preference:', e);
    return false;
  }
}

/**
 * Saves the setting that determines whether modifying/adding card images is enabled.
 */
export async function saveAllowModifyCardImage(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ALLOW_MODIFY_CARD_IMAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save allow modify card image preference:', e);
  }
}
