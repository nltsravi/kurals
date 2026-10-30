/**
 * Word-by-word comparison between the Thirukkural reference text and the
 * exact Tamil words recognised from the user's recitation.
 *
 * The aligner handles the common ways a speech recogniser deviates from the
 * written Kural:
 *  - a word is mispronounced (partial character match)  -> 'close' / 'wrong'
 *  - a word is skipped                                    -> 'missing'
 *  - an additional word is spoken                         -> 'extra'
 *  - a compound Kural word is split into two spoken words (e.g. "எழுத்தெல்லாம்"
 *    -> "எழுத்து எல்லாம்"), or two Kural words are run together.
 */

export type WordMatchStatus = 'correct' | 'close' | 'wrong' | 'missing';

export interface ReferenceWordComparison {
  /** Word exactly as written in the Kural */
  referenceWord: string;
  /** Word(s) the user actually said for this position ('' when missing) */
  spokenWord: string;
  status: WordMatchStatus;
  /** Character similarity 0..100 */
  similarity: number;
}

export interface KuralWordComparisonResult {
  /** Exact recognised transcript */
  spokenText: string;
  /** Spoken words after normalisation */
  spokenWords: string[];
  /** One entry per reference (Kural) word, in Kural order */
  words: ReferenceWordComparison[];
  /** Spoken words that do not belong to the Kural */
  extraWords: string[];
  correctCount: number;
  totalWords: number;
  /** Average similarity across all Kural words, 0..100 */
  accuracy: number;
}

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
// Keep Tamil block characters, Latin letters and digits; everything else becomes a separator
const NON_WORD = /[^\u0B80-\u0BFFa-zA-Z0-9]+/g;

export function normalizeTamilText(text: string): string {
  return (text || '')
    .normalize('NFC')
    .replace(ZERO_WIDTH, '')
    .replace(NON_WORD, ' ')
    .trim()
    .toLowerCase();
}

export function splitTamilWords(text: string): string[] {
  const norm = normalizeTamilText(text);
  return norm ? norm.split(/\s+/).filter(Boolean) : [];
}

function levenshtein(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Character-level similarity (0..1) of two Tamil words, computed on Unicode code points. */
export function tamilWordSimilarity(a: string, b: string): number {
  const ca = Array.from(normalizeTamilText(a).replace(/\s+/g, ''));
  const cb = Array.from(normalizeTamilText(b).replace(/\s+/g, ''));
  if (ca.length === 0 && cb.length === 0) return 1;
  if (ca.length === 0 || cb.length === 0) return 0;
  const dist = levenshtein(ca, cb);
  return Math.max(0, 1 - dist / Math.max(ca.length, cb.length));
}

const GAP_PENALTY = -0.3;
const pairScore = (sim: number) => sim * 2 - 0.6;

type Move = 'pair' | 'refSplit' | 'refMerge' | 'skipRef' | 'skipSpoken';

/**
 * Aligns the Kural reference words with the spoken words and classifies every Kural word.
 */
export function compareKuralWords(
  referenceText: string,
  spokenText: string
): KuralWordComparisonResult {
  const refDisplay = (referenceText || '')
    .normalize('NFC')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => normalizeTamilText(w).length > 0);
  const ref = refDisplay.map((w) => normalizeTamilText(w).replace(/\s+/g, ''));
  const spk = splitTamilWords(spokenText);

  const R = ref.length;
  const S = spk.length;
  const dp: number[][] = Array.from({ length: R + 1 }, () => new Array(S + 1).fill(-Infinity));
  const back: (Move | null)[][] = Array.from({ length: R + 1 }, () => new Array(S + 1).fill(null));
  dp[0][0] = 0;

  for (let i = 0; i <= R; i++) {
    for (let j = 0; j <= S; j++) {
      const cur = dp[i][j];
      if (cur === -Infinity) continue;
      const relax = (ni: number, nj: number, val: number, mv: Move) => {
        if (val > dp[ni][nj]) {
          dp[ni][nj] = val;
          back[ni][nj] = mv;
        }
      };
      if (i < R) relax(i + 1, j, cur + GAP_PENALTY, 'skipRef');
      if (j < S) relax(i, j + 1, cur + GAP_PENALTY, 'skipSpoken');
      if (i < R && j < S) relax(i + 1, j + 1, cur + pairScore(tamilWordSimilarity(ref[i], spk[j])), 'pair');
      // One Kural word spoken as two recognised words
      if (i < R && j + 1 < S) {
        const sim = tamilWordSimilarity(ref[i], spk[j] + spk[j + 1]);
        relax(i + 1, j + 2, cur + pairScore(sim) + 0.05, 'refSplit');
      }
      // Two Kural words recognised as a single word
      if (i + 1 < R && j < S) {
        const sim = tamilWordSimilarity(ref[i] + ref[i + 1], spk[j]);
        relax(i + 2, j + 1, cur + pairScore(sim) * 2 + 0.05, 'refMerge');
      }
    }
  }

  const words: ReferenceWordComparison[] = new Array(R);
  const extraWords: string[] = [];
  const classify = (sim: number): WordMatchStatus =>
    sim >= 0.999 ? 'correct' : sim >= 0.7 ? 'close' : 'wrong';

  let i = R;
  let j = S;
  while (i > 0 || j > 0) {
    const mv = back[i][j];
    if (mv === 'pair') {
      const sim = tamilWordSimilarity(ref[i - 1], spk[j - 1]);
      words[i - 1] = {
        referenceWord: refDisplay[i - 1],
        spokenWord: spk[j - 1],
        status: classify(sim),
        similarity: Math.round(sim * 100),
      };
      i--;
      j--;
    } else if (mv === 'refSplit') {
      const spoken = `${spk[j - 2]} ${spk[j - 1]}`;
      const sim = tamilWordSimilarity(ref[i - 1], spk[j - 2] + spk[j - 1]);
      words[i - 1] = {
        referenceWord: refDisplay[i - 1],
        spokenWord: spoken,
        status: classify(sim),
        similarity: Math.round(sim * 100),
      };
      i--;
      j -= 2;
    } else if (mv === 'refMerge') {
      const sim = tamilWordSimilarity(ref[i - 2] + ref[i - 1], spk[j - 1]);
      const status = classify(sim);
      for (const k of [i - 2, i - 1]) {
        words[k] = {
          referenceWord: refDisplay[k],
          spokenWord: spk[j - 1],
          status,
          similarity: Math.round(sim * 100),
        };
      }
      i -= 2;
      j--;
    } else if (mv === 'skipRef') {
      words[i - 1] = {
        referenceWord: refDisplay[i - 1],
        spokenWord: '',
        status: 'missing',
        similarity: 0,
      };
      i--;
    } else {
      // 'skipSpoken' (or start)
      extraWords.unshift(spk[j - 1]);
      j--;
    }
  }

  const correctCount = words.filter((w) => w.status === 'correct').length;
  const accuracy =
    R > 0 ? Math.round(words.reduce((acc, w) => acc + w.similarity, 0) / R) : 0;

  return {
    spokenText: (spokenText || '').trim(),
    spokenWords: spk,
    words,
    extraWords,
    correctCount,
    totalWords: R,
    accuracy,
  };
}

