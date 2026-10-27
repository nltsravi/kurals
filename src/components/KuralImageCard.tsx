import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Kural } from '../types/kural';
import { MeaningType } from '../utils/text';
import { KuralCoupletText } from './KuralCoupletText';
import {
  ThiruvalluvarImageId,
  DEFAULT_THIRUVALLUVAR_IMAGE_ID,
  getThiruvalluvarImage,
  APP_ICON_SOURCE,
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
    const innerCoupletWidth = Math.max(240, effectiveCardWidth * 0.88);

    const imageOption = getThiruvalluvarImage(imageId);
    const theme = imageOption.theme;

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
    const footerMetadata = [categoryText, chapterText].filter(Boolean).join(' | ');

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
          {/* 0. Header & Badge Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={APP_ICON_SOURCE}
                style={styles.headerAppIcon}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.mainAppTitle}>
                திருக்குறள்
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
              baseFontSize={Math.round(20 * Math.min(1.15, Math.max(0.9, effectiveCardWidth / 400)))}
              containerWidth={innerCoupletWidth}
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

          {/* 5. Footer Section: {category} | {chapter name} */}
          <View style={styles.footerRow}>
            <Text style={styles.footerCategoryChapterText} numberOfLines={1}>
              {footerMetadata}
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
  /* Header & Badge (positioned over the top-right gold badge of the template) */
  headerRow: {
    position: 'absolute',
    top: '13.3%',
    left: '72.8%',
    width: '24.4%',
    height: '5.7%',
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'none',
  },
  headerAppIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  headerCenter: {
    display: 'none',
  },
  mainAppTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8E7BE',
  },
  headerRight: {
    width: '100%',
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
    left: '7.0%',
    width: '86.0%',
    height: '11.5%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  kuralLine2: {
    fontWeight: '900',
    color: '#FFF5DC',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
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
    alignItems: 'center',
    zIndex: 20,
  },
  footerCategoryChapterText: {
    fontSize: 13,
    color: '#F8E7BE',
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
