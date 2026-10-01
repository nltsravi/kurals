const fs = require('fs');
const path = require('path');
const { generateBuildNumber } = require('./scripts/update-build-number');

/**
 * Dynamic Expo Configuration
 * Injects build number following {milliseconds}{seconds}{minutes}{hours}{year}{month}{date}{appversion}
 * into Constants.expoConfig.extra.buildNumber
 */
module.exports = ({ config }) => {
  const buildInfoPath = path.join(__dirname, 'src/constants/buildInfo.json');
  let buildNumber = null;

  if (fs.existsSync(buildInfoPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
      if (data && data.buildNumber) {
        buildNumber = data.buildNumber;
      }
    } catch {
      // Fall through to generation
    }
  }

  const version = config.version || '1.0.0';
  if (!buildNumber) {
    buildNumber = generateBuildNumber(version);
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      buildNumber,
    },
  };
};
