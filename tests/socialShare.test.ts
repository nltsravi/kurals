import { KuralService } from '../src/services/kuralService';
import { ShareService } from '../src/services/shareService';
import { formatKuralForSocialShare } from '../src/utils/text';
import { Linking, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

describe('Social Media Sharing Features', () => {
  const kural1 = KuralService.getKuralByNumber(1)!;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatKuralForSocialShare', () => {
    test('formats Kural with Dr. Mu. Varadarasanar meaning by default', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'mv' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain(kural1.line1);
      expect(text).toContain(kural1.line2);
      expect(text).toContain('பொருள் (மு. வரதராசனார்):');
      expect(text).toContain(kural1.commentaryMV);
      expect(text).toContain('#திருக்குறள் #Thirukkural');
    });

    test('formats Kural with Solomon Pappaiah commentary', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'sp' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain('பொருள் (சாலமன் பாப்பையா):');
      expect(text).toContain(kural1.commentarySP);
    });

    test('formats Kural with Kalaignar Karunanidhi commentary', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'mk' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain('பொருள் (கலைஞர் உரை):');
      expect(text).toContain(kural1.commentaryMK);
    });

    test('formats Kural with English translation', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'translation' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain('Meaning (English):');
      expect(text).toContain(kural1.translation);
      expect(text).not.toContain('பொருள் (மு. வரதராசனார்):');
    });

    test('formats Kural with both Tamil commentary and English translation', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'both' });

      expect(text).toContain('பொருள் (மு. வரதராசனார்):');
      expect(text).toContain(kural1.commentaryMV);
      expect(text).toContain('Meaning (English):');
      expect(text).toContain(kural1.translation);
    });

    test('includes transliteration when requested', () => {
      const withoutTranslit = formatKuralForSocialShare(kural1, {
        includeTransliteration: false,
      });
      expect(withoutTranslit).not.toContain(kural1.transliteration);

      const withTranslit = formatKuralForSocialShare(kural1, {
        includeTransliteration: true,
      });
      expect(withTranslit).toContain(kural1.transliteration);
    });

    test('toggles hashtags cleanly', () => {
      const withTags = formatKuralForSocialShare(kural1, { includeHashtags: true });
      expect(withTags).toContain('#திருக்குறள்');

      const withoutTags = formatKuralForSocialShare(kural1, { includeHashtags: false });
      expect(withoutTags).not.toContain('#திருக்குறள்');
    });

    test('includes chapter and category metadata in header', () => {
      const text = formatKuralForSocialShare(kural1, { includeStructure: true });
      expect(text).toContain('கடவுள் வாழ்த்து');
      expect(text).toContain('அறத்துப்பால்');
    });
  });

  describe('ShareService Social Platforms', () => {
    test('shares to WhatsApp Status and copies to clipboard with status message', async () => {
      const result = await ShareService.shareToWhatsAppStatus('Test Kural Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('whatsapp_status');
      expect(result.message).toContain('My Status');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Kural Text');
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp://send?text=Test%20Kural%20Text')
      );
    });

    test('shares to WhatsApp chat', async () => {
      const result = await ShareService.shareToWhatsApp('Test Kural Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('whatsapp');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Kural Text');
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp://send?text=Test%20Kural%20Text')
      );
    });

    test('shares to Twitter / X with intent URL', async () => {
      const result = await ShareService.shareToTwitter('Test Tweet Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('twitter');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Tweet Text');
      expect(Linking.openURL).toHaveBeenCalled();
    });

    test('shares to Threads with intent URL', async () => {
      const result = await ShareService.shareToThreads('Test Threads Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('threads');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Threads Text');
      expect(Linking.openURL).toHaveBeenCalled();
    });

    test('shares to Facebook by copying text and opening sharer/app', async () => {
      const result = await ShareService.shareToFacebook('Test Facebook Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('facebook');
      expect(result.message).toContain('Facebook');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Facebook Text');
      expect(Linking.openURL).toHaveBeenCalled();
    });

    test('shares to Instagram by copying text and opening app', async () => {
      const result = await ShareService.shareToInstagram('Test Instagram Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('instagram');
      expect(result.message).toContain('Instagram');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Test Instagram Text');
      expect(Linking.openURL).toHaveBeenCalled();
    });

    test('dispatches shareToPlatform correctly for all platforms', async () => {
      const platforms: Array<any> = [
        'whatsapp',
        'whatsapp_status',
        'twitter',
        'threads',
        'facebook',
        'instagram',
      ];

      for (const platform of platforms) {
        const result = await ShareService.shareToPlatform(platform, 'Sample Text');
        expect(result.success).toBe(true);
        expect(result.platform).toBe(platform);
      }
    });

    test('shareKuralToPlatform formats Kural and shares to specified platform', async () => {
      const result = await ShareService.shareKuralToPlatform('twitter', kural1, {
        meaningType: 'translation',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('twitter');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        expect.stringContaining(kural1.translation)
      );
    });

    test('shares via native Share dialog when platform is native', async () => {
      const result = await ShareService.shareToPlatform('native', 'Sample Text');

      expect(result.success).toBe(true);
      expect(result.platform).toBe('native');
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample Text' }),
        expect.anything()
      );
    });
  });
});
