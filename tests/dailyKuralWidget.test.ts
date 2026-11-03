import {
  getDailyKural,
  generateDailyKuralTimeline,
  syncDailyKuralWidget,
} from '../src/services/dailyKuralService';
import { KuralService } from '../src/services/kuralService';

describe('Daily Thirukkural Widget Service', () => {
  test('returns a valid daily Kural with chapter for today', () => {
    const daily = getDailyKural();
    expect(daily.kuralNumber).toBeGreaterThanOrEqual(1);
    expect(daily.kuralNumber).toBeLessThanOrEqual(1330);
    expect(daily.kural).toBeDefined();
    expect(daily.chapter).toBeDefined();
    expect(daily.chapterNameTamil).toBeTruthy();
    expect(daily.headerText).toContain(String(daily.kuralNumber));
    expect(daily.headerText).toContain(daily.chapterNameTamil);
  });

  test('strictly enforces the 4+3 word rule: 4 words in first line, 3 words in second line', () => {
    const daily = getDailyKural();
    const wordsLine1 = daily.line1.trim().split(/\s+/);
    const wordsLine2 = daily.line2.trim().split(/\s+/);

    expect(wordsLine1.length).toBe(4);
    expect(wordsLine2.length).toBe(3);
  });

  test('ensures no ellipsis or word cuts in the lines', () => {
    const daily = getDailyKural();
    expect(daily.line1).not.toMatch(/(\.{3}|…)/);
    expect(daily.line2).not.toMatch(/(\.{3}|…)/);
  });

  test('provides valid deep links for Kural detail and Share action', () => {
    const daily = getDailyKural();
    expect(daily.kuralUrl).toBe(`thirukkural://kural/${daily.kuralNumber}`);
    expect(daily.shareUrl).toBe(`thirukkural://kural/${daily.kuralNumber}?action=share`);
  });

  test('is deterministic for the same date', () => {
    const fixedDate = new Date(2026, 10, 3); // Nov 3, 2026
    const kuralA = getDailyKural(fixedDate);
    const kuralB = getDailyKural(fixedDate);

    expect(kuralA.kuralNumber).toBe(kuralB.kuralNumber);
    expect(kuralA.line1).toBe(kuralB.line1);
    expect(kuralA.line2).toBe(kuralB.line2);
  });

  test('advances across dates', () => {
    const day1 = new Date(2026, 10, 1);
    const day2 = new Date(2026, 10, 2);
    const kural1 = getDailyKural(day1);
    const kural2 = getDailyKural(day2);

    expect(kural1.kuralNumber).not.toBe(kural2.kuralNumber);
  });

  test('generates valid multi-day widget timeline entries', () => {
    const timeline = generateDailyKuralTimeline(new Date(2026, 10, 1), 7);
    expect(timeline.length).toBe(7);

    for (const entry of timeline) {
      expect(entry.date).toBeInstanceOf(Date);
      expect(entry.props.kuralNumber).toBeGreaterThanOrEqual(1);
      expect(entry.props.kuralNumber).toBeLessThanOrEqual(1330);

      // Verify 4+3 rule on every timeline entry
      const w1 = entry.props.line1.trim().split(/\s+/);
      const w2 = entry.props.line2.trim().split(/\s+/);
      expect(w1.length).toBe(4);
      expect(w2.length).toBe(3);

      expect(entry.props.line1).not.toMatch(/(\.{3}|…)/);
      expect(entry.props.line2).not.toMatch(/(\.{3}|…)/);
      expect(entry.props.shareUrl).toBe(
        `thirukkural://kural/${entry.props.kuralNumber}?action=share`
      );
    }
  });

  test('syncDailyKuralWidget executes safely without throwing', async () => {
    await expect(syncDailyKuralWidget()).resolves.toBeDefined();
  });

  test('verifies 4+3 rule across all 1330 Kurals', () => {
    const allKurals = KuralService.getAllKurals();
    expect(allKurals.length).toBe(1330);

    for (const k of allKurals) {
      const wordsL1 = k.line1.trim().split(/\s+/);
      const wordsL2 = k.line2.trim().split(/\s+/);
      expect(wordsL1.length).toBe(4);
      expect(wordsL2.length).toBe(3);
      expect(k.line1).not.toMatch(/(\.{3}|…)$/);
      expect(k.line2).not.toMatch(/(\.{3}|…)$/);
    }
  });
});

