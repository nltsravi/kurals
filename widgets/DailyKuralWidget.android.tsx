import React from 'react';
import {
  Column,
  Row,
  Text,
  Spacer,
  Button,
} from '@expo/ui/jetpack-compose';
import {
  padding,
  fillMaxSize,
  fillMaxWidth,
  background,
} from '@expo/ui/jetpack-compose/modifiers';
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
 * Daily Thirukkural Android Home Screen Widget (Jetpack Compose / Glance).
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
    <Column
      modifiers={[
        fillMaxSize(),
        background('#FFF9F2'),
        padding(14, 12, 14, 12),
      ]}
    >
      {/* Header Row: Kural number & Chapter name (left), Share button (right) */}
      <Row
        modifiers={[fillMaxWidth()]}
        verticalAlignment="center"
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'start',
          }}
          color="#D97706"
        >
          {data.headerText}
        </Text>

        <Spacer />

        <Button
          modifiers={[padding(6, 2, 6, 2)]}
          colors={{
            containerColor: '#FEF3C7',
            contentColor: '#D97706',
          }}
          onClick={() => {
            // Handled via user interaction listener / deep link
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
            }}
            color="#D97706"
          >
            பகிர்
          </Text>
        </Button>
      </Row>

      <Spacer />

      {/* Thirukkural Couplet: 4+3 Rule, Left Aligned, Uniform Font Size, No Ellipsis */}
      <Column modifiers={[fillMaxWidth()]}>
        {/* Line 1: exactly 4 words */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'start',
            lineHeight: 22,
          }}
          color="#1F2937"
          softWrap={true}
        >
          {data.line1}
        </Text>

        {/* Line 2: exactly 3 words (uniform font size & weight) */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'start',
            lineHeight: 22,
          }}
          color="#1F2937"
          softWrap={true}
        >
          {data.line2}
        </Text>
      </Column>

      <Spacer />
    </Column>
  );
};

export default createWidget<WidgetDailyKuralProps>(
  'DailyKuralWidget',
  DailyKuralWidget,
  fallbackProps
);
