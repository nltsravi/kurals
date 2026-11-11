const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withGradleProperties,
  withProjectBuildGradle,
  withAppBuildGradle,
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin to address Google Play Store recommendations and GPP deployment:
 * 1. Edge-to-Edge: Enables React Native's modern edgeToEdgeEnabled flag in gradle.properties
 * 2. Large Screen Devices: Ensures MainActivity has android:resizeableActivity="true" and no portrait lock
 * 3. R8 Optimization: Enables R8 fullMode in gradle.properties
 * 4. Production Release Signing: Configures release signingConfig with environment variable support (KEYSTORE_FILE, etc.)
 * 5. Gradle Play Publisher: Integrates com.github.triplet.play plugin and play { ... } configuration block
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

  // 3. Configure root build.gradle for Gradle Play Publisher classpath
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('play-publisher')) {
      if (!contents.includes('gradlePluginPortal()')) {
        contents = contents.replace(
          /(buildscript\s*\{[\s\S]*?repositories\s*\{)/,
          '$1\n    gradlePluginPortal()'
        );
      }
      contents = contents.replace(
        /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/,
        "$1\n    classpath('com.github.triplet.gradle:play-publisher:4.1.1')"
      );
      config.modResults.contents = contents;
    }
    return config;
  });

  // 4. Configure Production Release Signing & Gradle Play Publisher in app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('com.github.triplet.play')) {
      contents = contents.replace(
        /apply plugin: "com\.facebook\.react"/,
        'apply plugin: "com.facebook.react"\napply plugin: "com.github.triplet.play"'
      );
    }

    let storePassword = "kurals2026release";
    let keyAlias = "kurals-release-key";
    let keyPassword = "kurals2026release";

    try {
      const credsPath = path.resolve(config.modRequest.projectRoot, 'credentials.json');
      if (fs.existsSync(credsPath)) {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (creds.android?.keystore) {
          storePassword = creds.android.keystore.keystorePassword || storePassword;
          keyAlias = creds.android.keystore.keyAlias || keyAlias;
          keyPassword = creds.android.keystore.keyPassword || keyPassword;
        }
      }
    } catch {}

    const releaseSigningConfig = `
        release {
            def keystoreEnv = System.getenv("KEYSTORE_FILE") ?: System.getenv("RELEASE_KEYSTORE_FILE")
            def localKeystore = file('../../release.keystore').exists() ? file('../../release.keystore') : (file('release.keystore').exists() ? file('release.keystore') : null)
            def targetKeystore = keystoreEnv ? file(keystoreEnv) : localKeystore

            if (targetKeystore != null && (targetKeystore.exists() || keystoreEnv != null)) {
                storeFile targetKeystore
                storePassword System.getenv("KEYSTORE_PASSWORD") ?: System.getenv("RELEASE_KEYSTORE_PASSWORD") ?: "${storePassword}"
                keyAlias System.getenv("KEY_ALIAS") ?: System.getenv("RELEASE_KEY_ALIAS") ?: "${keyAlias}"
                keyPassword System.getenv("KEY_PASSWORD") ?: System.getenv("RELEASE_KEY_PASSWORD") ?: "${keyPassword}"
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;

    if (!contents.includes('signingConfigs.release')) {
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
    }

    if (!contents.includes('play {')) {
      const playBlock = `
play {
    def serviceAccountEnv = System.getenv("PLAY_SERVICE_ACCOUNT_JSON") ?: System.getenv("SERVICE_ACCOUNT_JSON")
    def defaultServiceAccountFile = file("play-service-account.json")
    def serviceAccountFile = serviceAccountEnv ? file(serviceAccountEnv) : (defaultServiceAccountFile.exists() ? defaultServiceAccountFile : file("../../play-service-account.json"))
    serviceAccountCredentials.set(serviceAccountFile)
    track.set(System.getenv("PLAY_TRACK") ?: "production")
    defaultToAppBundles.set(true)
}
`;
      contents += '\n' + playBlock;
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
};

module.exports = withAndroidOptimizations;
