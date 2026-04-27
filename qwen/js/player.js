export class PracticePlayer {
  constructor(songData) {
    this.song = songData;
    this.key = songData.originalKey;
    this.pattern = 'block';
    this.bpm = songData.tempo || 72;
    this.sectionIdx = 0;
    this.measureIdx = 0;
    this.loopActive = false;
    this.loopRange = null;
    this.slowMode = false;
    this.lastRenderTime = 0;
    this.feedback = [];
  }

  setKey(k) { this.key = k; return this; }
  setPattern(p) { this.pattern = p; return this; }
  toggleSlow() { this.slowMode = !this.slowMode; return this.slowMode; }
  toggleLoop(start, end) {
    this.loopActive = !this.loopActive;
    this.loopRange = this.loopActive ? { start, end } : null;
    return this.loopActive;
  }

  getGuidance() {
    const sec = this.song.sections[this.sectionIdx];
    const m = sec.measures[this.measureIdx];
    const interval = ChordEngine.getInterval(this.song.originalKey, this.key);
    const transposed = ChordEngine.normalize(m.chord, this.key);
    const beats = m.beats || parseInt(this.song.timeSignature.split('/')[0]);
    const pattern = PatternEngine.generate(this.pattern, beats);

    // 取得前後和弦用於進度顯示
    const prevM = this.measureIdx > 0 ? sec.measures[this.measureIdx-1] : null;
    const nextM = this.measureIdx < sec.measures.length-1 ? sec.measures[this.measureIdx+1] : null;
    const prevChord = prevM ? ChordEngine.normalize(prevM.chord, this.key) : '-';
    const nextChord = nextM ? ChordEngine.normalize(nextM.chord, this.key) : '-';

    this.lastRenderTime = Date.now();
    return {
      chord: transposed,
      lyrics: m.lyrics,
      beats,
      patternGrid: pattern.grid,
      hint: pattern.hint,
      progression: { prev: prevChord, current: transposed, next: nextChord },
      effectiveBpm: this.slowMode ? Math.round(this.bpm * 0.75) : this.bpm
    };
  }

  next() {
    const sec = this.song.sections[this.sectionIdx];
    if (this.loopActive && this.loopRange) {
      this.measureIdx = (this.measureIdx + 1) % (this.loopRange.end + 1);
      if (this.measureIdx < this.loopRange.start) this.measureIdx = this.loopRange.start;
    } else {
      if (this.measureIdx < sec.measures.length - 1) this.measureIdx++;
      else if (this.sectionIdx < this.song.sections.length - 1) {
        this.sectionIdx++;
        this.measureIdx = 0;
      }
    }
    return this.getGuidance();
  }

  prev() {
    if (this.measureIdx > 0) this.measureIdx--;
    else if (this.sectionIdx > 0) {
      this.sectionIdx--;
      this.measureIdx = this.song.sections[this.sectionIdx].measures.length - 1;
    }
    return this.getGuidance();
  }

  reset() { this.sectionIdx = 0; this.measureIdx = 0; this.loopActive = false; this.loopRange = null; }
  
  recordFeedback(accuracy) {
    const rt = Date.now() - this.lastRenderTime;
    this.feedback.push({ time: rt, accuracy, timestamp: Date.now() });
    return { rt, accuracy };
  }
}
