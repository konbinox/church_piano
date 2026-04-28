// ═══════════════════════════════════════════════════
// player.js — 统一播放引擎（修复版）
// 修复：audioCtx/setBPM 重复声明
// 升级：onBeat 播放完整和弦（柱式/分解/节奏）
// ═══════════════════════════════════════════════════

let currentHymn  = null;
let bpm          = 84;
let playing      = false;
let looping      = false;
let beatIndex    = 0;
let beatTimer    = null;
let sessionStart = null;
let sessionTimer = null;
let outputMode   = 'webaudio';
let audioCtx     = null;
let metronomePlaying = false;

const beatListeners = [];
function onBeatEvent(fn) { beatListeners.push(fn); }

// ── 和弦音符表 ──
const CHORD_NOTES = {
  C:  ['C4','E4','G4'],
  F:  ['F4','A4','C5'],
  G:  ['G4','B4','D5'],
  D:  ['D4','F#4','A4'],
  Am: ['A3','C4','E4'],
  Em: ['E4','G4','B4'],
  Bb: ['Bb3','D4','F4'],
  Eb: ['Eb4','G4','Bb4'],
};

function getChordNotes(name) {
  return CHORD_NOTES[name] || CHORD_NOTES['C'];
}

function noteNameToMIDI(n) {
  const map = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11};
  const pitch = n.replace(/\d/,'');
  const oct   = parseInt(n.slice(-1));
  return (map[pitch]??0) + (oct+1)*12;
}

// ── 振荡器单音（钢琴包络）──
function playOsc(noteName, startTime, durationSec) {
  const freq  = 440 * Math.pow(2, (noteNameToMIDI(noteName) - 69) / 12);
  const osc1  = audioCtx.createOscillator();
  const osc2  = audioCtx.createOscillator();
  const merge = audioCtx.createGain();
  const gain  = audioCtx.createGain();
  osc1.type = 'triangle'; osc1.frequency.value = freq;
  osc2.type = 'sine';     osc2.frequency.value = freq * 2.01;
  merge.gain.value = 0.5;
  osc1.connect(merge); osc2.connect(merge); merge.connect(gain); gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.28, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.10, startTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);
  osc1.start(startTime); osc1.stop(startTime + durationSec + 0.05);
  osc2.start(startTime); osc2.stop(startTime + durationSec + 0.05);
}

// ── 和弦播放（支持三种弹法）──
function playChordWebAudio(chordName, durationMs) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const notes = getChordNotes(chordName);
  const dur   = durationMs / 1000;
  const now   = audioCtx.currentTime;
  const style = (typeof currentStyle !== 'undefined') ? currentStyle : 'block';

  if (style === 'arpeggio') {
    notes.forEach((n, i) => playOsc(n, now + i * 0.12, dur));
  } else if (style === 'rhythm') {
    notes.forEach(n => playOsc(n, now, dur * 0.5));
    notes.forEach(n => playOsc(n, now + dur * 0.55, dur * 0.4));
  } else {
    // block（默认）
    notes.forEach(n => playOsc(n, now, dur));
  }
}

// ── MIDI 输出 ──
function playMIDINote(midiNote, durationMs) {
  if (!midiOutput) return;
  midiOutput.send([0x90, midiNote, 90]);
  setTimeout(() => { try { midiOutput.send([0x80, midiNote, 0]); } catch(e){} }, durationMs);
}

function playMIDIChord(chordName, durationMs) {
  if (!midiOutput) return;
  const notes = getChordNotes(chordName).map(noteNameToMIDI);
  notes.forEach(n => midiOutput.send([0x90, n, 90]));
  setTimeout(() => { notes.forEach(n => { try { midiOutput.send([0x80, n, 0]); } catch(e){} }); }, durationMs);
}

function testMIDIOut() {
  if (!midiOutput) { logMIDI('⚠ 请先连接 MIDI 设备'); return; }
  [60,62,64,65,67,69,71,72].forEach((n,i) => setTimeout(() => playMIDINote(n, 300), i * 350));
  logMIDI('▶ 测试音阶 → ' + midiOutput.name);
}

// ── 播放控制 ──
function togglePlay() { playing ? stopPlayback() : startPlayback(); }

function startPlayback() {
  if (!currentHymn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  playing = true;
  document.getElementById('btn-play').textContent = '⏸';
  document.getElementById('btn-play').classList.add('active');
  if (!sessionStart) { sessionStart = Date.now(); startSessionTimer(); }
  onBeat();
  scheduleBeat();
}

function stopPlayback() {
  playing = false;
  if (beatTimer) clearTimeout(beatTimer);
  beatTimer = null;
  document.getElementById('btn-play').textContent = '▶';
  document.getElementById('btn-play').classList.remove('active');
}

function scheduleBeat() {
  if (!playing) return;
  beatTimer = setTimeout(() => {
    beatIndex = (beatIndex + 1) % currentHymn.jianpu.length;
    if (beatIndex === 0 && !looping) { stopPlayback(); return; }
    onBeat();
    scheduleBeat();
  }, (60 / bpm) * 1000);
}

function onBeat() {
  if (!currentHymn) return;

  // 简谱高亮 + 滚动
  document.querySelectorAll('.jianpu-num').forEach(el => el.classList.remove('active-beat'));
  document.getElementById('jp-' + beatIndex)?.querySelector('.jianpu-num')?.classList.add('active-beat');
  const wrap = document.querySelector('.jianpu-wrap');
  const activeEl = document.getElementById('jp-' + beatIndex);
  if (activeEl && wrap) {
    wrap.scrollTo({ left: Math.max(0, activeEl.offsetLeft - wrap.clientWidth/2 + activeEl.offsetWidth/2), behavior: 'smooth' });
  }

  updateChordOverlay(beatIndex);
  drawStaff();
  drawPianoRoll();
  updateVU();

  // 计算当前拍对应的和弦
  const chordLen  = currentHymn.chords?.length || 1;
  const beatsPerChord = Math.max(1, Math.floor(currentHymn.jianpu.length / chordLen));
  const chordIdx  = Math.floor(beatIndex / beatsPerChord) % chordLen;
  const chordName = currentHymn.chords?.[chordIdx] || 'C';

  // 发声
  const noteDur = (60 / bpm) * 0.85 * 1000;
  if (outputMode === 'webaudio' || outputMode === 'both') playChordWebAudio(chordName, noteDur);
  if ((outputMode === 'midi'    || outputMode === 'both') && midiOutput) playMIDIChord(chordName, noteDur);

  beatListeners.forEach(fn => fn(beatIndex, chordName));

  // 时间显示
  if (sessionStart) {
    const e = Math.floor((Date.now() - sessionStart) / 1000);
    document.getElementById('time-display').textContent = Math.floor(e/60) + ':' + (e%60 < 10 ? '0' : '') + e%60;
  }
}

// ── 跳转 ──
function skipBack() { beatIndex = 0; if (currentHymn) { drawStaff(); drawPianoRoll(); updateChordOverlay(0); } }
function skipFwd()  {
  if (!currentHymn) return;
  beatIndex = Math.min(currentHymn.jianpu.length-1, beatIndex + (currentHymn.time==='3/4'?3:4));
  drawStaff(); drawPianoRoll(); updateChordOverlay(beatIndex);
}
function toggleLoop()   { looping = !looping; document.getElementById('btn-loop')?.classList.toggle('active', looping); }
function setBPM(v)      { bpm = v; document.getElementById('bpm-display').textContent = v; }
function transposeKey() {}
function setMode()      {}

function setOutputMode(mode) {
  outputMode = mode;
  const s = document.getElementById('midi-out-sel');
  if (s) s.style.display = (mode==='midi'||mode==='both') ? 'inline-block' : 'none';
  if ((mode==='midi'||mode==='both') && !midiAccess) requestMIDI();
}

// ── 节奏引导 ──
let rhythmGuideActive = false;
let rhythmGuideTimer  = null;
let rhythmBeatCount   = 0;

function toggleRhythmGuide() {
  rhythmGuideActive = !rhythmGuideActive;
  const btn = document.getElementById('btn-rhythm');
  btn.style.borderColor = rhythmGuideActive ? '#3ddc84' : '';
  btn.style.color       = rhythmGuideActive ? '#3ddc84' : '';
  btn.textContent       = rhythmGuideActive ? '🥁 引导中…' : '🥁 节奏引导';
  if (rhythmGuideActive) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    tickRhythmGuide();
  } else {
    if (rhythmGuideTimer) clearTimeout(rhythmGuideTimer);
  }
}

function tickRhythmGuide() {
  if (!rhythmGuideActive || !audioCtx) return;
  const beatsPerBar   = currentHymn?.time === '3/4' ? 3 : 4;
  const isDownbeat    = (rhythmBeatCount % beatsPerBar) === 0;
  rhythmBeatCount++;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = isDownbeat ? 110 : 660;
  gain.gain.setValueAtTime(isDownbeat ? 0.4 : 0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isDownbeat ? 0.12 : 0.06));
  osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  rhythmGuideTimer = setTimeout(tickRhythmGuide, (60 / bpm) * 1000);
}

// ── 节拍器 ──
function toggleMetronome() {
  metronomePlaying = !metronomePlaying;
  if (metronomePlaying) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    tickMetronome();
  }
}

function tickMetronome() {
  if (!metronomePlaying || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  osc.start(); osc.stop(audioCtx.currentTime + 0.06);
  setTimeout(tickMetronome, (60 / bpm) * 1000);
}

// ── Session 计时 ──
function startSessionTimer() {
  sessionTimer = setInterval(() => {
    if (!sessionStart) return;
    const e = Math.floor((Date.now() - sessionStart) / 1000);
    const el = document.getElementById('fb-session');
    if (el) el.textContent = Math.floor(e/60) + "'" + (e%60<10?'0':'') + e%60 + '"';
  }, 1000);
}

// ── 和弦循环（练习模式）──
let chordLoopTimer = null;
let chordLoopIdx   = 0;

function loopChords() {
  if (chordLoopTimer) {
    clearTimeout(chordLoopTimer);
    chordLoopTimer = null;
    document.getElementById('prac-loop-btn')?.classList.remove('active');
    return;
  }
  document.getElementById('prac-loop-btn')?.classList.add('active');
  chordLoopIdx = 0;
  stepChordLoop();
}

function stepChordLoop() {
  if (!currentHymn?.chords) return;
  const ch = currentHymn.chords[chordLoopIdx % currentHymn.chords.length];
  if (typeof updatePracDisplay === 'function') updatePracDisplay(ch);
  chordLoopIdx++;
  chordLoopTimer = setTimeout(stepChordLoop, (60 / bpm) * 4 * 1000);
}

// ── 兼容 practice.js 的 MIDI编号接口 ──
function playWebAudio(midiNote, durationMs) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const now  = audioCtx.currentTime;
  const dur  = durationMs / 1000;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const merge= audioCtx.createGain();
  const gain = audioCtx.createGain();
  osc1.type = 'triangle'; osc1.frequency.value = freq;
  osc2.type = 'sine';     osc2.frequency.value = freq * 2.01;
  merge.gain.value = 0.5;
  osc1.connect(merge); osc2.connect(merge); merge.connect(gain); gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.10, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc1.start(now); osc1.stop(now + dur + 0.05);
  osc2.start(now); osc2.stop(now + dur + 0.05);
}
