#!/usr/bin/env node

/**
 * Thirukkural Mobile App - Build Number Generator & Updater
 * Format: {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}
 *
 * Example:
 *   Date: 2026-10-01 08:46:34.123
 *   Version: 1.0.0
 *   Build Number: 123344608202610011.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Generates a formatted build number string according to:
 * {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}
 *
 * @param {string} version - Application version (e.g. "1.0.0")
 * @param {Date} [date] - Date object to extract timestamp components from (defaults to now)
 * @returns {string} Formatted build number
 */
function generateBuildNumber(version = '1.1.0', date = new Date()) {
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const appVersion = String(version || '1.1.0');

  return `${ms}${ss}${mm}${hh}${yyyy}${MM}${dd}${appVersion}`;
}

/**
 * Updates src/constants/buildInfo.json and app.json with a fresh build number.
 *
 * @param {Date} [customDate] - Optional date override (useful for testing)
 * @returns {{ version: string, buildNumber: string, updatedAt: string }} Build info object
 */
function updateBuildNumber(customDate = new Date()) {
  const rootDir = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const appJsonPath = path.join(rootDir, 'app.json');
  const buildInfoPath = path.join(rootDir, 'src/constants/buildInfo.json');

  let version = '1.1.0';

  // Read current version from app.json first, fallback to package.json
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      if (appJson.expo?.version) {
        version = appJson.expo.version;
      }
    } catch (e) {
      console.warn('[build-number] Warning: Could not read version from app.json', e.message);
    }
  } else if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (pkg.version) version = pkg.version;
    } catch (e) {
      console.warn('[build-number] Warning: Could not read version from package.json', e.message);
    }
  }

  const buildNumber = generateBuildNumber(version, customDate);
  const updatedAt = customDate.toISOString();

  const buildInfoData = {
    version,
    buildNumber,
    updatedAt,
  };

  // 1. Ensure directory exists and write src/constants/buildInfo.json
  const buildInfoDir = path.dirname(buildInfoPath);
  if (!fs.existsSync(buildInfoDir)) {
    fs.mkdirSync(buildInfoDir, { recursive: true });
  }
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfoData, null, 2) + '\n', 'utf8');

  // 2. Update app.json extra.buildNumber if app.json exists
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      if (!appJson.expo) appJson.expo = {};
      if (!appJson.expo.extra) appJson.expo.extra = {};
      appJson.expo.extra.buildNumber = buildNumber;
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.warn('[build-number] Warning: Could not update app.json extra.buildNumber', e.message);
    }
  }

  console.log(`[build-number] Generated Build Number: ${buildNumber} (Version: ${version})`);
  return buildInfoData;
}

// Execute directly if run as a script
if (require.main === module) {
  updateBuildNumber();
}

module.exports = {
  generateBuildNumber,
  updateBuildNumber,
};
