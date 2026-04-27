export const PatternEngine = (() => {
  const _grid = (len, hits) => Array(len).fill(0).map((_, i) => hits.includes(i) ? 1 : 0);

  const block = (beats) => _grid(beats * 2, [0]);
  const broken = (beats) => _grid(beats * 2, Array.from({length: beats*2}, (_,i)=>i).filter(i=>i%2===0));
  const rhythmic = (beats) => {
    const p = beats === 3 ? [0,3,5] : [0,3,5]; // 切分節奏索引
    return _grid(beats * 2, p);
  };

  const generate = (type, beats = 4) => {
    const map = { block, broken, rhythmic };
    const grid = (map[type] || block)(beats);
    const hints = {
      block: '第1拍彈完整和弦，其餘拍休止或輕帶根音',
      broken: '根→五→三→五 均勻流動，左手單音根音',
      rhythmic: '↓(1) _ ↑(&) _ ↓(2) _ 切分律動，右手可省略五音'
    };
    return { grid, hint: hints[type] || hints.block };
  };

  return { generate };
})();
