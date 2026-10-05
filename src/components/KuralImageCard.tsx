import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Kural } from '../types/kural';
import { MeaningType } from '../utils/text';
import { KuralCoupletText } from './KuralCoupletText';

export interface KuralImageCardProps {
  kural: Kural;
  meaningType?: MeaningType;
  dateStr?: string;
  width?: number;
}

export const KuralImageCard = React.forwardRef<View, KuralImageCardProps>(
  ({ kural, meaningType = 'mv', dateStr, width }, ref) => {
    const formattedDate =
      dateStr ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

    // Determine Tamil commentary
    let commentaryTitle = 'மு. வரதராசனார் உரை';
    let commentaryText = kural.commentaryMV;

    if (meaningType === 'sp' && kural.commentarySP) {
      commentaryTitle = 'சாலமன் பாப்பையா உரை';
      commentaryText = kural.commentarySP;
    } else if (meaningType === 'mk' && kural.commentaryMK) {
      commentaryTitle = 'கலைஞர் மு. கருணாநிதி உரை';
      commentaryText = kural.commentaryMK;
    } else if (!commentaryText) {
      commentaryText = kural.commentarySP || kural.commentaryMK || kural.explanation;
    }

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[styles.canvas, width ? { width } : undefined]}
      >
        {/* Outer Border & Corner Crop Marks */}
        <View style={styles.cardContainer}>
          {/* Corner L-Brackets */}
          <View style={[styles.cornerCrop, styles.cornerTL]}>
            <View style={styles.cropHoriz} />
            <View style={styles.cropVert} />
          </View>
          <View style={[styles.cornerCrop, styles.cornerTR]}>
            <View style={[styles.cropHoriz, { alignSelf: 'flex-end' }]} />
            <View style={[styles.cropVert, { alignSelf: 'flex-end' }]} />
          </View>
          <View style={[styles.cornerCrop, styles.cornerBL]}>
            <View style={styles.cropVert} />
            <View style={styles.cropHoriz} />
          </View>
          <View style={[styles.cornerCrop, styles.cornerBR]}>
            <View style={[styles.cropVert, { alignSelf: 'flex-end' }]} />
            <View style={[styles.cropHoriz, { alignSelf: 'flex-end' }]} />
          </View>

          {/* Central Watermark: Star & Dashed Ring */}
          <View style={styles.watermarkContainer} pointerEvents="none">
            <View style={styles.watermarkRing} />
            <Text style={styles.watermarkStar}>★</Text>
          </View>

          {/* Header Section */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {/* Silhouette Sage Icon Badge */}
              <View style={styles.iconBadge}>
                <View style={styles.silhouetteHead} />
                <View style={styles.silhouetteShoulders} />
                <View style={styles.silhouetteBase} />
              </View>

              <View style={styles.titleColumn}>
                <Text style={styles.mainAppTitle}>தினசரி திருக்குறள்</Text>
                <Text style={styles.subAppTitle}>தினமும் ஒரு நற்சிந்தனை</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.kuralNumberBadge}>
                <Text style={styles.kuralNumberText}>குறள் {kural.number}</Text>
              </View>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          {/* Category & Chapter Row */}
          <View style={styles.categoryChapterRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {kural.categoryTamil} ({kural.categoryEnglish})
              </Text>
            </View>

            <Text style={styles.bulletSeparator}>•</Text>

            <View style={styles.chapterInfo}>
              <Text style={styles.chapterLabel}>
                அதிகாரம்:{' '}
                <Text style={styles.chapterName}>
                  {kural.chapterNameTamil} / {kural.chapterNameEnglish}
                </Text>
              </Text>
            </View>
          </View>

          {/* Main Hero Kural Box: Line 1 (4 words) & Line 2 (3 words) with adjusted font */}
          <View style={styles.heroKuralBox}>
            <KuralCoupletText
              line1={kural.line1}
              line2={kural.line2}
              tamil={kural.tamil}
              color="#341A06"
              baseFontSize={width ? Math.round(19.5 * Math.min(1.2, Math.max(0.85, width / 400))) : 19.5}
              containerWidth={width ? width - 76 : undefined}
              align="center"
              fontWeight="800"
              letterSpacing={0.2}
              containerStyle={styles.heroKuralTextContainer}
            />
          </View>

          {/* Tamil Commentary Section */}
          <View style={styles.commentarySection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="create-outline" size={14} color="#635443" style={styles.sectionIcon} />
              <Text style={styles.commentaryAuthorLabel}>{commentaryTitle}</Text>
            </View>
            <Text style={styles.commentaryBodyText}>{commentaryText}</Text>
          </View>

          {/* English Translation Section */}
          <View style={styles.translationSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="globe-outline" size={13} color="#6E5F4E" style={styles.sectionIcon} />
              <Text style={styles.translationHeaderLabel}>ENGLISH TRANSLATION & MEANING</Text>
            </View>
            <Text style={styles.translationBodyText}>
              "{kural.translation}"
            </Text>
          </View>

          {/* Footer Section */}
          <View style={styles.footerRow}>
            <View style={styles.footerLeft}>
              <Ionicons name="qr-code-outline" size={22} color="#261A10" style={styles.qrIcon} />
              <View>
                <Text style={styles.footerTitle}>
                  கிடைக்கும் இடம்: <Text style={styles.footerBold}>Play Store & App Store</Text>
                </Text>
                <Text style={styles.footerSub}>பதிவிறக்கம் செய்ய: "Thirukkural Daily"</Text>
              </View>
            </View>

            <View style={styles.footerRight}>
              <Text style={styles.starRating}>★★★★★</Text>
              <Text style={styles.ratingText}>4.9 ★ • 100K+ பயனர்கள்</Text>
            </View>
          </View>
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
    padding: 8,
  },
  cardContainer: {
    backgroundColor: '#FAF5EC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DFD4BD',
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  /* Corner Crop Marks */
  cornerCrop: {
    position: 'absolute',
    width: 14,
    height: 14,
    zIndex: 10,
  },
  cornerTL: {
    top: 5,
    left: 5,
  },
  cornerTR: {
    top: 5,
    right: 5,
  },
  cornerBL: {
    bottom: 5,
    left: 5,
  },
  cornerBR: {
    bottom: 5,
    right: 5,
  },
  cropHoriz: {
    width: 12,
    height: 1.5,
    backgroundColor: '#8E826F',
  },
  cropVert: {
    width: 1.5,
    height: 12,
    backgroundColor: '#8E826F',
  },
  /* Central Star & Dashed Ring Watermark */
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -110,
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    opacity: 0.12,
  },
  watermarkRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: '#8C7B62',
    borderStyle: 'dashed',
  },
  watermarkStar: {
    fontSize: 160,
    color: '#8C7B62',
    lineHeight: 180,
  },
  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAE1CF',
    borderWidth: 1,
    borderColor: '#DFD4BD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  silhouetteHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2A180B',
    marginBottom: 2,
  },
  silhouetteShoulders: {
    width: 20,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#2A180B',
    marginBottom: 2,
  },
  silhouetteBase: {
    width: 24,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2A180B',
  },
  titleColumn: {
    flex: 1,
  },
  mainAppTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E140C',
    letterSpacing: -0.2,
  },
  subAppTitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#766654',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  kuralNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFE6D6',
    borderWidth: 1,
    borderColor: '#D8CCBA',
  },
  kuralNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E140C',
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#7B6C5C',
    marginTop: 4,
  },
  /* Category & Chapter Row */
  categoryChapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E6DCBF',
    marginBottom: 14,
    zIndex: 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD2BA',
    backgroundColor: '#F3EADB',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#281B0F',
  },
  bulletSeparator: {
    fontSize: 14,
    color: '#9E907B',
    marginHorizontal: 2,
  },
  chapterInfo: {
    flexShrink: 1,
  },
  chapterLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E140C',
  },
  chapterName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2C1E12',
  },
  /* Hero Kural Box */
  heroKuralBox: {
    backgroundColor: '#F5EEE2',
    borderWidth: 1,
    borderColor: '#E2D7C2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    width: '100%',
  },
  heroKuralTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  kuralLine1: {
    fontSize: 19.5,
    fontWeight: '800',
    color: '#341A06',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  kuralLine2: {
    fontSize: 19.5,
    fontWeight: '800',
    color: '#341A06',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.2,
    marginTop: 3,
  },
  /* Tamil Commentary Section */
  commentarySection: {
    marginBottom: 12,
    zIndex: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 2,
  },
  commentaryAuthorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F3225',
  },
  commentaryBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#261C13',
    fontWeight: '500',
  },
  /* English Translation Section */
  translationSection: {
    marginBottom: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#EAE1CB',
    zIndex: 2,
  },
  translationHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6E5F4E',
    letterSpacing: 0.5,
  },
  translationBodyText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19.5,
    color: '#32251A',
    fontWeight: '500',
    marginTop: 2,
  },
  /* Footer */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#E4DAC3',
    zIndex: 2,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  qrIcon: {
    marginRight: 2,
  },
  footerTitle: {
    fontSize: 11,
    color: '#24180E',
    fontWeight: '500',
  },
  footerBold: {
    fontWeight: '700',
    color: '#1F140A',
  },
  footerSub: {
    fontSize: 10,
    color: '#766755',
    marginTop: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  starRating: {
    fontSize: 13,
    color: '#EAB308',
    letterSpacing: 1,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B5C4B',
    marginTop: 2,
  },
});
