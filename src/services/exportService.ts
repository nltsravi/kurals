import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, UnderlineType } from 'docx';
import { Kural } from '../types/kural';
import { sanitizeFilename } from '../utils/text';

/**
 * Generates an HTML document optimized for printing/PDF with only Tamil and English Kural text
 * Excludes header, date, collection name, translation, commentary, and metadata
 */
export function generatePdfHtml(title: string, kurals: Kural[]): string {
  const kuralCardsHtml = kurals
    .map(
      (k) => `
    <div class="kural-card">
      <div class="kural-badge">குறள் ${k.number} • Kural ${k.number}</div>

      <div class="tamil-text">
        <p class="tamil-line">${k.line1}</p>
        <p class="tamil-line">${k.line2}</p>
      </div>

      ${
        k.transliteration
          ? `
      <div class="english-text">
        <p class="english-line">${k.transliteration1 || ''}</p>
        <p class="english-line">${k.transliteration2 || ''}</p>
      </div>`
          : ''
      }
    </div>
  `
    )
    .join('\n');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Thirukkural</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @page {
          size: A4;
          margin: 20mm 18mm 20mm 18mm;
          @bottom-right {
            content: counter(page);
          }
        }

        body {
          font-family: 'Mukta Malar', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }

        .kural-card {
          padding: 14px 0 16px 0;
          border-bottom: 1px solid #E2E8F0;
          page-break-inside: avoid;
        }

        .kural-badge {
          font-size: 13px;
          font-weight: 700;
          color: #FF7C0A;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }

        .tamil-text {
          margin: 4px 0 6px 0;
        }

        .tamil-line {
          font-size: 18px;
          font-weight: 600;
          color: #0F172A;
          margin: 3px 0;
          line-height: 1.5;
        }

        .english-text {
          margin: 6px 0 0 0;
        }

        .english-line {
          font-size: 14.5px;
          font-style: italic;
          color: #475569;
          margin: 2px 0;
          line-height: 1.45;
        }
      </style>
    </head>
    <body>
      <div class="content">
        ${kuralCardsHtml}
      </div>
    </body>
  </html>
  `;
}

export const ExportService = {
  /**
   * Generates a PDF file for a single Kural or an entire Collection
   * Returns the file URI or 'web-print' on web.
   */
  async exportToPdf(title: string, kurals: Kural[]): Promise<string> {
    const html = generatePdfHtml(title, kurals);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 2000);
          }, 400);
        }
      }
      return 'web-print';
    }

    const result = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const uri = result?.uri;
    if (!uri) {
      throw new Error('PDF generation failed to produce a file');
    }

    const safeTitle = sanitizeFilename(title);
    const newPath = `${FileSystem.cacheDirectory}${safeTitle}.pdf`;

    try {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      return newPath;
    } catch {
      return uri;
    }
  },

  /**
   * Generates a DOCX document for a single Kural or an entire Collection
   * Returns the file URI.
   */
  async exportToDocx(title: string, kurals: Kural[]): Promise<string> {
    const docChildren: Paragraph[] = [];

    for (const kural of kurals) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `குறள் ${kural.number} (Kural ${kural.number})`,
              bold: true,
              size: 26,
              color: 'FF7C0A',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${kural.line1}\n${kural.line2}`, size: 24, bold: true }),
          ],
        })
      );

      if (kural.transliteration) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${kural.transliteration}`, size: 22, italics: true, color: '475569' }),
            ],
          })
        );
      }

      docChildren.push(
        new Paragraph({
          text: '______________________________________________________________________',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const safeTitle = sanitizeFilename(title);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeTitle}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      return 'web-download';
    }

    const base64Data = await Packer.toBase64String(doc);
    const filePath = `${FileSystem.cacheDirectory}${safeTitle}.docx`;

    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  },
};
