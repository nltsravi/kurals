import { Platform } from 'react-native';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { WidgetDailyKuralProps } from '../src/services/dailyKuralService';

const fallbackProps: WidgetDailyKuralProps = {
  kuralNumber: 1,
  chapterNumber: 1,
  chapterNameTamil: 'கடவுள் வாழ்த்து',
  chapterNameEnglish: 'The Praise of God',
  headerText: 'குறள் 1 • கடவுள் வாழ்த்து',
  line1: 'அகர முதல எழுத்தெல்லாம் ஆதி',
  line2: 'பகவன் முதற்றே உலகு',
  shareUrl: 'thirukkural://kural/1?action=share',
  kuralUrl: 'thirukkural://kural/1',
};

/**
 * Universal Daily Thirukkural Widget Entrypoint.
 * Automatically delegates to platform-specific layouts:
 * - iOS: Swift UI WidgetKit layout (widgets/DailyKuralWidget.ios.tsx)
 * - Android: Jetpack Compose Glance layout (widgets/DailyKuralWidget.android.tsx)
 */
export const DailyKuralWidget = (
  props: WidgetDailyKuralProps,
  context?: WidgetEnvironment
) => {
  'widget';

  if (Platform.OS === 'android') {
    const { DailyKuralWidget: AndroidWidget } = require('./DailyKuralWidget.android');
    return AndroidWidget(props, context);
  }

  const { DailyKuralWidget: IosWidget } = require('./DailyKuralWidget.ios');
  return IosWidget(props, context);
};

export default createWidget<WidgetDailyKuralProps>(
  'DailyKuralWidget',
  DailyKuralWidget,
  fallbackProps
);

