import { Share, Platform, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { SocialShareOptions, formatKuralForSocialShare } from '../utils/text';
import { Kural } from '../types/kural';

export type SocialPlatform =
  | 'whatsapp'
  | 'whatsapp_status'
  | 'twitter'
  | 'threads'
  | 'facebook'
  | 'instagram'
  | 'native';

export interface SocialShareResult {
  success: boolean;
  platform: SocialPlatform;
  message?: string;
  error?: string;
}

export const ShareService = {
  /**
   * Shares a local document file (PDF or DOCX) via the native share sheet
   * Supports iOS Files/iCloud and Android Google Drive/WhatsApp/Telegram etc.
   */
  async shareFile(fileUri: string, title?: string): Promise<boolean> {
    if (fileUri === 'web-print' || fileUri === 'web-download') {
      return true;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not supported on this platform');
    }

    const isPdf = fileUri.endsWith('.pdf');
    const mimeType = isPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const uti = isPdf
      ? 'com.adobe.pdf'
      : 'org.openxmlformats.wordprocessingml.document';

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: title || 'Share Thirukkural Document',
      UTI: uti,
    });
    return true;
  },

  /**
   * Shares a captured Kural image card via the native share sheet
   * Supports WhatsApp Status, Instagram Stories/Feed, Facebook, Twitter, Photos, etc.
   */
  async shareImage(imageUri: string, title = 'திருக்குறள் | Thirukkural'): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not supported on this platform');
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: title,
      UTI: 'public.png',
    });
    return true;
  },

  /**
   * Shares text content using the native OS share dialog
   */
  async shareText(message: string, title = 'திருக்குறள் | Thirukkural'): Promise<boolean> {
    try {
      const result = await Share.share(
        {
          message,
          title,
        },
        {
          dialogTitle: title,
        }
      );
      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing text:', error);
      return false;
    }
  },

  /**
   * Copies text to the device clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  },

  /**
   * Helper to open URLs with a fallback for native deep links
   */
  async openUrlWithFallback(primaryUrl: string, fallbackUrl?: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(fallbackUrl || primaryUrl, '_blank');
        return true;
      }

      const canOpen = await Linking.canOpenURL(primaryUrl).catch(() => false);
      if (canOpen) {
        await Linking.openURL(primaryUrl);
        return true;
      } else if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
        return true;
      } else {
        await Linking.openURL(primaryUrl);
        return true;
      }
    } catch (err) {
      if (fallbackUrl) {
        try {
          await Linking.openURL(fallbackUrl);
          return true;
        } catch {
          // Fall through
        }
      }
      return false;
    }
  },

  /**
   * Shares Kural with meaning to WhatsApp chat or contact
   */
  async shareToWhatsApp(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const encoded = encodeURIComponent(text);
      const nativeUrl = `whatsapp://send?text=${encoded}`;
      const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'whatsapp',
        message: 'Opening WhatsApp...',
      };
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      await this.shareText(text);
      return { success: false, platform: 'whatsapp', error: String(error) };
    }
  },

  /**
   * Shares Kural with meaning to WhatsApp Status
   * WhatsApp opens the chat/status picker with 'My Status' at the top.
   * Text is also copied to clipboard for direct pasting into Status text editor.
   */
  async shareToWhatsAppStatus(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const encoded = encodeURIComponent(text);
      const nativeUrl = `whatsapp://send?text=${encoded}`;
      const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'whatsapp_status',
        message: 'Opening WhatsApp! Select "My Status" at the top to set your status.',
      };
    } catch (error) {
      console.error('Error setting WhatsApp status:', error);
      await this.shareText(text);
      return { success: false, platform: 'whatsapp_status', error: String(error) };
    }
  },

  /**
   * Shares Kural with meaning to Twitter / X
   */
  async shareToTwitter(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const encoded = encodeURIComponent(text);
      const nativeUrl = `twitter://post?message=${encoded}`;
      const webUrl = `https://twitter.com/intent/tweet?text=${encoded}`;

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'twitter',
        message: 'Opening X (Twitter)...',
      };
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      await this.shareText(text);
      return { success: false, platform: 'twitter', error: String(error) };
    }
  },

  /**
   * Shares Kural with meaning to Threads
   */
  async shareToThreads(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const encoded = encodeURIComponent(text);
      const nativeUrl = `barcelona://create?text=${encoded}`;
      const webUrl = `https://threads.net/intent/post?text=${encoded}`;

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'threads',
        message: 'Opening Threads...',
      };
    } catch (error) {
      console.error('Error sharing to Threads:', error);
      await this.shareText(text);
      return { success: false, platform: 'threads', error: String(error) };
    }
  },

  /**
   * Shares Kural with meaning to Facebook
   * Copies formatted text to clipboard and opens Facebook sharer / feed.
   */
  async shareToFacebook(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const encoded = encodeURIComponent(text);
      const webUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encoded}&u=https://thirukkural.app`;
      const nativeUrl = 'fb://feed';

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'facebook',
        message: 'Copied to clipboard! Ready to paste into your Facebook post.',
      };
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      await this.shareText(text);
      return { success: false, platform: 'facebook', error: String(error) };
    }
  },

  /**
   * Shares Kural with meaning to Instagram
   * Since Instagram does not support text-intent URLs, copies formatted text
   * to clipboard and opens Instagram to paste into Story or Feed.
   */
  async shareToInstagram(text: string): Promise<SocialShareResult> {
    try {
      await this.copyToClipboard(text);
      const nativeUrl = 'instagram://app';
      const webUrl = 'https://www.instagram.com';

      const opened = await this.openUrlWithFallback(nativeUrl, webUrl);
      if (!opened) {
        await this.shareText(text);
      }
      return {
        success: true,
        platform: 'instagram',
        message: 'Copied to clipboard! Paste it into your Instagram Story or post.',
      };
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      await this.shareText(text);
      return { success: false, platform: 'instagram', error: String(error) };
    }
  },

  /**
   * Dispatches share action for a given platform
   */
  async shareToPlatform(
    platform: SocialPlatform,
    text: string,
    title = 'திருக்குறள் | Thirukkural'
  ): Promise<SocialShareResult> {
    switch (platform) {
      case 'whatsapp':
        return this.shareToWhatsApp(text);
      case 'whatsapp_status':
        return this.shareToWhatsAppStatus(text);
      case 'twitter':
        return this.shareToTwitter(text);
      case 'threads':
        return this.shareToThreads(text);
      case 'facebook':
        return this.shareToFacebook(text);
      case 'instagram':
        return this.shareToInstagram(text);
      case 'native':
      default: {
        const success = await this.shareText(text, title);
        return { success, platform: 'native', message: 'Share sheet opened' };
      }
    }
  },

  /**
   * High-level method: formats Kural and shares to specified social platform
   */
  async shareKuralToPlatform(
    platform: SocialPlatform,
    kural: Kural,
    options?: SocialShareOptions
  ): Promise<SocialShareResult> {
    const text = formatKuralForSocialShare(kural, options);
    return this.shareToPlatform(platform, text, `குறள் ${kural.number}`);
  },
};
