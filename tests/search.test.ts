import { SearchService } from '../src/services/searchService';
import { normalizeSearchText } from '../src/utils/text';

describe('Search Functionality & Ranking', () => {
  test('normalizes search text properly', () => {
    expect(normalizeSearchText('  அகர   முதல!  ')).toBe('அகர முதல');
    expect(normalizeSearchText('Katavul Vaazhththu')).toBe('katavul vaazhththu');
    expect(normalizeSearchText(123)).toBe('123');
    expect(normalizeSearchText(null)).toBe('');
  });

  test('searches by exact Kural number (e.g. "1")', () => {
    const results = SearchService.search('1');
    expect(results.length).toBeGreaterThan(0);
    // Exact match for Kural 1 must be first
    expect(results[0].number).toBe(1);
  });

  test('searches by Kural number 1330', () => {
    const results = SearchService.search('1330');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].number).toBe(1330);
  });

  test('searches by Chapter name in Tamil ("வான்சிறப்பு")', () => {
    const results = SearchService.search('வான்சிறப்பு');
    expect(results.length).toBeGreaterThan(0);
    // All 10 kurals of chapter 2 should appear in results
    const chapterKurals = results.filter((k) => k.chapterNameTamil === 'வான்சிறப்பு');
    expect(chapterKurals.length).toBe(10);
  });

  test('searches by Tamil partial text ("அகர முதல")', () => {
    const results = SearchService.search('அகர முதல');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].number).toBe(1);
    expect(results[0].line1).toContain('அகர முதல');
  });

  test('searches by English transliteration ("Akara Mudhala")', () => {
    const results = SearchService.search('Akara Mudhala');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].number).toBe(1);
  });

  test('case-insensitive search works ("akara mudhala")', () => {
    const results = SearchService.search('akara mudhala');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].number).toBe(1);
  });

  test('searches by Category ("காமத்துப்பால்")', () => {
    const results = SearchService.search('காமத்துப்பால்');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].categoryTamil).toBe('காமத்துப்பால்');
  });

  test('handles empty or whitespace query gracefully', () => {
    expect(SearchService.search('')).toEqual([]);
    expect(SearchService.search('   ')).toEqual([]);
  });
});
