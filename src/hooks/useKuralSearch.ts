import { useState, useEffect, useRef } from 'react';
import { Kural } from '../types/kural';
import { SearchService } from '../services/searchService';

export function useKuralSearch(initialQuery = '', debounceMs = 200) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Kural[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    timerRef.current = setTimeout(() => {
      const searchResults = SearchService.search(query);
      setResults(searchResults);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearQuery: () => setQuery(''),
  };
}
