/**
 * Typo-tolerant and fuzzy search utility for Bike Workshop App.
 * Helps mechanics find parts even with misspellings, phonetic typing, or partial part numbers.
 * Works seamlessly across English and Malayalam text.
 */

/**
 * Computes standard Levenshtein distance between two strings.
 */
export function levenshteinDistance(a = '', b = '') {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();
  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  if (s1 === s2) return 0;

  // Optimize row vector space: O(min(len1, len2))
  let prevRow = Array.from({ length: len2 + 1 }, (_, i) => i);
  let currRow = new Array(len2 + 1);

  for (let i = 1; i <= len1; i++) {
    currRow[0] = i;
    const char1 = s1.charCodeAt(i - 1);

    for (let j = 1; j <= len2; j++) {
      const cost = char1 === s2.charCodeAt(j - 1) ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,      // insertion
        prevRow[j] + 1,          // deletion
        prevRow[j - 1] + cost    // substitution
      );
    }

    // Swap row references
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[len2];
}

/**
 * Normalizes text for search comparison:
 * - Lowercases
 * - Replaces hyphens, slashes, underscores with spaces
 * - Strips extra whitespace
 */
export function normalizeSearchText(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[-_\\/.,+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determines whether a search token matches a target word or phrase,
 * allowing for typos / edit distances based on token length.
 */
export function isTokenMatch(searchToken, targetWord) {
  const sTok = searchToken.toLowerCase().trim();
  const tWord = targetWord.toLowerCase().trim();

  if (!sTok || !tWord) return false;

  // 1. Exact match or target contains search token
  if (tWord.includes(sTok)) return true;

  // 2. Search token without punctuation matches target without punctuation
  const cleanSTok = sTok.replace(/[^a-z0-9]/g, '');
  const cleanTWord = tWord.replace(/[^a-z0-9]/g, '');
  if (cleanSTok.length >= 3 && cleanTWord.includes(cleanSTok)) return true;

  // 3. Typo tolerance using Levenshtein distance
  const maxDistance = sTok.length <= 3 ? 1 : sTok.length <= 6 ? 2 : 3;
  const dist = levenshteinDistance(sTok, tWord);
  if (dist <= maxDistance) return true;

  // 4. Prefix match with distance (e.g. "casto" matching "castrol")
  if (tWord.length > sTok.length) {
    const prefix = tWord.substring(0, sTok.length);
    if (levenshteinDistance(sTok, prefix) <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a single item matches the search query across specified fields.
 * Returns a score:
 * - score > 0 means a match (higher is better relevance)
 * - score === 0 means no match
 */
export function scoreFuzzyMatch(item, rawQuery, fields = ['name', 'part_number', 'note']) {
  const query = (rawQuery || '').trim().toLowerCase();
  if (!query) return 100; // empty query matches all

  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return 100;

  // Build searchable text blobs
  const partNumber = String(item.part_number || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  const note = String(item.note || '').toLowerCase();

  // Part Number direct alphanumeric match (e.g. "24101" or "ktc")
  const cleanQueryAlpha = query.replace(/[^a-z0-9]/g, '');
  const cleanPartNumAlpha = partNumber.replace(/[^a-z0-9]/g, '');
  if (cleanQueryAlpha.length >= 3 && cleanPartNumAlpha.includes(cleanQueryAlpha)) {
    return 150; // Super high priority for part number match!
  }

  // Combine full text
  const fullText = `${name} ${partNumber} ${note}`.trim();
  const normalizedFull = normalizeSearchText(fullText);
  const targetWords = normalizedFull.split(/\s+/).filter(Boolean);

  let totalScore = 0;
  let allTokensMatched = true;

  for (const qTok of queryTokens) {
    let bestTokenScore = 0;

    // Check against every word in candidate
    for (const word of targetWords) {
      if (word === qTok) {
        bestTokenScore = Math.max(bestTokenScore, 100);
      } else if (word.startsWith(qTok)) {
        bestTokenScore = Math.max(bestTokenScore, 80);
      } else if (word.includes(qTok)) {
        bestTokenScore = Math.max(bestTokenScore, 60);
      } else {
        // Levenshtein fuzzy match
        const dist = levenshteinDistance(qTok, word);
        const maxAllowed = qTok.length <= 3 ? 1 : 2;
        if (dist <= maxAllowed) {
          bestTokenScore = Math.max(bestTokenScore, 50 - dist * 10);
        } else if (word.length >= qTok.length) {
          const prefixDist = levenshteinDistance(qTok, word.substring(0, qTok.length));
          if (prefixDist <= 1) {
            bestTokenScore = Math.max(bestTokenScore, 40);
          }
        }
      }
    }

    if (bestTokenScore === 0) {
      allTokensMatched = false;
      break;
    }

    totalScore += bestTokenScore;
  }

  return allTokensMatched ? totalScore : 0;
}

/**
 * Filter and sort items by fuzzy relevance.
 */
export function fuzzyFilter(items = [], rawQuery = '', fields = ['name', 'part_number', 'note']) {
  if (!Array.isArray(items)) return [];
  const query = (rawQuery || '').trim();
  if (!query) return items;

  const scored = [];
  for (const item of items) {
    const score = scoreFuzzyMatch(item, query, fields);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort descending by score (most relevant first)
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}
