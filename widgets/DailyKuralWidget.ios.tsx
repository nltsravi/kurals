import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Spacer,
  Link,
  Image,
} from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
  widgetURL,
  containerBackground,
  frame,
} from '@expo/ui/swift-ui/modifiers';
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
 * Daily Thirukkural iOS Home Screen Widget.
 *
 * Rules:
 * - Only displays Thirukkural and Share button.
 * - Displays Kural number and chapter name.
 * - Displays Thirukkural couplet in 4+3 rule (4 words in first line, 3 words in second line).
 * - Left aligned.
 * - No ellipsis or word cut.
 * - Uniform font size across first and second lines.
 */
export const DailyKuralWidget = (
  props: WidgetDailyKuralProps,
  _context?: WidgetEnvironment
) => {
  'widget';

  const data = props?.kuralNumber ? props : fallbackProps;

  return (
    <VStack
      modifiers={[
        containerBackground('#FFF9F2', 'widget'),
        padding({ top: 12, bottom: 12, leading: 14, trailing: 14 }),
        widgetURL(data.kuralUrl),
        frame({ alignment: 'topLeading' }),
      ]}
    >
      {/* Header Row: Kural number & Chapter name (left), Share button (right) */}
      <HStack modifiers={[frame({ alignment: 'leading' })]}>
        <Text
          modifiers={[
            font({ size: 12, weight: 'bold' }),
            foregroundStyle('#D97706'),
            multilineTextAlignment('leading'),
          ]}
        >
          {data.headerText}
        </Text>
        <Spacer />
        <Link destination={data.shareUrl}>
          <HStack
            modifiers={[
              padding({ top: 4, bottom: 4, leading: 8, trailing: 8 }),
            ]}
          >
            <Image
              systemName="square.and.arrow.up"
              modifiers={[font({ size: 12 }), foregroundStyle('#D97706')]}
            />
            <Text
              modifiers={[
                font({ size: 12, weight: 'semibold' }),
                foregroundStyle('#D97706'),
              ]}
            >
              {' '}பகிர்
            </Text>
          </HStack>
        </Link>
      </HStack>

      <Spacer />

      {/* Thirukkural Couplet: 4+3 Rule, Left Aligned, Uniform Font Size, No Ellipsis */}
      <VStack modifiers={[frame({ alignment: 'leading' })]}>
        {/* Line 1: 4 words */}
        <Text
          modifiers={[
            font({ size: 15, weight: 'semibold' }),
            foregroundStyle('#1F2937'),
            multilineTextAlignment('leading'),
          ]}
        >
          {data.line1}
        </Text>

        {/* Line 2: 3 words (strictly uniform font size and weight) */}
        <Text
          modifiers={[
            font({ size: 15, weight: 'semibold' }),
            foregroundStyle('#1F2937'),
            multilineTextAlignment('leading'),
          ]}
        >
          {data.line2}
        </Text>
      </VStack>

      <Spacer />
    </VStack>
  );
};

export default createWidget<WidgetDailyKuralProps>(
  'DailyKuralWidget',
  DailyKuralWidget,
  fallbackProps
);
