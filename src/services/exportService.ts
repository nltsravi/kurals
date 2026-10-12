import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  PageNumber,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx';
import { Kural } from '../types/kural';
import { sanitizeFilename } from '../utils/text';
import { APP_ICON_BASE64, THIRUVALLUVAR_OUTLINE_BASE64 } from '../constants/exportAssets';

/**
 * Generates an HTML document optimized for printing/PDF
 * Includes header with app icon, Tamil title, and collection name;
 * footer with copyright and page numbering;
 * standing Thiruvalluvar outline watermark in each page;
 * and structured Tamil/English Kurals.
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
      <title>Thirukkuralkal</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @page {
          size: A4;
          margin: 16mm 16mm 18mm 16mm;
          @bottom-left {
            content: "© Neolumina Technology Solutions";
            font-family: 'Mukta Malar', 'Noto Sans Tamil', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10px;
            font-weight: 500;
            color: #64748B;
            vertical-align: top;
            padding-top: 8px;
            border-top: 1px solid #E2E8F0;
          }
          @bottom-center {
            content: "";
            vertical-align: top;
            border-top: 1px solid #E2E8F0;
          }
          @bottom-right {
            content: "Page " counter(page);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10px;
            font-weight: 500;
            color: #64748B;
            vertical-align: top;
            padding-top: 8px;
            border-top: 1px solid #E2E8F0;
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

        /* Standing Thiruvalluvar outline watermark in each page without disturbing foreground text */
        .watermark-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 52%;
          max-width: 320px;
          opacity: 0.06;
          z-index: -1;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .watermark-image {
          width: 100%;
          height: auto;
          display: block;
        }

        table.doc-layout {
          width: 100%;
          border-collapse: collapse;
        }

        thead.doc-header {
          display: table-header-group;
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1.5px solid #E2E8F0;
          margin-bottom: 4px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .app-icon {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          object-fit: cover;
          vertical-align: middle;
        }

        .app-title {
          font-size: 15px;
          font-weight: 700;
          color: #1E293B;
          letter-spacing: 0.2px;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .collection-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #D97706;
          letter-spacing: 0.2px;
        }

        .kural-card {
          padding: 13px 0 15px 0;
          border-bottom: 1px solid #E2E8F0;
          page-break-inside: avoid;
        }

        .kural-badge {
          font-size: 12.5px;
          font-weight: 700;
          color: #FF7C0A;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
        }

        .tamil-text {
          margin: 4px 0 5px 0;
        }

        .tamil-line {
          font-size: 17.5px;
          font-weight: 600;
          color: #0F172A;
          margin: 3px 0;
          line-height: 1.5;
        }

        .english-text {
          margin: 5px 0 0 0;
        }

        .english-line {
          font-size: 14px;
          font-style: italic;
          color: #475569;
          margin: 2px 0;
          line-height: 1.45;
        }
      </style>
    </head>
    <body>
      <div class="watermark-container">
        <img class="watermark-image" src="data:image/png;base64,${THIRUVALLUVAR_OUTLINE_BASE64}" alt="" />
      </div>

      <table class="doc-layout">
        <thead class="doc-header">
          <tr>
            <td>
              <div class="header-inner">
                <div class="header-left">
                  <img class="app-icon" src="data:image/png;base64,${APP_ICON_BASE64}" alt="App Icon" />
                  <span class="app-title">திருக்குறள்கள்</span>
                </div>
                ${title ? `<div class="header-right"><span class="collection-name">${title}</span></div>` : ''}
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="content">
                ${kuralCardsHtml}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
      base64: true,
    });

    const safeTitle = sanitizeFilename(title);
    const targetPath = `${FileSystem.cacheDirectory}${safeTitle}.pdf`;

    if (result?.base64) {
      await FileSystem.writeAsStringAsync(targetPath, result.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return targetPath;
    }

    const uri = result?.uri;
    if (!uri) {
      throw new Error('PDF generation failed to produce a file');
    }

    try {
      await FileSystem.copyAsync({
        from: uri,
        to: targetPath,
      });
      return targetPath;
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
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                  children: [
                    new TextRun({
                      text: 'திருக்குறள்கள்',
                      bold: true,
                      size: 22,
                      color: '1E293B',
                    }),
                    new TextRun({
                      text: title ? `\t${title}` : '',
                      bold: true,
                      size: 20,
                      color: 'D97706',
                    }),
                  ],
                  border: {
                    bottom: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: 'E2E8F0',
                    },
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                  children: [
                    new TextRun({
                      text: '© Neolumina Technology Solutions',
                      size: 18,
                      color: '64748B',
                    }),
                    new TextRun({
                      children: ['\tPage ', PageNumber.CURRENT],
                      size: 18,
                      color: '64748B',
                    }),
                  ],
                  border: {
                    top: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: 'E2E8F0',
                    },
                  },
                }),
              ],
            }),
          },
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

