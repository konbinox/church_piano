/**
 * 伴奏模式引擎 - 三種核心模式 + 拍號適應
 * 輸出：節奏網格 (0=休止, 1=觸鍵) + 指法提示
 */
export const PatternEngine = (() => {
  
  // 生成節奏網格工具
  const _grid = (length, positions) => {
    return Array(length).fill(0).map((_, i) => positions.includes(i) ? 1 : 0);
  };
  
  // 🔲 柱式和弦：每小節第一拍彈
  const block = (timeSig) => {
    const beats = parseInt(timeSig.split('/')[0]);
    // 以八分音符為單位：4/4拍 = 8格，3/4拍 = 6格
    const units = beats * 2;
    return {
      grid: _grid(units, [0]), // 僅第1格觸鍵
      hint: `第1拍彈完整和弦，其餘拍休止或輕帶根音`,
      fingering: { left: '8va root', right: 'block chord' }
    };
  };
  
  // 🌊 分解和弦：1-5-3-5 流動型（八分音符）
  const broken = (timeSig) => {
    const beats = parseInt(timeSig.split('/')[0]);
    const units = beats * 2;
    // 3/4拍：[1,0,1,0,1,0] → 根-五-三-五-根-五
    const positions = Array.from({length: units}, (_, i) => i % 2 === 0 ? i : -1).filter(i => i >= 0);
    return {
      grid: _grid(units, positions),
      hint: `根→五→三→五 循環流動，左手單音根音，右手分解`,
      fingering: { left: 'single root', right: '1-5-3-5 arpeggio' }
    };
  };
  
  // 🥁 節奏和弦：切分 + 休止，模仿吉他掃弦
  const rhythmic = (timeSig) => {
    const beats = parseInt(timeSig.split('/')[0]);
    const units = beats * 2;
    // 4/4拍節奏型：↓ _ ↑ _ ↓ _ ↑ _ → [1,0,1,0,1,0,1,0]
    // 進階：加入切分 [1,0,0,1,0,1,0,0]
    const pattern = beats === 3 
      ? [1,0,0,1,0,1]  // 3/4 切分
      : [1,0,0,1,0,1,0,0]; // 4/4 切分
    return {
      grid: _grid(units, pattern.map((v,i)=>v?i:-1).filter(i=>i>=0)),
      hint: `↓(1) _ ↑(&) _ ↓(2) _ ：強調切分，右手可省略五音`,
      fingering: { left: 'root on beat 1', right: 'comping voicing' }
    };
  };
  
  // 主接口
  const generate = (type, timeSig = '4/4') => {
    const strategies = { block, broken, rhythmic };
    return strategies[type]?.(timeSig) || block(timeSig);
  };
  
  return { generate };
})();
