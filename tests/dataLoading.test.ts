import { KuralService } from '../src/services/kuralService';

describe('Thirukkural Data Loading & Integrity', () => {
  test('loads all 1,330 Kurals successfully without gaps', () => {
    const kurals = KuralService.getAllKurals();
    expect(kurals).toHaveLength(1330);

    // Verify continuous numbering from 1 to 1330
    for (let i = 0; i < 1330; i++) {
      expect(kurals[i].number).toBe(i + 1);
    }
  });

  test('loads all 133 Chapters accurately', () => {
    const chapters = KuralService.getAllChapters();
    expect(chapters).toHaveLength(133);

    // Check first and last chapters
    const first = chapters[0];
    expect(first.number).toBe(1);
    expect(first.nameTamil).toBe('கடவுள் வாழ்த்து');
    expect(first.startKural).toBe(1);
    expect(first.endKural).toBe(10);

    const last = chapters[132];
    expect(last.number).toBe(133);
    expect(last.nameTamil).toBe('ஊடலுவகை');
    expect(last.startKural).toBe(1321);
    expect(last.endKural).toBe(1330);
  });

  test('loads all 3 Categories with correct kural counts', () => {
    const categories = KuralService.getAllCategories();
    expect(categories).toHaveLength(3);

    // 1. Arathuppaal (38 chapters = 380 kurals)
    expect(categories[0].nameTamil).toBe('அறத்துப்பால்');
    expect(categories[0].chapters).toHaveLength(38);
    expect(categories[0].kuralCount).toBe(380);

    // 2. Porutpaal (70 chapters = 700 kurals)
    expect(categories[1].nameTamil).toBe('பொருட்பால்');
    expect(categories[1].chapters).toHaveLength(70);
    expect(categories[1].kuralCount).toBe(700);

    // 3. Kaamathuppaal (25 chapters = 250 kurals)
    expect(categories[2].nameTamil).toBe('காமத்துப்பால்');
    expect(categories[2].chapters).toHaveLength(25);
    expect(categories[2].kuralCount).toBe(250);
  });

  test('verifies Kural 1 has all required fields and commentary', () => {
    const kural = KuralService.getKuralByNumber(1);
    expect(kural).toBeDefined();
    if (!kural) return;

    expect(kural.number).toBe(1);
    expect(kural.line1).toContain('அகர முதல');
    expect(kural.line2).toContain('பகவன் முதற்றே');
    expect(kural.transliteration).toContain('Akara Mudhala');
    expect(kural.chapterNumber).toBe(1);
    expect(kural.chapterNameTamil).toBe('கடவுள் வாழ்த்து');
    expect(kural.categoryTamil).toBe('அறத்துப்பால்');
    expect(kural.commentaryMV).toBeDefined();
    expect(kural.commentarySP).toBeDefined();
    expect(kural.commentaryMK).toBeDefined();
  });

  test('random Kural generator returns a valid Kural within range', () => {
    const kural = KuralService.getRandomKural();
    expect(kural).toBeDefined();
    expect(kural.number).toBeGreaterThanOrEqual(1);
    expect(kural.number).toBeLessThanOrEqual(1330);
  });

  test('retrieves all 10 kurals for a chapter', () => {
    const kurals = KuralService.getKuralsByChapter(1);
    expect(kurals).toHaveLength(10);
    expect(kurals[0].number).toBe(1);
    expect(kurals[9].number).toBe(10);
  });

  test('regression: verifies thirukkural.json dataset remains strictly read-only and immutable', () => {
    const fs = require('fs');
    const crypto = require('crypto');
    const originalHash = crypto.createHash('sha256').update(fs.readFileSync('data/thirukkural.json')).digest('hex');
    const assetHash = crypto.createHash('sha256').update(fs.readFileSync('assets/data/thirukkural.json')).digest('hex');
    expect(originalHash).toBe(assetHash);
  });
});
