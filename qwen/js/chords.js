/**
 * 和弦引擎 - 支援解析、移調、異名優化
 * 核心公式：新根音 = (原根音索引 + 半音差) % 12
 */
export const ChordEngine = (() => {
  // 音名 → 半音索引（支援異名）
  const SEMITONE_MAP = {
    'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4,
    'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8, 'Ab':8,
    'A':9, 'A#':10, 'Bb':10, 'B':11
  };
  
  // 標準音名（用於輸出，避免 Db/C# 混用）
  const SHARP_KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT_KEYS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  
  // 計算半音差
  const getInterval = (from, to) => {
    const fromIdx = SEMITONE_MAP[from] ?? null;
    const toIdx = SEMITONE_MAP[to] ?? null;
    if (fromIdx === null || toIdx === null) return 0;
    return (toIdx - fromIdx + 12) % 12;
  };
  
  // 解析和弦：返回 { root, quality }
  const parse = (chordStr) => {
    const match = chordStr.trim().match(/^([A-G]#?b?)(.*)$/);
    if (!match) return { root: chordStr, quality: '' };
    return { root: match[1], quality: match[2] };
  };
  
  // 移調單個和弦
  const transpose = (chordStr, semitones, preferFlats = false) => {
    const { root, quality } = parse(chordStr);
    const idx = SEMITONE_MAP[root];
    if (idx === undefined) return chordStr; // 無法識別，原樣返回
    
    const newIdx = (idx + semitones + 12) % 12;
    const newRoot = preferFlats ? FLAT_KEYS[newIdx] : SHARP_KEYS[newIdx];
    return newRoot + quality;
  };
  
  // 根據目標調性優化異名（例：F大調中用 Bb 而非 A#）
  const normalize = (chordStr, targetKey) => {
    const preferFlats = ['F','Bb','Eb','Ab','Db','Gb'].includes(targetKey);
    return transpose(chordStr, 0, preferFlats);
  };
  
  return { getInterval, parse, transpose, normalize };
})();
