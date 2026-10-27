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

    // Calculate prominent couplet font size matching reference image, uniform across both lines
    const w1 = getTamilTypographicWidth(kural.line1);
    const w2 = getTamilTypographicWidth(kural.line2);
    const maxKuralW = Math.max(w1, w2);
    const targetCoupletFontSize = Math.round(
      Math.max(
        19,
        Math.min(
          25,
          (effectiveCardWidth * 0.92) / (Math.max(16, maxKuralW) * 0.62)
        )
      ) * 10
    ) / 10;

    // Aspect ratio calculation
    const numericAspectRatio =
      cardRatio === '4:5' ? 4 / 5 : cardRatio === '1:1' ? 1 : 9 / 16;

    // Is image hidden or set to app icon
    const isHidden =
      hideImage || imageId === 'hide' || imageId === 'thiruvalluvar-outline';

    let resolvedImageSource: any = imageOption.source;
    let resolvedResizeMode: 'contain' | 'cover' = imageOption.resizeMode;
    let accessibilityLabel = imageOption.nameTamil;

    if (isHidden) {
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
              <Text style={styles.mainAppTitle} numberOfLines={1} ellipsizeMode="tail">
                {chapterText}
              </Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.kuralNumberBadge}>
                <Text style={styles.kuralNumberText}>
                  குறள் {kural.number}
                </Text>
              </View>
            </View>
          </View>

          {/* 1. Image Container positioned inside the golden arch */}
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

          {/* 2. Couplet Plaque: Rendered cleanly inside the velvet maroon banner */}
          <View
            style={[
              styles.heroKuralBox,
              align === 'left' && styles.heroKuralBoxLeft,
              align === 'center' && styles.heroKuralBoxCenter,
              align === 'right' && styles.heroKuralBoxRight,
            ]}
          >
            <KuralCoupletText
              line1={kural.line1}
              line2={kural.line2}
              tamil={kural.tamil}
              color="#FFF5DC"
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
              line1Style={[styles.kuralLine1, { textAlign: align }]}
              line2Style={[styles.kuralLine2, { textAlign: align }]}
            />
          </View>

          {/* 3. Tamil Commentary Section */}
          <View style={styles.commentarySection}>
            {commentaryText ? (
              <Text style={styles.commentaryBodyText} numberOfLines={4}>
                {commentaryText}
              </Text>
            ) : null}
          </View>

          {/* 4. English Translation Section */}
          <View style={styles.translationSection}>
            {kural.translation ? (
              <Text style={styles.translationBodyText} numberOfLines={3}>
                "{kural.translation}"
              </Text>
            ) : null}
          </View>

          {/* 5. Footer Section: Category at bottom right */}
          <View style={styles.footerRow}>
            <Text style={styles.footerCategoryChapterText} numberOfLines={1}>
              {categoryText}
            </Text>
          </View>

          {/* 6. Template Background Overlay Image (Opaque ornate graphics with transparent arch window) */}
          <Image
            source={TRADITIONAL_TEMPLATE_BG_SOURCE}
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
    backgroundColor: '#3B0606',
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
  /* Header & Badge (positioned below the header: logo on left, chapter in center, gold badge on right) */
  headerRow: {
    position: 'absolute',
    top: '12.8%',
    left: '3.5%',
    width: '93.0%',
    height: '6.2%',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    width: '22%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  headerAppIcon: {
    width: '100%',
    height: '100%',
    maxHeight: 46,
    maxWidth: 68,
  },
  headerCenter: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  mainAppTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#3B0606',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    width: '25%',
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
    fontSize: 13,
    fontWeight: '800',
    color: '#4A1504',
    textAlign: 'center',
  },
  /* Hero Image inside the golden arch window */
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
  /* Couplet Box: over the velvet maroon plaque */
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
  /* Commentary Section: over lower parchment */
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
  /* Translation Section: over lower parchment */
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
  /* Footer Section: over bottom maroon banner */
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
});
