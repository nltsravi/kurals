import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Kural } from '../types/kural';
import { MeaningType } from '../utils/text';
import { KuralCoupletText } from './KuralCoupletText';

const APP_ICON = require('../../assets/images/icon.png');

export interface KuralImageCardProps {
  kural: Kural;
  meaningType?: MeaningType;
  dateStr?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export const KuralImageCard = React.forwardRef<View, KuralImageCardProps>(
  ({ kural, meaningType = 'mv', dateStr, width, align = 'left' }, ref) => {
    const screenWidth = Dimensions?.get ? Dimensions.get('window')?.width || 380 : 380;
    const effectiveCardWidth = width || Math.min(screenWidth - 40, 500);
    // 8px canvas padding + 28px card padding + 28px hero box padding
    const innerCoupletWidth = Math.max(240, effectiveCardWidth - 64);

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
        style={[styles.canvas, width ? { width } : undefined]}
      >
        {/* Outer Card Container */}
        <View style={styles.cardContainer}>
          {/* Header Section: App icon (left), "திருக்குறள்" (center), Kural number (right) */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={APP_ICON}
                style={styles.headerAppIcon}
                resizeMode="cover"
              />
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.mainAppTitle}>திருக்குறள்</Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.kuralNumberBadge}>
                <Text style={styles.kuralNumberText}>குறள் {kural.number}</Text>
              </View>
            </View>
          </View>

          {/* Main Hero Kural Box: Bold and Highlighted couplet */}
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
              color="#120600"
              baseFontSize={Math.round(21 * Math.min(1.2, Math.max(0.9, effectiveCardWidth / 400)))}
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

          {/* Tamil Commentary Section */}
          {commentaryText ? (
            <View style={styles.commentarySection}>
              <Text style={styles.commentaryBodyText}>{commentaryText}</Text>
            </View>
          ) : null}

          {/* English Translation Section */}
          {kural.translation ? (
            <View style={styles.translationSection}>
              <Text style={styles.translationBodyText}>
                "{kural.translation}"
              </Text>
            </View>
          ) : null}

          {/* Footer Section: {category} | {chapter name} on the right */}
          {footerMetadata ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerCategoryChapterText}>
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
    maxWidth: 520,
    alignSelf: 'center',
    padding: 4,
  },
  cardContainer: {
    backgroundColor: '#FAF5EC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFD4BD',
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerAppIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#DFD4BD',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAppTitle: {
    fontSize: 18,
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
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EFE6D6',
  },
  kuralNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E140C',
  },
  /* Hero Kural Box: Highlighted with warm background & accent border */
  heroKuralBox: {
    backgroundColor: '#F5EBD9',
    borderWidth: 1,
    borderColor: '#E6D7BD',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
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
    marginBottom: 6,
    zIndex: 2,
  },
  commentaryBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#261C13',
    fontWeight: '500',
  },
  /* English Translation Section */
  translationSection: {
    paddingTop: 0,
    zIndex: 2,
  },
  translationBodyText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18.5,
    color: '#32251A',
    fontWeight: '500',
  },
  /* Footer Section: {category} | {chapter name} */
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBE2D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  footerCategoryChapterText: {
    fontSize: 11.5,
    color: '#7B6C5C',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'right',
  },
});
