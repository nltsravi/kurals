#!/usr/bin/env bash

# ==============================================================================
# Thirukkural Mobile App - Android Play Store Packaging & Build Script
# ==============================================================================
# Usage:
#   ./scripts/build-android.sh               # Builds production .aab for Google Play Store
#   ./scripts/build-android.sh --production  # Same as above (EAS Cloud .aab)
#   ./scripts/build-android.sh --preview     # Builds installable .apk for testing
#   ./scripts/build-android.sh --local       # Local build via Expo prebuild & Gradle
#   ./scripts/build-android.sh --submit      # Submits existing build to Play Store
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "  திருக்குறள் (Thirukkural) - Android Play Store Packaging "
echo "=========================================================="
echo -e "${NC}"

BUILD_MODE="production"
SKIP_TESTS=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -p|--production)
      BUILD_MODE="production"
      shift
      ;;
    --preview|--apk)
      BUILD_MODE="preview"
      shift
      ;;
    -l|--local)
      BUILD_MODE="local"
      shift
      ;;
    -s|--submit)
      BUILD_MODE="submit"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./scripts/build-android.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -p, --production  Build production Android App Bundle (.aab) for Google Play Store (Default)"
      echo "  --preview, --apk  Build testable APK (.apk) for internal device distribution"
      echo "  -l, --local       Build locally using Expo prebuild and Android Gradle"
      echo "  -s, --submit      Submit completed production build to Google Play Store"
      echo "  --skip-tests      Skip pre-build typecheck and test verification"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help to view available options."
      exit 1
      ;;
  esac
done

# Step 1: Validate configuration files
echo -e "${BLUE}==> [1/4] Checking project configuration...${NC}"

if [ ! -f "app.json" ]; then
  echo -e "${RED}Error: app.json not found in project root!${NC}"
  exit 1
fi

if [ ! -f "eas.json" ]; then
  echo -e "${RED}Error: eas.json not found in project root!${NC}"
  exit 1
fi

# Extract package and versionCode from app.json using node
PKG_NAME=$(node -e "const c = require('./app.json'); console.log(c.expo?.android?.package || '');")
VERSION_CODE=$(node -e "const c = require('./app.json'); console.log(c.expo?.android?.versionCode || '');")
APP_VERSION=$(node -e "const c = require('./app.json'); console.log(c.expo?.version || '1.0.0');")

if [ -z "$PKG_NAME" ]; then
  echo -e "${RED}Error: 'android.package' is missing from app.json! Google Play Store requires a valid package name.${NC}"
  exit 1
fi

if [ -z "$VERSION_CODE" ]; then
  echo -e "${RED}Error: 'android.versionCode' is missing from app.json! Google Play Store requires an integer versionCode.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Package Name: ${BOLD}${PKG_NAME}${NC}"
echo -e "${GREEN}✓ App Version:  ${BOLD}${APP_VERSION} (code: ${VERSION_CODE})${NC}"
echo -e "${GREEN}✓ Target Store: ${BOLD}Google Play Store${NC}"

# Step 2: Quality verification (Lint, Typecheck, Tests)
if [ "$SKIP_TESTS" = true ]; then
  echo -e "${YELLOW}==> [2/4] Skipping tests and typecheck (--skip-tests specified)...${NC}"
else
  echo -e "${BLUE}==> [2/4] Running pre-build validation (TypeScript & Jest)...${NC}"

  echo -n "  • Typechecking with TypeScript... "
  if npx tsc --noEmit; then
    echo -e "${GREEN}Passed${NC}"
  else
    echo -e "${RED}Failed! Aborting build due to TypeScript compilation errors.${NC}"
    exit 1
  fi

  echo -n "  • Running test suite... "
  if npm test -- --silent > /dev/null 2>&1; then
    echo -e "${GREEN}All tests passed${NC}"
  else
    echo -e "${RED}Failed! Aborting build due to test failures.${NC}"
    npm test
    exit 1
  fi
fi

# Step 3: Check EAS / Cloud or Local toolchain
echo -e "${BLUE}==> [3/4] Preparing build environment (${BUILD_MODE})...${NC}"

if [ "$BUILD_MODE" = "local" ]; then
  echo -e "${YELLOW}Starting local Android build using Expo prebuild & Gradle...${NC}"
  echo "Generating native android project..."
  npx expo prebuild --platform android --clean

  if [ ! -d "android" ]; then
    echo -e "${RED}Error: Native android directory could not be generated.${NC}"
    exit 1
  fi

  echo "Building release bundle (.aab) with Gradle..."
  cd android
  ./gradlew bundleRelease
  cd ..

  AAB_OUTPUT="android/app/build/outputs/bundle/release/app-release.aab"
  if [ -f "$AAB_OUTPUT" ]; then
    echo -e "${GREEN}${BOLD}✓ Local build successful!${NC}"
    echo -e "AAB file located at: ${CYAN}${AAB_OUTPUT}${NC}"
  fi
  exit 0
fi

# Step 4: EAS Build (Cloud)
echo -e "${BLUE}==> [4/4] Executing EAS Build for Android...${NC}"

# Check EAS CLI login status
echo "Checking EAS credentials..."
WHOAMI=$(npx eas-cli@latest whoami 2>&1 || true)

if echo "$WHOAMI" | grep -q "Not logged in"; then
  echo -e "${YELLOW}You are not logged in to Expo. Please log in to proceed with EAS Build:${NC}"
  npx eas-cli@latest login
fi

case $BUILD_MODE in
  production)
    echo -e "${CYAN}Triggering production build (.aab Android App Bundle) for Google Play Store...${NC}"
    echo "Command: npx eas-cli@latest build --platform android --profile production"
    npx eas-cli@latest build --platform android --profile production
    ;;
  preview)
    echo -e "${CYAN}Triggering preview build (.apk) for internal testing...${NC}"
    echo "Command: npx eas-cli@latest build --platform android --profile preview"
    npx eas-cli@latest build --platform android --profile preview
    ;;
  submit)
    echo -e "${CYAN}Submitting latest production build to Google Play Store...${NC}"
    echo "Command: npx eas-cli@latest submit --platform android"
    npx eas-cli@latest submit --platform android
    ;;
esac

echo ""
echo -e "${GREEN}${BOLD}==========================================================${NC}"
echo -e "${GREEN}${BOLD}  Android packaging workflow completed successfully!       ${NC}"
echo -e "${GREEN}${BOLD}==========================================================${NC}"
echo -e "Next steps for Google Play Console:"
echo -e "1. Download the generated ${BOLD}.aab${NC} file from the EAS build dashboard (or terminal link)."
echo -e "2. Log in to ${CYAN}https://play.google.com/console${NC}"
echo -e "3. Create a new app with Package Name: ${BOLD}${PKG_NAME}${NC}"
echo -e "4. Go to ${BOLD}Testing -> Internal Testing${NC} (or Production) and upload the .aab."
echo -e "5. Complete the Store Listing, Content Rating, and Privacy Policy details."
echo ""
