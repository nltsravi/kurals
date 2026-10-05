import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { formatKuralCouplet } from '../utils/text';

export interface KuralCoupletTextProps {
  /** First line of Kural (4 words) */
  line1?: string;
  /** Second line of Kural (3 words) */
  line2?: string;
  /** Full Tamil couplet fallback */
  tamil?: string;
  /** Text color */
  color?: string;
  /** Desired base font size (default: 16.5) */
  baseFontSize?: number;
  /** Alignment of text: 'left' | 'center' | 'right' */
  align?: 'left' | 'center' | 'right';
  /** Font weight */
  fontWeight?: TextStyle['fontWeight'];
  /** Optional container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional style override for line 1 */
  line1Style?: StyleProp<TextStyle>;
  /** Optional style override for line 2 */
  line2Style?: StyleProp<TextStyle>;
  /** Optional letter spacing */
  letterSpacing?: number;
  /** Optional container width override */
  containerWidth?: number;
}

/**
 * Calculates the typographic visual width of a Tamil string taking into account
 * base consonants, independent vowels, kombu vowel signs, kāl, virama, and punctuation.
 */
export function getTamilTypographicWidth(text: string): number {
  if (!text) return 0;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Tamil virama (dot on top) - zero extra horizontal width
    if (code === 0x0bcd) {
      width += 0;
    } else if (code === 0x0bbf || code === 0x0bc0) {
      // ி and ீ sit on top of consonant
      width += 0;
    } else if (code === 0x0bc1 || code === 0x0bc2) {
      // ு and ூ attach to bottom/right
      width += 0.2;
    } else if (code === 0x0bca || code === 0x0bcb || code === 0x0bcc) {
      // ொ, ோ, ௌ: left kombu + consonant + right kāl
      width += 1.7;
    } else if (code === 0x0bc6 || code === 0x0bc7 || code === 0x0bc8) {
      // ெ, ே, ை: full-width sign before consonant
      width += 0.9;
    } else if (code === 0x0bbe || code === 0x0bd7) {
      // ா, ௗ: full-width sign after consonant
      width += 0.85;
    } else if (code === 0x0020) {
      // word space
      width += 0.35;
    } else if (code === 0x002e || code === 0x002c || code === 0x003a || code === 0x003b) {
      // punctuation (. , : ;)
      width += 0.3;
    } else {
      // Base Tamil consonant, vowel, or other character
      width += 1.0;
    }
  }
  return width;
}

/**
 * Counts the visual glyph clusters in a Tamil string.
 * Maintained for backward compatibility.
 */
export function getTamilVisualLength(str: string): number {
  return Math.round(getTamilTypographicWidth(str));
}

/**
 * Calculates a single uniform, optimal font size for the entire Thirukkural (both Line 1 and Line 2).
 * Adjusts the font size across all words so that:
 * - Line 1 (all 4 words) fits cleanly on line 1
 * - Line 2 (all 3 words) fits cleanly on line 2
 * - Both lines share the exact same font size
 * - No words are truncated or given an ellipsis suffix
 */
export function calculateCoupletFontSize(
  line1: string,
  line2: string,
  baseSize: number = 16.5,
  containerWidth?: number
): number {
  const w1 = getTamilTypographicWidth(line1);
  const w2 = getTamilTypographicWidth(line2);
  const maxW = Math.max(w1, w2);

  // If containerWidth is available, calculate the exact proportional font size
  // 0.85 factor accounts for Tamil font glyph aspect ratio in system fonts
  if (containerWidth && containerWidth > 0) {
    const maxFitSize = containerWidth / (maxW * 0.85);
    const finalSize = Math.min(baseSize, Math.max(11, maxFitSize));
    return Math.round(finalSize * 10) / 10;
  }

  // Fallback heuristic based on typographic width when containerWidth is not known
  if (maxW > 31) return Math.round(baseSize * 0.72 * 10) / 10;
  if (maxW > 28) return Math.round(baseSize * 0.78 * 10) / 10;
  if (maxW > 25) return Math.round(baseSize * 0.84 * 10) / 10;
  if (maxW > 22) return Math.round(baseSize * 0.90 * 10) / 10;
  if (maxW > 19) return Math.round(baseSize * 0.95 * 10) / 10;
  return baseSize;
}

/**
 * Calculates optimal font sizes for Line 1 and Line 2.
 * Both lines receive the exact same font size for 100% typographic uniformity across all words.
 */
export function calculateCoupletFontSizes(
  line1: string,
  line2: string,
  baseSize: number = 16.5,
  containerWidth?: number
): { line1Size: number; line2Size: number; fontSize: number } {
  const fontSize = calculateCoupletFontSize(line1, line2, baseSize, containerWidth);
  return { line1Size: fontSize, line2Size: fontSize, fontSize };
}

/**
 * Renders a Thirukkural couplet strictly as:
 * - Line 1: exactly 4 words
 * - Line 2: exactly 3 words
 * All words in the Thirukkural share the EXACT SAME font size for consistent, authentic presentation.
 * Dynamically scales the uniform font size so all words fit without clipping or overflow.
 * Never adds an ellipsis suffix (...) to the Thirukkural.
 */
export const KuralCoupletText: React.FC<KuralCoupletTextProps> = ({
  line1: rawLine1,
  line2: rawLine2,
  tamil: rawTamil,
  color = '#1E140C',
  baseFontSize = 16.5,
  align = 'left',
  fontWeight = '600',
  containerStyle,
  line1Style,
  line2Style,
  letterSpacing = 0.2,
  containerWidth: explicitContainerWidth,
}) => {
  const { line1, line2 } = formatKuralCouplet(rawLine1, rawLine2, rawTamil);
  const screenWidth = Dimensions.get('window').width;
  const [layoutWidth, setLayoutWidth] = useState<number>(explicitContainerWidth || 0);

  const effectiveWidth =
    explicitContainerWidth ||
    (layoutWidth > 0 ? layoutWidth : Math.max(260, screenWidth - 70));
  const uniformFontSize = calculateCoupletFontSize(line1, line2, baseFontSize, effectiveWidth);
  const lineHeight = Math.round(uniformFontSize * 1.5);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && Math.abs(w - layoutWidth) > 6) {
      setLayoutWidth(w);
    }
  };

  return (
    <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
      <Text
        style={[
          styles.line,
          {
            color,
            fontSize: uniformFontSize,
            lineHeight,
            textAlign: align,
            fontWeight,
            letterSpacing,
          },
          line1Style,
          { fontSize: uniformFontSize },
        ]}
        maxFontSizeMultiplier={1.2}
      >
        {line1}
      </Text>
      <Text
        style={[
          styles.line,
          {
            color,
            fontSize: uniformFontSize,
            lineHeight,
            textAlign: align,
            fontWeight,
            letterSpacing,
            marginTop: 4,
          },
          line2Style,
          { fontSize: uniformFontSize },
        ]}
        maxFontSizeMultiplier={1.2}
      >
        {line2}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  line: {
    width: '100%',
  },
});
