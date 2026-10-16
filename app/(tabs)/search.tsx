import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SearchBar } from '../../src/components/SearchBar';
import { KuralCard } from '../../src/components/KuralCard';
import { EmptyState } from '../../src/components/EmptyState';
import { AddToCollectionModal } from '../../src/components/AddToCollectionModal';
import { ShareModal } from '../../src/components/ShareModal';
import { useKuralSearch } from '../../src/hooks/useKuralSearch';
import { useCollections } from '../../src/context/CollectionContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Kural } from '../../src/types/kural';

const SEARCH_SUGGESTIONS = [
  '1',
  'வான்சிறப்பு',
  'அறத்துப்பால்',
  'அகர முதல',
  'காமத்துப்பால்',
  'நட்பு',
  'அன்புடைமை',
  'agaram',
  '1330',
];

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t, isEnglish } = useLanguage();
  const { query, setQuery, results, isSearching, clearQuery } = useKuralSearch('', 200);
  const { isKuralInCollection, collections } = useCollections();
  const [modalKural, setModalKural] = useState<Kural | null>(null);
  const [shareKural, setShareKural] = useState<Kural | null>(null);

  const renderContent = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.searchingText, { color: colors.textSecondary }]}>
            {t.searchScreen.searching}
          </Text>
        </View>
      );
    }

    if (!query.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title={t.searchScreen.emptyTitle}
          description={t.searchScreen.emptyDesc}
          suggestions={SEARCH_SUGGESTIONS}
          onSuggestionPress={(item) => setQuery(item)}
        />
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title={t.searchScreen.noResultsTitle}
          description={t.searchScreen.noResultsDesc}
          suggestions={['1', 'அறத்துப்பால்', 'அன்புடைமை']}
          onSuggestionPress={(item) => setQuery(item)}
        />
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.number)}
        renderItem={({ item }) => {
          const isSaved = collections.some((c) => c.kuralNumbers.includes(item.number));
          return (
            <KuralCard
              kural={item}
              onPress={() => router.push(`/kural/${item.number}`)}
              onAddToCollection={() => setModalKural(item)}
              onShare={() => setShareKural(item)}
              isSaved={isSaved}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {results.length} {results.length === 1 ? t.searchScreen.singleResultFound : t.searchScreen.resultsFound}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEnglish ? 'Search' : 'தேடல்'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {isEnglish ? 'Search Thirukkural' : 'திருக்குறள் தேடல்'}
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={clearQuery}
        placeholder={t.searchScreen.placeholder}
      />

      <View style={styles.body}>{renderContent()}</View>

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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  searchingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 30,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
