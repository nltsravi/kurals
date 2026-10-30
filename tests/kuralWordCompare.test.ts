import {
  compareKuralWords,
  normalizeTamilText,
  splitTamilWords,
  tamilWordSimilarity,
} from '../src/utils/kuralWordCompare';

const KURAL_1 = 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு';

describe('Kural word-by-word comparison (spoken transcript vs Thirukkural)', () => {
  test('normalises punctuation, zero-width chars and whitespace', () => {
    expect(normalizeTamilText('  அகர,  முதல\u200C! ')).toBe('அகர முதல');
    expect(splitTamilWords('அகர முதல. எழுத்தெல்லாம்')).toEqual(['அகர', 'முதல', 'எழுத்தெல்லாம்']);
  });

  test('exact recitation marks every Kural word correct (100%)', () => {
    const res = compareKuralWords(KURAL_1, KURAL_1);
    expect(res.totalWords).toBe(7);
    expect(res.correctCount).toBe(7);
    expect(res.accuracy).toBe(100);
    expect(res.extraWords).toEqual([]);
    expect(res.words.every((w) => w.status === 'correct')).toBe(true);
  });

  test('mispronounced word (ழ -> ல) is shown as close with the exact spoken word', () => {
    const res = compareKuralWords('பழம்', 'பலம்');
    expect(res.words[0].spokenWord).toBe('பலம்');
    expect(res.words[0].status).toBe('close');
    expect(res.words[0].similarity).toBeLessThan(100);
  });

  test('skipped words are missing and extra spoken words are reported', () => {
    const res = compareKuralWords(KURAL_1, 'அகர முதல ஆதி பகவன் வணக்கம் உலகு');
    const missing = res.words.filter((w) => w.status === 'missing').map((w) => w.referenceWord);
    expect(missing).toContain('எழுத்தெல்லாம்');
    expect(res.words.find((w) => w.referenceWord === 'அகர')?.status).toBe('correct');
    expect(res.words.find((w) => w.referenceWord === 'உலகு')?.status).toBe('correct');
    expect(res.accuracy).toBeLessThan(90);
  });

  test('a compound Kural word split by the recogniser is matched to both spoken words', () => {
    const res = compareKuralWords('எழுத்தெல்லாம் ஆதி', 'எழுத்தெல் லாம் ஆதி');
    expect(res.words[0].spokenWord).toBe('எழுத்தெல் லாம்');
    expect(res.words[0].status).toBe('correct');
    expect(res.extraWords).toEqual([]);
  });

  test('completely different speech scores low and never passes as correct', () => {
    const res = compareKuralWords(KURAL_1, 'hello world');
    expect(res.correctCount).toBe(0);
    expect(res.accuracy).toBeLessThan(20);
  });

  test('similarity helper', () => {
    expect(tamilWordSimilarity('உலகு', 'உலகு')).toBe(1);
    expect(tamilWordSimilarity('உலகு', '')).toBe(0);
  });
});

