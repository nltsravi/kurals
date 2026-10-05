import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KuralService } from '../../src/services/kuralService';
import { Kural, Category } from '../../src/types/kural';
import { useTheme } from '../../src/context/ThemeContext';
import { AddToCollectionModal } from '../../src/components/AddToCollectionModal';
import { ShareModal } from '../../src/components/ShareModal';
import { CATEGORY_COLORS } from '../../src/constants/appConstants';
import { KuralCoupletText } from '../../src/components/KuralCoupletText';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [randomKural, setRandomKural] = useState<Kural | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalKural, setModalKural] = useState<Kural | null>(null);
  const [shareKural, setShareKural] = useState<Kural | null>(null);

  useEffect(() => {
    setRandomKural(KuralService.getRandomKural());
    setCategories(KuralService.getAllCategories());
  }, []);

  const handleShuffle = () => {
    setRandomKural(KuralService.getRandomKural());
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.valluvarBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.valluvarIcon, { color: colors.primary }]}>ௐ</Text>
            </View>
            <View style={styles.titleColumn}>
              <Text style={[styles.mainTitle, { color: colors.text }]}>திருக்குறள்</Text>
              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Thirukkural</Text>
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            133 அதிகாரங்கள் • 1330 அருங்குறள்கள் • உலகப் பொதுமறை
          </Text>
        </View>

        {/* Search Field Trigger */}
        <TouchableOpacity
          style={[
            styles.searchTrigger,
            {
              backgroundColor: isDark ? colors.surface : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Search Thirukkural"
        >
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
            Search Thirukkural...
          </Text>
          <View style={[styles.searchBadge, { backgroundColor: colors.borderLight }]}>
            <Text style={[styles.searchBadgeText, { color: colors.textSecondary }]}>குறள்</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/search')}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.qaTitle, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>Search Kural</Text>
            <Text style={[styles.qaSubtitle, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>தேடல்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/chapters')}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: isDark ? '#3B1E08' : '#FEF3C7' }]}>
              <Ionicons name="book-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.qaTitle, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>Browse</Text>
            <Text style={[styles.qaSubtitle, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>அதிகாரங்கள்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/collections')}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: isDark ? '#2D1220' : '#FFE4E6' }]}>
              <Ionicons name="bookmark-outline" size={20} color="#E11D48" />
            </View>
            <Text style={[styles.qaTitle, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>Collections</Text>
            <Text style={[styles.qaSubtitle, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>தொகுப்புகள்</Text>
          </TouchableOpacity>
        </View>

        {/* Random Kural Card */}
        {randomKural && (
          <View style={[styles.randomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.randomCardHeader}>
              <View style={styles.randomBadgeRow}>
                <View style={[styles.randomPill, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.randomPillText, { color: isDark ? '#FED7AA' : colors.primary }]}>
                    குறள் {randomKural.number}
                  </Text>
                </View>
                <Text style={[styles.randomChapterText, { color: colors.textSecondary }]}>
                  {randomKural.chapterNameTamil}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleShuffle}
                style={styles.shuffleBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Show another random Kural"
              >
                <Ionicons name="shuffle" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <KuralCoupletText
              line1={randomKural.line1}
              line2={randomKural.line2}
              tamil={randomKural.tamil}
              color={colors.text}
              baseFontSize={17}
              fontWeight="600"
              containerStyle={styles.kuralTextContainer}
            />

            {randomKural.transliteration ? (
              <View style={[styles.kuralTranslitContainer, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.kuralTranslitText, { color: colors.textSecondary }]}>
                  {randomKural.transliteration}
                </Text>
              </View>
            ) : null}

            <View style={styles.randomActionsRow}>
              <TouchableOpacity
                style={[styles.viewKuralBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/kural/${randomKural.number}`)}
                accessibilityRole="button"
                accessibilityLabel={`View Kural ${randomKural.number}`}
              >
                <Text style={styles.viewKuralText}>View Kural</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconActionBtn, { borderColor: colors.border }]}
                onPress={() => setShareKural(randomKural)}
                accessibilityLabel="Share Kural to Social Media"
              >
                <Ionicons name="share-social-outline" size={18} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconActionBtn, { borderColor: colors.border }]}
                onPress={() => setModalKural(randomKural)}
                accessibilityLabel="Add to Collection"
              >
                <Ionicons name="bookmark-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3 Categories / Sections */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>முப்பால் (Categories)</Text>
          <TouchableOpacity onPress={() => router.push('/chapters')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.number}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: '/chapters', params: { categoryNumber: cat.number } })}
            >
              <View style={styles.categoryCardLeft}>
                <View
                  style={[
                    styles.catNumCircle,
                    {
                      backgroundColor:
                        (isDark
                          ? CATEGORY_COLORS[cat.number]?.dark.bg
                          : CATEGORY_COLORS[cat.number]?.light.bg) || colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontWeight: '700',
                      color:
                        (isDark
                          ? CATEGORY_COLORS[cat.number]?.dark.text
                          : CATEGORY_COLORS[cat.number]?.light.text) || colors.primary,
                    }}
                  >
                    0{cat.number}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.catNameTamil, { color: colors.text }]}>{cat.nameTamil}</Text>
                  <Text style={[styles.catNameEnglish, { color: colors.textSecondary }]}>
                    {cat.nameEnglish} ({cat.transliteration})
                  </Text>
                </View>
              </View>

              <View style={styles.categoryCardRight}>
                <Text style={[styles.catCount, { color: colors.textMuted }]}>
                  {cat.chapters.length} அ அதிகாரங்கள்
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <AddToCollectionModal
        visible={!!modalKural}
        onClose={() => setModalKural(null)}
        kural={modalKural}
      />

      <ShareModal
        visible={!!shareKural}
        onClose={() => setShareKural(null)}
        kural={shareKural}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valluvarBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valluvarIcon: {
    fontSize: 26,
    fontWeight: '700',
  },
  titleColumn: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  tagline: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  searchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  searchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  qaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  qaSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  randomCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  randomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  randomBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  randomPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  randomPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  randomChapterText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  shuffleBtn: {
    padding: 6,
  },
  kuralTextContainer: {
    marginVertical: 6,
  },
  kuralTamilLine: {
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  kuralTranslitContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  kuralTranslitText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  randomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  viewKuralBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewKuralText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catNumCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catNameTamil: {
    fontSize: 16,
    fontWeight: '700',
  },
  catNameEnglish: {
    fontSize: 12.5,
    marginTop: 2,
  },
  categoryCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catCount: {
    fontSize: 12,
  },
});
