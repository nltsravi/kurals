import { requireOptionalNativeModule } from 'expo';
import { KuralService } from './kuralService';
import { formatKuralCouplet } from '../utils/text';
import { Kural, Chapter } from '../types/kural';

export interface DailyKuralData {
  kural: Kural;
  chapter: Chapter;
  kuralNumber: number;
  chapterNumber: number;
  chapterNameTamil: string;
  chapterNameEnglish: string;
  headerText: string;
  line1: string;
  line2: string;
  shareUrl: string;
  kuralUrl: string;
}

export interface WidgetDailyKuralProps {
  kuralNumber: number;
  chapterNumber: number;
  chapterNameTamil: string;
  chapterNameEnglish: string;
  headerText: string;
  line1: string;
  line2: string;
  shareUrl: string;
  kuralUrl: string;
}

/**
 * Returns deterministic Daily Kural for a given calendar date.
 * Each date maps deterministically to a Kural number (1..1330),
 * cycling smoothly day after day.
 *
 * Guaranteed 4+3 word structure:
 * - Line 1: exactly 4 words
 * - Line 2: exactly 3 words
 * - Left aligned, uniform font size, no ellipsis or word cuts.
 */
export function getDailyKural(date: Date = new Date()): DailyKuralData {
  // Epoch anchor: 2024-01-01 UTC
  const epoch = Date.UTC(2024, 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOffset = Math.floor((current - epoch) / (24 * 60 * 60 * 1000));
  const kuralNumber = (Math.abs(dayOffset) % 1330) + 1;

  const kural =
    KuralService.getKuralByNumber(kuralNumber) ||
    KuralService.getKuralByNumber(1)!;

  const chapter =
    KuralService.getChapterByNumber(kural.chapterNumber) ||
    KuralService.getChapterByNumber(1)!;

  const { line1, line2 } = formatKuralCouplet(kural.line1, kural.line2, kural.tamil);

  return {
    kural,
    chapter,
    kuralNumber: kural.number,
    chapterNumber: chapter.number,
    chapterNameTamil: chapter.nameTamil,
    chapterNameEnglish: chapter.nameEnglish,
    headerText: `குறள் ${kural.number} • ${chapter.nameTamil}`,
    line1,
    line2,
    shareUrl: `thirukkural://kural/${kural.number}?action=share`,
    kuralUrl: `thirukkural://kural/${kural.number}`,
  };
}

/**
 * Generates widget timeline entries for the specified number of days
 * starting from a given date.
 */
export function generateDailyKuralTimeline(
  startDate: Date = new Date(),
  daysCount: number = 30
): { date: Date; props: WidgetDailyKuralProps }[] {
  const entries: { date: Date; props: WidgetDailyKuralProps }[] = [];
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const day = startDate.getDate();

  for (let i = 0; i < daysCount; i++) {
    const entryDate = new Date(year, month, day + i, 0, 0, 0, 0);
    const dailyData = getDailyKural(entryDate);
    entries.push({
      date: entryDate,
      props: {
        kuralNumber: dailyData.kuralNumber,
        chapterNumber: dailyData.chapterNumber,
        chapterNameTamil: dailyData.chapterNameTamil,
        chapterNameEnglish: dailyData.chapterNameEnglish,
        headerText: dailyData.headerText,
        line1: dailyData.line1,
        line2: dailyData.line2,
        shareUrl: dailyData.shareUrl,
        kuralUrl: dailyData.kuralUrl,
      },
    });
  }

  return entries;
}

/**
 * Safely updates the native widget snapshot and timeline.
 * If expo-widgets native module is not present (e.g. web, tests, or unlinked runtime),
 * it fails gracefully without throwing.
 */
export async function syncDailyKuralWidget(): Promise<boolean> {
  try {
    const nativeWidgets = requireOptionalNativeModule('ExpoWidgets');
    if (!nativeWidgets) {
      return false;
    }

    const { createWidget } = require('expo-widgets');
    const today = getDailyKural();
    const widget = createWidget('DailyKuralWidget');

    if (widget?.updateSnapshot) {
      await widget.updateSnapshot({
        kuralNumber: today.kuralNumber,
        chapterNumber: today.chapterNumber,
        chapterNameTamil: today.chapterNameTamil,
        chapterNameEnglish: today.chapterNameEnglish,
        headerText: today.headerText,
        line1: today.line1,
        line2: today.line2,
        shareUrl: today.shareUrl,
        kuralUrl: today.kuralUrl,
      });
    }

    if (widget?.updateTimeline) {
      const timeline = generateDailyKuralTimeline(new Date(), 30);
      await widget.updateTimeline(timeline);
    }

    return true;
  } catch (err) {
    // Graceful degradation when running in environments without native widget support
    return false;
  }
}
