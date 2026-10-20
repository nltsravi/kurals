import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Kural } from '../types/kural';
import { MeaningType } from '../utils/text';
import { KuralCoupletText } from './KuralCoupletText';
import {
  ThiruvalluvarImageId,
  DEFAULT_THIRUVALLUVAR_IMAGE_ID,
  getThiruvalluvarImage,
} from '../constants/thiruvalluvarImages';

const APP_ICON = require('../../assets/images/icon.png');

export interface KuralImageCardProps {
  kural: Kural;
  meaningType?: MeaningType;
  dateStr?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  imageId?: ThiruvalluvarImageId;
  cardRatio?: '9:16' | '4:5' | '1:1';
}

export const KuralImageCard = React.forwardRef<View, KuralImageCardProps>(
  (
    {
      kural,
      meaningType = 'mv',
      dateStr,
      width,
      align = 'left',
      imageId = DEFAULT_THIRUVALLUVAR_IMAGE_ID,
      cardRatio = '9:16',
    },
    ref
  ) => {
    const screenWidth = Dimensions?.get ? Dimensions.get('window')?.width || 380 : 380;
    const effectiveCardWidth = width || Math.min(screenWidth - 40, 480);
    // 8px canvas padding + 24px card padding + 24px hero box padding
    const innerCoupletWidth = Math.max(240, effectiveCardWidth - 56);

    const imageOption = getThiruvalluvarImage(imageId);
    const theme = imageOption.theme;

    // Aspect ratio calculation
    const numericAspectRatio =
      cardRatio === '4:5' ? 4 / 5 : cardRatio === '1:1' ? 1 : 9 / 16;

    // Image container height calculation based on card proportion
    const imageContainerHeight =
      cardRatio === '9:16' ? 190 : cardRatio === '4:5' ? 145 : 110;

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
          { backgroundColor: theme.canvasBg, aspectRatio: numericAspectRatio },
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
          {/* 0. Header Section: App icon (left), "திருக்குறள்" (center), Kural number (right) */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={APP_ICON}
                style={[styles.headerAppIcon, { borderColor: theme.borderColor }]}
                resizeMode="cover"
              />
            </View>

            <View style={styles.headerCenter}>
              <Text style={[styles.mainAppTitle, { color: theme.headerTitleColor }]}>
                திருக்குறள்
              </Text>
            </View>

            <View style={styles.headerRight}>
              <View
                style={[
                  styles.kuralNumberBadge,
                  { backgroundColor: theme.badgeBg },
                ]}
              >
                <Text
                  style={[
                    styles.kuralNumberText,
                    { color: theme.badgeText },
                  ]}
                >
                  குறள் {kural.number}
                </Text>
              </View>
            </View>
          </View>

          {/* 1. Thiruvalluvar Image on Top */}
          <View
            style={[
              styles.imageContainer,
              {
                backgroundColor: theme.imageContainerBg,
                borderColor: theme.imageBorderColor,
                height: imageContainerHeight,
              },
            ]}
          >
            <Image
              source={imageOption.source}
              style={styles.imageElement}
              resizeMode={imageOption.resizeMode}
              accessibilityLabel={imageOption.nameTamil}
            />
          </View>

          {/* 2. Main Hero Kural Box: Bold and Highlighted couplet */}
          <View
            style={[
              styles.heroKuralBox,
              {
                backgroundColor: theme.heroBg,
                borderColor: theme.heroBorder,
                borderLeftColor: theme.heroAccent,
              },
              align === 'left' && styles.heroKuralBoxLeft,
              align === 'center' && styles.heroKuralBoxCenter,
              align === 'right' && styles.heroKuralBoxRight,
            ]}
          >
            <KuralCoupletText
              line1={kural.line1}
              line2={kural.line2}
              tamil={kural.tamil}
              color={theme.coupletColor}
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
              line1Style={[styles.kuralLine1, { color: theme.coupletColor, textAlign: align }]}
              line2Style={[styles.kuralLine2, { color: theme.coupletColor, textAlign: align }]}
            />
          </View>

          {/* 3. Tamil Commentary Section */}
          {commentaryText ? (
            <View style={styles.commentarySection}>
              <Text
                style={[
                  styles.commentaryBodyText,
                  { color: theme.commentaryColor },
                ]}
              >
                {commentaryText}
              </Text>
            </View>
          ) : null}

          {/* 4. English Translation Section */}
          {kural.translation ? (
            <View style={styles.translationSection}>
              <Text
                style={[
                  styles.translationBodyText,
                  { color: theme.translationColor },
                ]}
              >
                "{kural.translation}"
              </Text>
            </View>
          ) : null}

          {/* 5. Footer Section: {category} | {chapter name} */}
          {footerMetadata ? (
            <View style={[styles.footerRow, { borderTopColor: theme.footerBorder }]}>
              <Text
                style={[
                  styles.footerCategoryChapterText,
                  { color: theme.footerTextColor },
                ]}
              >
                {footerMetadata}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
);

KuralImageCard.displayName = 'KuralImageCard';

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#FAF5EC',
    width: '100%',
    maxWidth: 460,
    aspectRatio: 9 / 16,
    alignSelf: 'center',
    padding: 4,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFD4BD',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerAppIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DFD4BD',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAppTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E140C',
    letterSpacing: -0.2,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  kuralNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EFE6D6',
  },
  kuralNumberText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E140C',
  },
  /* Thiruvalluvar Hero Image Container on Top */
  imageContainer: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD4BD',
    backgroundColor: '#F3E9D7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    zIndex: 2,
  },
  imageElement: {
    width: '100%',
    height: '100%',
  },
  /* Hero Kural Box: Highlighted with warm background & accent border */
  heroKuralBox: {
    backgroundColor: '#F5EBD9',
    borderWidth: 1,
    borderColor: '#E6D7BD',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
    width: '100%',
  },
  heroKuralBoxLeft: {
    alignItems: 'flex-start',
  },
  heroKuralBoxCenter: {
    alignItems: 'center',
    borderLeftWidth: 1,
  },
  heroKuralBoxRight: {
    alignItems: 'flex-end',
  },
  heroKuralTextContainer: {
    width: '100%',
    alignItems: 'flex-start',
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
    color: '#120600',
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  kuralLine2: {
    fontWeight: '900',
    color: '#120600',
    textAlign: 'left',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  /* Tamil Commentary Section */
  commentarySection: {
    marginVertical: 4,
    zIndex: 2,
  },
  commentaryBodyText: {
    fontSize: 12.5,
    lineHeight: 18.5,
    color: '#261C13',
    fontWeight: '500',
  },
  /* English Translation Section */
  translationSection: {
    marginVertical: 2,
    zIndex: 2,
  },
  translationBodyText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    color: '#32251A',
    fontWeight: '500',
  },
  /* Footer Section: {category} | {chapter name} */
  footerRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EBE2D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  footerCategoryChapterText: {
    fontSize: 11,
    color: '#7B6C5C',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'right',
  },
});
