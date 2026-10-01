import { generateBuildNumber } from '../src/utils/buildNumber';
import { APP_CONFIG } from '../src/constants/appConstants';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { updateBuildNumber } = require('../scripts/update-build-number');

describe('Build Number Generation & Formatting', () => {
  test('follows the pattern {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}', () => {
    // Note: in JavaScript Date, month is 0-indexed: 9 = October
    const testDate = new Date(2026, 9, 1, 8, 46, 34, 123);
    const buildNumber = generateBuildNumber('1.0.0', testDate);

    // milliseconds: 123
    // seconds:      34
    // minutes:      46
    // hours:        08
    // year:         2026
    // month:        10
    // date:         01
    // appversion:   1.0.0
    expect(buildNumber).toBe('123344608202610011.0.0');
  });

  test('correctly zero-pads all components (single digits)', () => {
    // January 2, 2026 at 05:09:03.007
    const testDate = new Date(2026, 0, 2, 5, 9, 3, 7);
    const buildNumber = generateBuildNumber('2.1.0', testDate);

    // milliseconds: 007
    // seconds:      03
    // minutes:      09
    // hours:        05
    // year:         2026
    // month:        01
    // date:         02
    // appversion:   2.1.0
    expect(buildNumber).toBe('007030905202601022.1.0');
  });

  test('handles 2-digit milliseconds properly', () => {
    const testDate = new Date(2026, 11, 31, 23, 59, 59, 45);
    const buildNumber = generateBuildNumber('1.0.0', testDate);

    // milliseconds: 045
    // seconds:      59
    // minutes:      59
    // hours:        23
    // year:         2026
    // month:        12
    // date:         31
    // appversion:   1.0.0
    expect(buildNumber).toBe('045595923202612311.0.0');
  });

  test('defaults to version 1.1.0 and current date when not specified', () => {
    const buildNumber = generateBuildNumber();
    expect(typeof buildNumber).toBe('string');
    // 3 digits (ms) + 2 digits (s) + 2 digits (m) + 2 digits (h) + 4 digits (y) + 2 digits (mo) + 2 digits (d) + version
    const buildRegex = /^\d{3}\d{2}\d{2}\d{2}\d{4}\d{2}\d{2}1\.1\.0$/;
    expect(buildRegex.test(buildNumber)).toBe(true);
  });

  test('APP_CONFIG exposes valid buildNumber matching format', () => {
    expect(APP_CONFIG.buildNumber).toBeDefined();
    expect(typeof APP_CONFIG.buildNumber).toBe('string');
    // Ensure APP_CONFIG.buildNumber conforms to the timestamp + version format
    const buildRegex = /^\d{3}\d{2}\d{2}\d{2}\d{4}\d{2}\d{2}.+$/;
    expect(buildRegex.test(APP_CONFIG.buildNumber)).toBe(true);
  });

  test('updateBuildNumber script executes and returns valid build info', () => {
    const testDate = new Date(2026, 9, 1, 14, 30, 15, 789);
    const result = updateBuildNumber(testDate);

    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('buildNumber');
    expect(result).toHaveProperty('updatedAt');
    expect(result.buildNumber).toContain('78915301420261001');
  });
});
