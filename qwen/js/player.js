/**
 * 練習驅動 - 循環/慢速/單小節/反饋記錄
 * 核心：guidance > playback
 */
export class PracticePlayer {
  constructor(songData, options = {}) {
    this.song = songData;
    this.key = options.key || songData.originalKey;
    this.pattern = options.pattern || 'block';
    this.bpm = options.bpm || songData.tempo || 72;
    this.currentSection = 0;
    this.currentMeasure = 0;
    this.loopMode = false;
    this.slowMode = false;
    this.feedback = []; // 記錄 { measure, chord, reactionTime, accuracy }
  }
  
  // 獲取當前小節的練習指引
  getGuidance() {
    const section = this.song.sections[this.currentSection];
    const measure = section.measures[this.currentMeasure];
    const transposed = ChordEngine.transpose(measure.chord, 
      ChordEngine.getInterval(this.song.originalKey, this.key));
    const pattern = PatternEngine.generate(this.pattern, this.song.timeSignature);
    
    return {
      chord: transposed,
      lyrics: measure.lyrics,
      beats: measure.beats,
      patternGrid: pattern.grid,
      hint: pattern.hint,
      fingering: pattern.fingering,
      next: () => this._nextMeasure(),
      prev: () => this._prevMeasure(),
      loop: (start, end) => this._setLoop(start, end)
    };
  }
  
  // 慢速模式：返回調整後的 BPM
  getEffectiveBPM() {
    return this.slowMode ? Math.round(this.bpm * 0.75) : this.bpm;
  }
  
  // 記錄練習反饋（未來可接 AI 分析）
  recordFeedback({ accuracy, reactionTime }) {
    this.feedback.push({
      timestamp: Date.now(),
      measure: this.currentMeasure,
      chord: this.getGuidance().chord,
      accuracy,
      reactionTime
    });
  }
  
  // 內部導航
  _nextMeasure() {
    const section = this.song.sections[this.currentSection];
    if (this.currentMeasure < section.measures.length - 1) {
      this.currentMeasure++;
    } else if (this.loopMode) {
      this.currentMeasure = this.loopStart;
    }
    return this.getGuidance();
  }
  
  _prevMeasure() {
    if (this.currentMeasure > 0) this.currentMeasure--;
    return this.getGuidance();
  }
  
  _setLoop(start, end) {
    this.loopMode = true;
    this.loopStart = start;
    this.loopEnd = end;
    this.currentMeasure = start;
  }
  
  // 重置
  reset() {
    this.currentMeasure = 0;
    this.loopMode = false;
  }
}
