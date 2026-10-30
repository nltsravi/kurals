const {
  withAndroidManifest,
  withGradleProperties,
  withAppBuildGradle,
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin to address Google Play Store recommendations:
 * 1. Edge-to-Edge: Enables React Native's modern edgeToEdgeEnabled flag in gradle.properties
 * 2. Large Screen Devices: Ensures MainActivity has android:resizeableActivity="true" and no portrait lock
 * 3. R8 Optimization: Enables R8 fullMode in gradle.properties
 * 4. Production Release Signing: Configures release signingConfig with release.keystore for Play Store
 */
const withAndroidOptimizations = (config) => {
  // 1. Configure gradle.properties
  config = withGradleProperties(config, (config) => {
    const properties = config.modResults;

    const setProperty = (key, value) => {
      const item = properties.find((p) => p.type === 'property' && p.key === key);
      if (item) {
        item.value = value;
      } else {
        properties.push({ type: 'property', key, value });
      }
    };

    // Enables React Native's modern Edge-to-Edge implementation
    setProperty('edgeToEdgeEnabled', 'true');
    setProperty('react.edgeToEdgeEnabled', 'true');

    // Enables R8 Full Mode for enhanced code shrinking & tree-shaking
    setProperty('android.enableR8.fullMode', 'true');

    return config;
  });

  // 2. Configure AndroidManifest.xml for Large Screen & Adaptive Resizing
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      // Ensure application is marked as resizeable
      mainApplication.$['android:resizeableActivity'] = 'true';

      const mainActivity = mainApplication.activity?.find(
        (a) => a.$?.['android:name'] === '.MainActivity' || a.$?.['android:name'] === 'com.nltsravi.kurals.MainActivity'
      );
      if (mainActivity) {
        mainActivity.$['android:resizeableActivity'] = 'true';
        // Remove fixed orientation restriction to support foldables, tablets, and Android 16+
        delete mainActivity.$['android:screenOrientation'];
      }
    }
    return config;
  });

  // 3. Configure Production Release Signing in app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('signingConfigs.release')) {
      const releaseSigningConfig = `
        release {
            def releaseKeystore = file('../../release.keystore').exists() ? file('../../release.keystore') : (file('release.keystore').exists() ? file('release.keystore') : null)
            if (releaseKeystore != null) {
                storeFile releaseKeystore
                storePassword System.getenv("RELEASE_KEYSTORE_PASSWORD") ?: "kurals2026release"
                keyAlias System.getenv("RELEASE_KEY_ALIAS") ?: "kurals-release-key"
                keyPassword System.getenv("RELEASE_KEY_PASSWORD") ?: "kurals2026release"
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;

      // Insert release signingConfig into signingConfigs block
      contents = contents.replace(
        /signingConfigs\s*\{([\s\S]*?debug\s*\{[\s\S]*?\})/,
        `signingConfigs {$1${releaseSigningConfig}`
      );

      // In buildTypes { release { ... } }, replace signingConfig with signingConfigs.release
      contents = contents.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
        '$1signingConfig signingConfigs.release'
      );

      config.modResults.contents = contents;
    }

    return config;
  });

  return config;
};

module.exports = withAndroidOptimizations;
