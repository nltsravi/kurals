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

    test('formats Kural with Parimelazhagar commentary', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'prm' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain('பொருள் (பரிமேலழகர் உரை):');
      expect(text).toContain(kural1.commentaryPRM);
    });

    test('formats Kural with Manakudavar commentary', () => {
      const text = formatKuralForSocialShare(kural1, { meaningType: 'mnk' });

      expect(text).toContain('குறள் 1');
      expect(text).toContain('பொருள் (மணக்குடவர் உரை):');
      expect(text).toContain(kural1.commentaryMNK);
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

    test('shares image file using expo-sharing', async () => {
      const Sharing = require('expo-sharing');
      const result = await ShareService.shareImage('file:///tmp/kural-card.png', 'Test Title');

      expect(result).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file:///tmp/kural-card.png',
        expect.objectContaining({
          mimeType: 'image/png',
          dialogTitle: 'Test Title',
        })
      );
    });
  });

  describe('KuralImageCard social status image card', () => {
    test('KuralImageCard is defined and configured for left alignment', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      expect(KuralImageCard).toBeDefined();
      expect(KuralImageCard.displayName).toBe('KuralImageCard');
    });

    test('renders status card container with rounded border', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const cardContainer = cardElement.props.children;

      const flatStyle = Array.isArray(cardContainer.props.style)
        ? Object.assign({}, ...cardContainer.props.style.filter(Boolean))
        : cardContainer.props.style;
      expect(flatStyle.borderWidth).toBe(1.5);
      expect(flatStyle.borderColor).toBe('#DFD4BD');
    });

    test('renders Thiruvalluvar hero image on top with default color image', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const cardContainer = cardElement.props.children;

      // Child 1 is the Thiruvalluvar image container
      const imageContainer = cardContainer.props.children[1];
      expect(imageContainer).toBeDefined();

      const flatImageContainerStyle = Array.isArray(imageContainer.props.style)
        ? Object.assign({}, ...imageContainer.props.style.filter(Boolean))
        : imageContainer.props.style;
      expect(flatImageContainerStyle.backgroundColor).toBe('#F3E9D7');
      expect(flatImageContainerStyle.borderColor).toBe('#DFD4BD');

      const imageElement = imageContainer.props.children;
      expect(imageElement).toBeDefined();
      expect(imageElement.props.source).toBeDefined();
      expect(imageElement.props.accessibilityLabel).toBe('திருவள்ளுவர் (வண்ணம்)');
    });

    test('renders KuralCoupletText with left alignment by default in image card', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      expect(cardElement).toBeDefined();

      // Find heroKuralBox in card children (child 2, below image)
      const cardContainer = cardElement.props.children;
      const heroKuralBox = cardContainer.props.children[2];
      const coupletComponent = heroKuralBox.props.children;

      expect(coupletComponent.props.align).toBe('left');
      expect(coupletComponent.props.line1Style).toEqual(
        expect.arrayContaining([expect.objectContaining({ textAlign: 'left' })])
      );
      expect(coupletComponent.props.line2Style).toEqual(
        expect.arrayContaining([expect.objectContaining({ textAlign: 'left' })])
      );
    });

    test('allows customizing alignment to right or center if needed', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1, align: 'center' }, null);
      const cardContainer = cardElement.props.children;
      const heroKuralBox = cardContainer.props.children[2];
      const coupletComponent = heroKuralBox.props.children;

      expect(coupletComponent.props.align).toBe('center');
    });

    test('renders header with app icon on left, Tamil title in center, and Kural number on right', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const cardContainer = cardElement.props.children;
      const headerRow = cardContainer.props.children[0];

      // Header has 3 columns: left (app icon), center (title), right (kural number)
      const [headerLeft, headerCenter, headerRight] = headerRow.props.children;

      // Left: App icon image
      const appIconImage = headerLeft.props.children;
      expect(appIconImage).toBeDefined();

      // Center: "திருக்குறள்"
      const centerTitle = headerCenter.props.children;
      expect(centerTitle.props.children).toBe('திருக்குறள்');

      // Right: Kural number badge
      const numberBadge = headerRight.props.children;
      const numberText = numberBadge.props.children;
      expect(numberText.props.children).toEqual(['குறள் ', 1]);
    });

    test('renders body with bold and highlighted Thirukkural couplet', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const cardContainer = cardElement.props.children;
      const heroKuralBox = cardContainer.props.children[2];
      const coupletComponent = heroKuralBox.props.children;

      // Highlighted styling on container
      const flatHeroBoxStyle = Array.isArray(heroKuralBox.props.style)
        ? Object.assign({}, ...heroKuralBox.props.style.filter(Boolean))
        : heroKuralBox.props.style;
      expect(flatHeroBoxStyle.backgroundColor).toBe('#F5EBD9');
      expect(flatHeroBoxStyle.borderLeftColor).toBe('#D97706');

      // Bold couplet text (fontWeight 900)
      expect(coupletComponent.props.fontWeight).toBe('900');
    });

    test('renders footer with category and chapter name on the right and no copyright text', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const cardContainer = cardElement.props.children;
      const footerRow = cardContainer.props.children[5];

      expect(footerRow).toBeDefined();
      const footerText = footerRow.props.children;
      expect(footerText.props.children).toBe('அறத்துப்பால் | கடவுள் வாழ்த்து');
      expect(footerText.props.children).not.toContain('Neolumina');
      expect(footerText.props.children).not.toContain('©');
    });

    test('adjusts card size to 9:16 for WhatsApp Status and social stories by default', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const cardElement = KuralImageCard.render({ kural: kural1 }, null);
      const flatCanvasStyle = Array.isArray(cardElement.props.style)
        ? Object.assign({}, ...cardElement.props.style.filter(Boolean))
        : cardElement.props.style;
      expect(flatCanvasStyle.aspectRatio).toBe(9 / 16);

      const cardContainer = cardElement.props.children;
      const flatContainerStyle = Array.isArray(cardContainer.props.style)
        ? Object.assign({}, ...cardContainer.props.style.filter(Boolean))
        : cardContainer.props.style;
      expect(flatContainerStyle.flex).toBe(1);
      expect(flatContainerStyle.justifyContent).toBe('space-between');
    });

    test('allows customizing card format to 4:5 or 1:1', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');
      const card45 = KuralImageCard.render({ kural: kural1, cardRatio: '4:5' }, null);
      const flat45 = Array.isArray(card45.props.style)
        ? Object.assign({}, ...card45.props.style.filter(Boolean))
        : card45.props.style;
      expect(flat45.aspectRatio).toBe(4 / 5);

      const card11 = KuralImageCard.render({ kural: kural1, cardRatio: '1:1' }, null);
      const flat11 = Array.isArray(card11.props.style)
        ? Object.assign({}, ...card11.props.style.filter(Boolean))
        : card11.props.style;
      expect(flat11.aspectRatio).toBe(1);
    });

    test('adapts theme colors properly based on the selected Thiruvalluvar image', () => {
      const { KuralImageCard } = require('../src/components/KuralImageCard');

      // 1. Beach statue (oceanic blue theme)
      const beachCard = KuralImageCard.render({ kural: kural1, imageId: 'beach-statue' }, null);
      const beachContainer = beachCard.props.children;
      const beachStyle = Array.isArray(beachContainer.props.style)
        ? Object.assign({}, ...beachContainer.props.style.filter(Boolean))
        : beachContainer.props.style;
      expect(beachStyle.borderColor).toBe('#BAE6FD');

      const beachHeroBox = beachContainer.props.children[2];
      const flatBeachHero = Array.isArray(beachHeroBox.props.style)
        ? Object.assign({}, ...beachHeroBox.props.style.filter(Boolean))
        : beachHeroBox.props.style;
      expect(flatBeachHero.borderLeftColor).toBe('#0284C7');

      // 2. Black and white portrait (monochrome slate theme)
      const bwCard = KuralImageCard.render({ kural: kural1, imageId: 'thiruvalluvar-bw' }, null);
      const bwContainer = bwCard.props.children;
      const bwStyle = Array.isArray(bwContainer.props.style)
        ? Object.assign({}, ...bwContainer.props.style.filter(Boolean))
        : bwContainer.props.style;
      expect(bwStyle.borderColor).toBe('#D1D5DB');

      const bwHeroBox = bwContainer.props.children[2];
      const flatBwHero = Array.isArray(bwHeroBox.props.style)
        ? Object.assign({}, ...bwHeroBox.props.style.filter(Boolean))
        : bwHeroBox.props.style;
      expect(flatBwHero.borderLeftColor).toBe('#374151');

      // 3. Granite statue (terracotta / bronze theme)
      const statueCard = KuralImageCard.render({ kural: kural1, imageId: 'statue' }, null);
      const statueContainer = statueCard.props.children;
      const statueHeroBox = statueContainer.props.children[2];
      const flatStatueHero = Array.isArray(statueHeroBox.props.style)
        ? Object.assign({}, ...statueHeroBox.props.style.filter(Boolean))
        : statueHeroBox.props.style;
      expect(flatStatueHero.borderLeftColor).toBe('#C2410C');
    });
  });
});



