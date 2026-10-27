import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Kural } from '../types/kural';
import { MeaningType } from '../utils/text';
import { KuralCoupletText, getTamilTypographicWidth } from './KuralCoupletText';
import {
  ThiruvalluvarImageId,
  DEFAULT_THIRUVALLUVAR_IMAGE_ID,
  getThiruvalluvarImage,
  APP_ICON_SOURCE,
  THALIR_LOGO_SOURCE,
  TRADITIONAL_TEMPLATE_BG_SOURCE,
  TRADITIONAL_TEMPLATE_NO_IMAGE_BG_SOURCE,
} from '../constants/thiruvalluvarImages';

export interface KuralImageCardProps {
  kural: Kural;
  meaningType?: MeaningType;
  width?: number;
  align?: 'left' | 'center' | 'right';
  imageId?: ThiruvalluvarImageId;
  cardRatio?: '9:16' | '4:5' | '1:1';
  customImageUri?: string | null;
  hideImage?: boolean;
}

export const KuralImageCard = React.forwardRef<any, KuralImageCardProps>(
  (
    {
      kural,
      meaningType = 'mv',
      width,
      align = 'center',
      imageId = DEFAULT_THIRUVALLUVAR_IMAGE_ID,
      cardRatio = '9:16',
      customImageUri,
      hideImage = false,
    },
    ref
  ) => {
    const screenWidth = Dimensions?.get ? Dimensions.get('window')?.width || 380 : 380;
    const effectiveCardWidth = width || Math.min(screenWidth - 40, 480);

    const imageOption = getThiruvalluvarImage(imageId);
    const theme = imageOption.theme;

    // Calculate prominent couplet font size, uniform across both lines
    const w1 = getTamilTypographicWidth(kural.line1);
    const w2 = getTamilTypographicWidth(kural.line2);
    const maxKuralW = Math.max(w1, w2);
    const targetCoupletFontSize = Math.round(
      Math.max(
        18,
        Math.min(
          hideImage ? 25 : 24,
          (effectiveCardWidth * (hideImage ? 0.90 : 0.92)) / (Math.max(16, maxKuralW) * 0.62)
        )
      ) * 10
    ) / 10;

    // Aspect ratio calculation
    const numericAspectRatio =
      cardRatio === '4:5' ? 4 / 5 : cardRatio === '1:1' ? 1 : 9 / 16;

    // Is image hidden or set to app icon
    let resolvedImageSource: any = imageOption.source;
    let resolvedResizeMode: 'contain' | 'cover' = imageOption.resizeMode;
    let accessibilityLabel = imageOption.nameTamil;

    if (hideImage) {
      resolvedImageSource = null;
    } else if (imageId === 'hide' || imageId === 'thiruvalluvar-outline') {
      resolvedImageSource = APP_ICON_SOURCE;
      resolvedResizeMode = 'contain';
      accessibilityLabel = 'செயலி சின்னம் (App Icon)';
    } else if (imageId === 'custom' && customImageUri) {
      resolvedImageSource = { uri: customImageUri } as any;
      resolvedResizeMode = 'cover';
      accessibilityLabel = 'தனிப்பயன் படம் (Custom Photo)';
    }

    // Determine Tamil commentary text
    let commentaryText = kural.commentaryMV;

    if (meaningType === 'sp' && kural.commentarySP) {
      commentaryText = kural.commentarySP;
    } else if (meaningType === 'mk' && kural.commentaryMK) {
      commentaryText = kural.commentaryMK;
    } else if (meaningType === 'prm' && kural.commentaryPRM) {
      commentaryText = kural.commentaryPRM;
    } else if (meaningType === 'mnk' && kural.commentaryMNK) {
      commentaryText = kural.commentaryMNK;
    } else if (!commentaryText) {
      commentaryText =
        kural.commentarySP ||
        kural.commentaryMK ||
        kural.commentaryPRM ||
        kural.commentaryMNK ||
        kural.explanation;
    }

    const categoryText = kural.categoryTamil || kural.categoryEnglish || '';
    const chapterText = kural.chapterNameTamil || kural.chapterNameEnglish || '';
    const templateBgSource = hideImage
      ? TRADITIONAL_TEMPLATE_NO_IMAGE_BG_SOURCE
      : TRADITIONAL_TEMPLATE_BG_SOURCE;

    const coupletTextColor = hideImage ? '#152E22' : '#FFF5DC';
    const coupletLine1Style = hideImage ? styles.kuralLine1NoImage : styles.kuralLine1;
    const coupletLine2Style = hideImage ? styles.kuralLine2NoImage : styles.kuralLine2;
    const footerCategoryText = hideImage
      ? (categoryText ? `— ${categoryText}` : '')
      : categoryText;

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[
          styles.canvas,
          { aspectRatio: numericAspectRatio },
          width ? { width } : undefined,
        ]}
      >
        {/* Outer Card Container */}
        <View
          style={[
            styles.cardContainer,
            { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
          ]}
        >
          {/* 0. Header & Badge Row below Header: Logo (left), Chapter (center), Kural number (right) */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={THALIR_LOGO_SOURCE}
                style={styles.headerAppIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
                accessibilityLabel="தளிர் கல்விக் கூடம்"
              />
            </View>

            <View style={styles.headerCenter}>
              <Text
                style={hideImage ? styles.mainAppTitle : styles.mainAppTitleMaroon}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chapterText}
              </Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.kuralNumberBadge}>
                <Text style={hideImage ? styles.kuralNumberText : styles.kuralNumberTextMaroon}>
                  குறள் {kural.number}
                </Text>
              </View>
            </View>
          </View>

          {/* 1. Image Container positioned inside the golden arch (rendered only when image is enabled) */}
          {!hideImage && resolvedImageSource ? (
            <View
              style={[
                styles.imageContainer,
                {
                  backgroundColor: theme.imageContainerBg,
                  borderColor: theme.imageBorderColor,
                },
              ]}
            >
              <Image
                source={resolvedImageSource}
                style={styles.imageElement}
                contentFit={resolvedResizeMode}
                cachePolicy="memory-disk"
                accessibilityLabel={accessibilityLabel}
              />
            </View>
          ) : null}

          {/* 2. Couplet Plaque: strictly 4+3 rule, identical font size & weight */}
          <View
            style={[
              hideImage ? styles.heroKuralBoxNoImage : styles.heroKuralBox,
              align === 'left' && styles.heroKuralBoxLeft,
              align === 'center' && styles.heroKuralBoxCenter,
              align === 'right' && styles.heroKuralBoxRight,
            ]}
          >
            <KuralCoupletText
              line1={kural.line1}
              line2={kural.line2}
              tamil={kural.tamil}
              color={coupletTextColor}
              baseFontSize={targetCoupletFontSize}
              containerWidth={effectiveCardWidth * 1.5}
              align={align}
              fontWeight="900"
              letterSpacing={0.3}
              containerStyle={[
                styles.heroKuralTextContainer,
                align === 'left' && styles.heroKuralTextContainerLeft,
                align === 'center' && styles.heroKuralTextContainerCenter,
                align === 'right' && styles.heroKuralTextContainerRight,
              ]}
              line1Style={[coupletLine1Style, { textAlign: align }]}
              line2Style={[coupletLine2Style, { textAlign: align }]}
            />
          </View>

          {/* 3. Tamil Commentary Section */}
          <View style={hideImage ? styles.commentarySectionNoImage : styles.commentarySection}>
            {commentaryText ? (
              <Text
                style={hideImage ? styles.commentaryBodyTextNoImage : styles.commentaryBodyText}
                numberOfLines={hideImage ? 6 : 4}
              >
                {commentaryText}
              </Text>
            ) : null}
          </View>

          {/* 4. English Translation Section */}
          <View style={hideImage ? styles.translationSectionNoImage : styles.translationSection}>
            {kural.translation ? (
              <Text
                style={hideImage ? styles.translationBodyTextNoImage : styles.translationBodyText}
                numberOfLines={hideImage ? 5 : 3}
              >
                {hideImage ? `“${kural.translation}”` : `"${kural.translation}"`}
              </Text>
            ) : null}
          </View>

          {/* 5. Footer Section: Category at bottom right */}
          <View style={hideImage ? styles.footerRowNoImage : styles.footerRow}>
            <Text
              style={hideImage ? styles.footerCategoryTextNoImage : styles.footerCategoryChapterText}
              numberOfLines={1}
            >
              {footerCategoryText}
            </Text>
          </View>

          {/* 6. Template Background Overlay Image (Opaque ornate graphics) */}
          <Image
            source={templateBgSource}
            style={styles.templateBgOverlay}
            contentFit="fill"
            cachePolicy="memory-disk"
            pointerEvents="none"
          />
        </View>
      </View>
    );
  }
);

KuralImageCard.displayName = 'KuralImageCard';

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#0F261B',
    width: '100%',
    maxWidth: 460,
    aspectRatio: 9 / 16,
    alignSelf: 'center',
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#DFD4BD',
    backgroundColor: '#FAF5EC',
  },
  templateBgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  /* Header & Badge: Logo (left), Chapter (center), Kural number badge (right) */
  headerRow: {
    position: 'absolute',
    top: '14.2%',
    left: '3.5%',
    width: '93.0%',
    height: '8.4%',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    width: '20%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  headerAppIcon: {
    width: '100%',
    height: '100%',
    maxHeight: 52,
    maxWidth: 58,
  },
  headerCenter: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  mainAppTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#152E22',
    textAlign: 'center',
  },
  mainAppTitleMaroon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B0606',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    width: '27%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kuralNumberBadge: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kuralNumberText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#2C1D06',
    textAlign: 'center',
  },
  kuralNumberTextMaroon: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A1504',
    textAlign: 'center',
  },
  /* Hero Image inside the golden arch window (enabled mode) */
  imageContainer: {
    position: 'absolute',
    top: '18.4%',
    left: '26.5%',
    width: '47.0%',
    height: '32.6%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#1E140C',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#DFD4BD',
  },
  imageElement: {
    width: '100%',
    height: '100%',
  },
  /* Couplet Box: over the velvet maroon plaque (enabled mode) */
  heroKuralBox: {
    position: 'absolute',
    top: '52.6%',
    left: '5.0%',
    width: '90.0%',
    height: '12.2%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  /* Couplet Box: between Divider 1 and Divider 2 (disabled mode) */
  heroKuralBoxNoImage: {
    position: 'absolute',
    top: '29.0%',
    left: '4.5%',
    width: '91.0%',
    height: '12.5%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  heroKuralBoxLeft: {
    alignItems: 'flex-start',
  },
  heroKuralBoxCenter: {
    alignItems: 'center',
  },
  heroKuralBoxRight: {
    alignItems: 'flex-end',
  },
  heroKuralTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  heroKuralTextContainerLeft: {
    alignItems: 'flex-start',
  },
  heroKuralTextContainerCenter: {
    alignItems: 'center',
  },
  heroKuralTextContainerRight: {
    alignItems: 'flex-end',
  },
  kuralLine1: {
    fontWeight: '900',
    color: '#FFF5DC',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3.5,
  },
  kuralLine2: {
    fontWeight: '900',
    color: '#FFF5DC',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3.5,
  },
  kuralLine1NoImage: {
    fontWeight: '900',
    color: '#152E22',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  kuralLine2NoImage: {
    fontWeight: '900',
    color: '#152E22',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 5,
  },
  /* Commentary Section (enabled mode) */
  commentarySection: {
    position: 'absolute',
    top: '65.5%',
    left: '6.4%',
    width: '87.2%',
    height: '12.0%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 8,
  },
  commentaryBodyText: {
    fontSize: 13,
    lineHeight: 18.5,
    color: '#1A1108',
    fontWeight: '600',
    textAlign: 'center',
  },
  /* Commentary Section (disabled mode) */
  commentarySectionNoImage: {
    position: 'absolute',
    top: '44.5%',
    left: '5.5%',
    width: '89.0%',
    height: '24.0%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 10,
  },
  commentaryBodyTextNoImage: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#152E22',
    fontWeight: '700',
    textAlign: 'center',
  },
  /* Translation Section (enabled mode) */
  translationSection: {
    position: 'absolute',
    top: '78.5%',
    left: '6.4%',
    width: '87.2%',
    height: '9.5%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 12,
  },
  translationBodyText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 16.5,
    color: '#3C2415',
    fontWeight: '500',
    textAlign: 'center',
  },
  /* Translation Section (disabled mode) */
  translationSectionNoImage: {
    position: 'absolute',
    top: '71.5%',
    left: '5.5%',
    width: '89.0%',
    height: '16.5%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 12,
  },
  translationBodyTextNoImage: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
    color: '#20382B',
    fontWeight: '600',
    textAlign: 'center',
  },
  /* Footer Section (enabled mode) */
  footerRow: {
    position: 'absolute',
    top: '89.4%',
    left: '7.0%',
    width: '86.0%',
    height: '6.5%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    zIndex: 20,
  },
  footerCategoryChapterText: {
    fontSize: 13,
    color: '#F8E7BE',
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  /* Footer Section (disabled mode) */
  footerRowNoImage: {
    position: 'absolute',
    top: '92.5%',
    left: '7.0%',
    width: '86.0%',
    height: '4.5%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    zIndex: 20,
  },
  footerCategoryTextNoImage: {
    fontSize: 14,
    color: '#F5E8C9',
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
});
