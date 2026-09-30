import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, UnderlineType } from 'docx';
import { Kural } from '../types/kural';
import { sanitizeFilename } from '../utils/text';

/**
 * Generates an HTML document optimized for printing/PDF with full Tamil Unicode support
 */
export function generatePdfHtml(title: string, kurals: Kural[], subtitle = 'திருக்குறள் | Thirukkural'): string {
  const kuralCardsHtml = kurals
    .map(
      (k) => `
    <div class="kural-card">
      <div class="kural-header">
        <span class="kural-badge">குறள் ${k.number}</span>
        <span class="chapter-badge">${k.chapterNameTamil} (${k.chapterNumber})</span>
      </div>

      <div class="tamil-text">
        <p class="tamil-line">${k.line1}</p>
        <p class="tamil-line">${k.line2}</p>
      </div>

      ${
        k.transliteration
          ? `
      <div class="transliteration">
        <div class="section-label">Transliteration</div>
        <p class="trans-line">${k.transliteration.replace(/\n/g, '<br/>')}</p>
      </div>`
          : ''
      }

      ${
        k.translation
          ? `
      <div class="translation">
        <div class="section-label">English Translation</div>
        <p class="trans-text">${k.translation}</p>
      </div>`
          : ''
      }

      ${
        k.commentaryMV
          ? `
      <div class="commentary">
        <div class="section-label">மு. வரதராசனார் உரை</div>
        <p class="comm-text">${k.commentaryMV}</p>
      </div>`
          : ''
      }

      <div class="metadata-footer">
        <span><strong>பால்:</strong> ${k.categoryTamil} (${k.categoryEnglish})</span>
        <span><strong>இயல்:</strong> ${k.chapterGroupTamil}</span>
        <span><strong>அதிகாரம்:</strong> ${k.chapterNameTamil} (${k.chapterNameEnglish})</span>
      </div>
    </div>
  `
    )
    .join('\n');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @page {
          size: A4;
          margin: 18mm 16mm 18mm 16mm;
          @bottom-right {
            content: counter(page);
          }
        }

        body {
          font-family: 'Mukta Malar', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1E293B;
          background: #FFFFFF;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }

        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px double #0284C7;
          margin-bottom: 24px;
        }

        .main-title {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 6px 0;
        }

        .collection-title {
          font-size: 20px;
          color: #0369A1;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .doc-meta {
          font-size: 13px;
          color: #64748B;
        }

        .kural-card {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 22px;
          background: #F8FAFC;
          page-break-inside: avoid;
        }

        .kural-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E2E8F0;
        }

        .kural-badge {
          background: #0284C7;
          color: #FFFFFF;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 14px;
        }

        .chapter-badge {
          font-size: 13px;
          color: #475569;
          font-weight: 600;
        }

        .tamil-text {
          margin: 12px 0;
        }

        .tamil-line {
          font-size: 18px;
          font-weight: 600;
          color: #0F172A;
          margin: 4px 0;
          line-height: 1.5;
        }

        .section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748B;
          font-weight: 700;
          margin-top: 10px;
          margin-bottom: 2px;
        }

        .transliteration {
          font-style: italic;
          color: #334155;
          font-size: 14px;
        }

        .translation {
          color: #1E293B;
          font-size: 14px;
        }

        .commentary {
          color: #334155;
          font-size: 13.5px;
          background: #FFFFFF;
          padding: 8px 12px;
          border-left: 3px solid #0284C7;
          border-radius: 4px;
          margin-top: 8px;
        }

        .metadata-footer {
          margin-top: 14px;
          padding-top: 8px;
          border-top: 1px dashed #CBD5E1;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 12px;
          color: #64748B;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="main-title">${subtitle}</h1>
        <h2 class="collection-title">${title}</h2>
        <div class="doc-meta">Total Kurals: ${kurals.length} • Generated on ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="content">
        ${kuralCardsHtml}
      </div>

      <div class="footer">
        Thirukkural Mobile Application — Preserving Ancient Tamil Wisdom
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
    const docChildren: Paragraph[] = [
      new Paragraph({
        text: 'THIRUKKURAL (திருக்குறள்)',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Total Kurals: ${kurals.length} | Generated: ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }), // spacer
    ];

    for (const kural of kurals) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `குறள் ${kural.number} (Kural ${kural.number})`,
              bold: true,
              size: 28,
              color: '0369A1',
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Tamil:\n', bold: true }),
            new TextRun({ text: `${kural.line1}\n${kural.line2}\n`, size: 24 }),
          ],
        })
      );

      if (kural.transliteration) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Transliteration:\n', bold: true }),
              new TextRun({ text: `${kural.transliteration}\n`, italics: true }),
            ],
          })
        );
      }

      if (kural.translation) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'English Translation:\n', bold: true }),
              new TextRun({ text: `${kural.translation}\n` }),
            ],
          })
        );
      }

      if (kural.commentaryMV) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'மு. வரதராசனார் உரை:\n', bold: true }),
              new TextRun({ text: `${kural.commentaryMV}\n` }),
            ],
          })
        );
      }

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `பால் (Category): `, bold: true }),
            new TextRun({ text: `${kural.categoryTamil} (${kural.categoryEnglish})\n` }),
            new TextRun({ text: `இயல் (Group): `, bold: true }),
            new TextRun({ text: `${kural.chapterGroupTamil}\n` }),
            new TextRun({ text: `அதிகாரம் (Chapter): `, bold: true }),
            new TextRun({ text: `${kural.chapterNameTamil} (${kural.chapterNameEnglish})\n` }),
            new TextRun({ text: `Chapter Number: `, bold: true }),
            new TextRun({ text: `${kural.chapterNumber}\n` }),
            new TextRun({ text: `Kural Number: `, bold: true }),
            new TextRun({ text: `${kural.number}\n` }),
          ],
        }),
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
