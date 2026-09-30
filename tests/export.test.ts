import { generatePdfHtml } from '../src/services/exportService';
import { KuralService } from '../src/services/kuralService';
import { sanitizeFilename, formatKuralText } from '../src/utils/text';
import { Document, Paragraph, TextRun, Packer } from 'docx';

describe('Document Export & Formatting', () => {
  test('sanitizes filename safely', () => {
    expect(sanitizeFilename('My Favorite Kurals')).toBe('My-Favorite-Kurals');
    expect(sanitizeFilename('அறத்துப்பால் - தொகுதி 1')).toBe('அறத்துப்பால்-தொகுதி-1');
    expect(sanitizeFilename('***///test:::')).toBe('test');
  });

  test('formats Kural text for sharing and copying', () => {
    const kural1 = KuralService.getKuralByNumber(1)!;

    const tamilOnly = formatKuralText(kural1, 'tamil');
    expect(tamilOnly).toContain('குறள் 1');
    expect(tamilOnly).toContain(kural1.line1);
    expect(tamilOnly).not.toContain('Akara Mudhala');

    const translitOnly = formatKuralText(kural1, 'transliteration');
    expect(translitOnly).toContain('Kural 1');
    expect(translitOnly).toContain(kural1.transliteration);

    const both = formatKuralText(kural1, 'both');
    expect(both).toContain(kural1.line1);
    expect(both).toContain(kural1.transliteration);

    const full = formatKuralText(kural1, 'full');
    expect(full).toContain('திருக்குறள் | Thirukkural');
    expect(full).toContain(kural1.translation);
  });

  test('generates valid HTML for PDF export with only Tamil and English Kurals', () => {
    const kural1 = KuralService.getKuralByNumber(1)!;
    const kural2 = KuralService.getKuralByNumber(2)!;

    const html = generatePdfHtml('My Test Collection', [kural1, kural2]);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('size: A4;');
    expect(html).toContain('குறள் 1');
    expect(html).toContain(kural1.line1);
    expect(html).toContain(kural1.line2);
    expect(html).toContain(kural1.transliteration1);
    expect(html).toContain('குறள் 2');
    expect(html).toContain(kural2.line1);
    expect(html).toContain('Mukta Malar');

    // Verify all excluded items
    expect(html).not.toContain('My Test Collection');
    expect(html).not.toContain('Generated on');
    expect(html).not.toContain(kural1.translation);
    expect(html).not.toContain(kural1.commentaryMV);
    expect(html).not.toContain('அறத்துப்பால்');
    expect(html).not.toContain('கடவுள் வாழ்த்து');
  });

  test('generates DOCX binary document without errors', async () => {
    const kural1 = KuralService.getKuralByNumber(1)!;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'THIRUKKURAL', bold: true }),
                new TextRun({ text: `\nகுறள் ${kural1.number}\n` }),
                new TextRun({ text: `${kural1.line1}\n${kural1.line2}\n` }),
                new TextRun({ text: `${kural1.transliteration}\n` }),
              ],
            }),
          ],
        },
      ],
    });

    const base64 = await Packer.toBase64String(doc);
    expect(base64).toBeDefined();
    expect(base64.length).toBeGreaterThan(1000);
  });
});
