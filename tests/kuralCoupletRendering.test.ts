import { KuralService } from '../src/services/kuralService';
import { formatKuralCouplet, formatKuralForSocialShare, formatKuralText } from '../src/utils/text';
import { calculateCoupletFontSizes } from '../src/components/KuralCoupletText';

const allKurals = KuralService.getAllKurals();

describe('Thirukkural Couplet Structure and Word Count Verification', () => {
  test('verifies total Kural count is exactly 1,330', () => {
    expect(allKurals).toHaveLength(1330);
  });

  test('verifies EVERY single one of the 1,330 Kurals has exactly 4 words on Line 1 and 3 words on Line 2', () => {
    const invalidKurals: { number: number; line1Words: number; line2Words: number; line1: string; line2: string }[] = [];

    for (const kural of allKurals) {
      const line1Words = kural.line1.trim().split(/\s+/).length;
      const line2Words = kural.line2.trim().split(/\s+/).length;

      if (line1Words !== 4 || line2Words !== 3) {
        invalidKurals.push({
          number: kural.number,
          line1Words,
          line2Words,
          line1: kural.line1,
          line2: kural.line2,
        });
      }
    }

    if (invalidKurals.length > 0) {
      console.error('Invalid Kurals found:', invalidKurals);
    }

    expect(invalidKurals).toEqual([]);
  });

  test('verifies previously problematic Kurals now have correct word counts', () => {
    const oddNums = [42, 60, 70, 74, 82, 143, 211, 347, 408, 530, 532, 542, 689, 908, 950, 956, 976, 988, 1081, 1117, 1129, 1130, 1192, 1284, 1307];

    for (const num of oddNums) {
      const kural = KuralService.getKuralByNumber(num);
      expect(kural).toBeDefined();
      if (!kural) continue;

      const words1 = kural.line1.trim().split(/\s+/);
      const words2 = kural.line2.trim().split(/\s+/);

      expect(words1).toHaveLength(4);
      expect(words2).toHaveLength(3);
    }
  });

  test('verifies Kural 1192 does not have corrupted character codes', () => {
    const kural = KuralService.getKuralByNumber(1192)!;
    expect(kural.line2).toBe('வீழ்வார் அளிக்கும் அளி.');
    expect(kural.line2).not.toContain('\u0BA7');
  });

  test('verifies Kural 1117 does not have duplicate words', () => {
    const kural = KuralService.getKuralByNumber(1117)!;
    expect(kural.line1).toBe('அறுவாய் நிறைந்த அவிர்மதிக்குப் போல');
    const words = kural.line1.split(' ');
    expect(words).toHaveLength(4);
  });
});

describe('formatKuralCouplet utility', () => {
  test('formats clean lines with 4 words and 3 words', () => {
    const res = formatKuralCouplet('அகர முதல எழுத்தெல்லாம் ஆதி', 'பகவன் முதற்றே உலகு.');
    expect(res.line1).toBe('அகர முதல எழுத்தெல்லாம் ஆதி');
    expect(res.line2).toBe('பகவன் முதற்றே உலகு.');
    expect(res.tamil).toBe('அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.');
  });

  test('cleans excessive whitespace between words', () => {
    const res = formatKuralCouplet('  அகர   முதல    எழுத்தெல்லாம்  ஆதி  ', '  பகவன்   முதற்றே   உலகு.  ');
    expect(res.line1).toBe('அகர முதல எழுத்தெல்லாம் ஆதி');
    expect(res.line2).toBe('பகவன் முதற்றே உலகு.');
  });

  test('rebalances 7 words when passed in single string or wrong line split', () => {
    const singleString = 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.';
    const res = formatKuralCouplet('', '', singleString);
    expect(res.line1).toBe('அகர முதல எழுத்தெல்லாம் ஆதி');
    expect(res.line2).toBe('பகவன் முதற்றே உலகு.');
    expect(res.line1.split(' ')).toHaveLength(4);
    expect(res.line2.split(' ')).toHaveLength(3);
  });

  test('strips any trailing ellipsis suffix (... or …) from the Thirukkural', () => {
    const resWithThreeDots = formatKuralCouplet(
      'அகர முதல எழுத்தெல்லாம் ஆதி...',
      'பகவன் முதற்றே உலகு....'
    );
    expect(resWithThreeDots.line1).toBe('அகர முதல எழுத்தெல்லாம் ஆதி');
    expect(resWithThreeDots.line2).toBe('பகவன் முதற்றே உலகு.');
    expect(resWithThreeDots.line1).not.toContain('...');
    expect(resWithThreeDots.line2).not.toContain('...');

    const resWithUnicodeEllipsis = formatKuralCouplet(
      'துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்…',
      'துப்பார்க்குத் துப்பாய தூஉம் மழை.…'
    );
    expect(resWithUnicodeEllipsis.line1).toBe('துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்');
    expect(resWithUnicodeEllipsis.line2).toBe('துப்பார்க்குத் துப்பாய தூஉம் மழை.');
    expect(resWithUnicodeEllipsis.line1).not.toContain('…');
    expect(resWithUnicodeEllipsis.line2).not.toContain('…');
  });

  test('ensures NO Kural in the entire 1,330 dataset has an ellipsis suffix', () => {
    for (const kural of allKurals) {
      expect(kural.line1).not.toMatch(/(\.{3}|…)$/);
      expect(kural.line2).not.toMatch(/(\.{3}|…)$/);
    }
  });
});

describe('calculateCoupletFontSizes dynamic font scaling', () => {
  test('returns identical font size for both lines of the couplet for normal length lines', () => {
    const kural1 = KuralService.getKuralByNumber(1)!;
    const { line1Size, line2Size, fontSize } = calculateCoupletFontSizes(kural1.line1, kural1.line2, 19.5);

    expect(line1Size).toBeLessThanOrEqual(19.5);
    expect(line1Size).toBeGreaterThan(17);
    expect(line2Size).toBe(line1Size);
    expect(fontSize).toBe(line1Size);
  });

  test('scales down font size uniformly so both lines share the same adjusted font size and 4 words fit on 1 line', () => {
    // Kural 12 has one of the longest first lines (48 chars)
    const kural12 = KuralService.getKuralByNumber(12)!;
    const { line1Size, line2Size, fontSize } = calculateCoupletFontSizes(kural12.line1, kural12.line2, 19.5);

    // Font size should be scaled down to prevent wrapping
    expect(line1Size).toBeLessThan(16);
    // Line 1 and Line 2 must have the EXACT SAME font size
    expect(line2Size).toBe(line1Size);
    expect(fontSize).toBe(line1Size);
  });

  test('calculates uniform font size using container width ensuring identical size on both lines', () => {
    const kural12 = KuralService.getKuralByNumber(12)!;
    const { line1Size, line2Size, fontSize } = calculateCoupletFontSizes(kural12.line1, kural12.line2, 16.5, 280);

    expect(line1Size).toBe(line2Size);
    expect(fontSize).toBe(line1Size);
    expect(fontSize).toBeLessThanOrEqual(16.5);
    expect(fontSize).toBeGreaterThanOrEqual(11);
  });

  test('adjusts font size for all words across top longest Kurals in typical container widths', () => {
    // Kurals with longest lines: 12, 43, 118, 320, 1241, 1267
    const longestNums = [12, 43, 118, 320, 1241, 1267];
    for (const num of longestNums) {
      const kural = KuralService.getKuralByNumber(num)!;
      const { line1Size, line2Size, fontSize } = calculateCoupletFontSizes(kural.line1, kural.line2, 19.5, 320);

      // Line 1 and Line 2 MUST have the exact same font size
      expect(line1Size).toBe(line2Size);
      expect(fontSize).toBe(line1Size);
      // Font size must be adjusted down from 19.5 to fit all words
      expect(fontSize).toBeLessThan(18);
      expect(fontSize).toBeGreaterThanOrEqual(11);
    }
  });

  test('every single one of the 1,330 Kurals receives a valid, uniform font size across all words', () => {
    for (const kural of allKurals) {
      const { line1Size, line2Size, fontSize } = calculateCoupletFontSizes(kural.line1, kural.line2, 16.5, 300);
      expect(line1Size).toBe(line2Size);
      expect(fontSize).toBe(line1Size);
      expect(fontSize).toBeGreaterThanOrEqual(11);
      expect(fontSize).toBeLessThanOrEqual(16.5);
    }
  });
});

describe('Status update text and social sharing word counts', () => {
  test('formatKuralForSocialShare formats Tamil couplet with 4 words on line 1 and 3 words on line 2', () => {
    const oddNums = [1, 42, 60, 70, 74, 82, 143, 211, 347, 408, 530, 532, 542, 689, 908, 950, 956, 976, 988, 1081, 1117, 1129, 1130, 1192, 1284, 1307];

    for (const num of oddNums) {
      const kural = KuralService.getKuralByNumber(num)!;
      const shareText = formatKuralForSocialShare(kural, { meaningType: 'mv' });

      // Check that the couplet appears in share text as 2 lines: line 1 has 4 words, line 2 has 3 words
      expect(shareText).toContain(kural.line1);
      expect(shareText).toContain(kural.line2);

      const words1 = kural.line1.split(' ');
      const words2 = kural.line2.split(' ');
      expect(words1).toHaveLength(4);
      expect(words2).toHaveLength(3);
    }
  });

  test('formatKuralText outputs 4 words on line 1 and 3 words on line 2', () => {
    const kural1 = KuralService.getKuralByNumber(1)!;
    const textTamilOnly = formatKuralText(kural1, 'tamil');

    const lines = textTamilOnly.split('\n\n')[1].split('\n');
    expect(lines[0].split(' ')).toHaveLength(4);
    expect(lines[1].split(' ')).toHaveLength(3);
  });
});
