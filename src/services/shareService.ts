import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export const ShareService = {
  /**
   * Shares a local document file (PDF or DOCX) via the native share sheet
   * Supports iOS Files/iCloud and Android Google Drive/WhatsApp/Telegram etc.
   */
  async shareFile(fileUri: string, title?: string): Promise<boolean> {
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
};
