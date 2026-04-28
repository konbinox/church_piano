// ═══════════════════════════════════════════════════
// player.js — 统一播放引擎
// 所有发音、计时、节拍事件从这里发出
// ═══════════════════════════════════════════════════

// ── 全局状态 ──
let currentHymn = null;   // 由 loadHymn() 设置
let bpm         = 84;
let playing     = false;
let looping     = false;
let beatIndex   = 0;
let beatTimer   = null;
let sessionStart= null;
let sessionTimer= null;
let outputMode  = 'webaudio'; // 'webaudio' | 'midi' | 'both'
let audioCtx    = null;

// ── 节拍事件订阅者 ──
const beatListeners = [];
function onBeatEvent(fn) { beatListeners.push(fn); }

// ======================================================
// PLAYBACK ENGINE
// ======================================================
function togglePlay() {
  playing ? stopPlayback() : startPlayback();
}

function startPlayback() {
  playing = true;
  document.getElementById('btn-play').textContent = '⏸';
  document.getElementById('btn-play').classList.add('active');
  if (!sessionStart) { sessionStart = Date.now(); startSessionTimer(); }
  scheduleBeat();
}

function stopPlayback() {
  playing = false;
  if (beatTimer) clearTimeout(beatTimer);
  document.getElementById('btn-play').textContent = '▶';
  document.getElementById('btn-play').classList.remove('active');
}

function scheduleBeat() {
  if (!playing) return;
  const interval = (60 / bpm) * 1000;
  beatTimer = setTimeout(() => {
    beatIndex = (beatIndex + 1) % currentHymn.jianpu.length;
    if (beatIndex === 0 && !looping) { stopPlayback(); return; }
    onBeat();
    scheduleBeat();
  }, interval);
}

function onBeat() {
  // Jianpu highlight
  document.querySelectorAll('.jianpu-num').forEach(el => el.classList.remove('active-beat'));
  document.getElementById('jp-' + beatIndex)?.querySelector('.jianpu-num')?.classList.add('active-beat');

  // Scroll jianpu — 滚动容器而非移动整行
  const wrap = document.querySelector('.jianpu-wrap');
  const activeEl = document.getElementById('jp-' + beatIndex);
  if (activeEl && wrap) {
    const center = activeEl.offsetLeft - wrap.clientWidth / 2 + activeEl.offsetWidth / 2;
    wrap.scrollTo({ left: Math.max(0, center), behavior: 'smooth' });
  }

  updateChordOverlay(beatIndex);
  drawStaff();
  drawPianoRoll();
  updateVU();

  // ── 真实音频输出 ──
  const beat = currentHymn.jianpu[beatIndex];
  const key  = document.getElementById('key-sel')?.value || currentHymn.key;
  const midiNote = beatToMIDI(beat, key);
  const noteDuration = (60 / bpm) * 0.85 * 1000; // 85% 音符时值，留一点断句

  if (outputMode === 'webaudio' || outputMode === 'both') {
    playWebAudio(midiNote, noteDuration);
  }
  if ((outputMode === 'midi' || outputMode === 'both') && midiOutput) {
    playMIDINote(midiNote, noteDuration);
  }

  // Update time
  if (sessionStart) {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    document.getElementById('time-display').textContent = m + ':' + (s < 10 ? '0' : '') + s;
  }
}

// ── Web Audio 合成（钢琴音色近似）──
function playWebAudio(midiNote, durationMs) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const now  = audioCtx.currentTime;

  // 基音
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2.01; // 轻微失谐二次谐波

  const merge = audioCtx.createGain();
  merge.gain.value = 0.5;
  osc1.connect(merge);
  osc2.connect(merge);
  merge.connect(gain);
  gain.connect(audioCtx.destination);

  // 钢琴包络：快攻，缓衰
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

  osc1.start(now); osc1.stop(now + durationMs / 1000 + 0.05);
  osc2.start(now); osc2.stop(now + durationMs / 1000 + 0.05);
}

// ── MIDI 输出发音 ──
function playMIDINote(midiNote, durationMs) {
  if (!midiOutput) return;
  const ch = 0; // MIDI 通道 1
  midiOutput.send([0x90 | ch, midiNote, 90]);   // Note On, velocity 90
  setTimeout(() => {
    try { midiOutput.send([0x80 | ch, midiNote, 0]); } catch(e){}
  }, durationMs);
}

function testMIDIOut() {
  if (!midiOutput) { logMIDI('⚠ 请先连接 MIDI 设备并选择输出'); return; }
  // 播放 C 大调音阶测试
  const scale = [60,62,64,65,67,69,71,72];
  scale.forEach((n, i) => {
    setTimeout(() => playMIDINote(n, 300), i * 350);
  });
  logMIDI('▶ 测试音阶发送至 ' + midiOutput.name);
}

function skipBack() { beatIndex = 0; drawStaff(); drawPianoRoll(); updateChordOverlay(0); }
function skipFwd()  { beatIndex = Math.min(currentHymn.jianpu.length - 1, beatIndex + (currentHymn.time === '3/4' ? 3 : 4)); drawStaff(); drawPianoRoll(); updateChordOverlay(beatIndex); }

function toggleLoop() {
  looping = !looping;
  document.getElementById('btn-loop').classList.toggle('active', looping);
}

function setBPM(v) {
  bpm = v;
  document.getElementById('bpm-display').textContent = v;
}

function transposeKey(k) {
  // In a real app we'd transpose all pitches; here just update display
  document.getElementById('stat-streak') && (document.getElementById('stat-streak').textContent = k);
}

function setMode(m) { /* mode switching hook */ }

// ======================================================
// 🥁 节奏引导音 (咚·哒哒)
// ======================================================
let rhythmGuideActive = false;
let rhythmGuideTimer = null;
let rhythmBeatCount = 0;

function toggleRhythmGuide() {
  rhythmGuideActive = !rhythmGuideActive;
  const btn = document.getElementById('btn-rhythm');
  btn.style.borderColor = rhythmGuideActive ? '#3ddc84' : '';
  btn.style.color = rhythmGuideActive ? '#3ddc84' : '';
  btn.textContent = rhythmGuideActive ? '🥁 引导中…' : '🥁 节奏引导';

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
  const interval = (60 / bpm) * 1000;
  const beatInMeasure = rhythmBeatCount % (currentHymn.time === '3/4' ? 3 : 4);
  rhythmBeatCount++;

  const isDownbeat = beatInMeasure === 0;

  // 音效
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.frequency.value = isDownbeat ? 110 : 660;  // 咚=低频，哒=高频
  gain.gain.setValueAtTime(isDownbeat ? 0.4 : 0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isDownbeat ? 0.12 : 0.06));
  osc.start(); osc.stop(audioCtx.currentTime + 0.15);

  // 作业模式里的视觉节拍
  if (examMode) {
    const b1 = document.getElementById('exam-beat-1');
    const b2 = document.getElementById('exam-beat-2');
    const b3 = document.getElementById('exam-beat-3');
    [b1,b2,b3].forEach(el => {
      if (el) { el.style.background='#0a1a14'; el.style.borderColor='#0f3020'; el.style.color='#2a4a3a'; }
    });
    if (beatInMeasure === 0 && b1) { b1.style.background='rgba(61,220,132,0.2)'; b1.style.borderColor='#3ddc84'; b1.style.color='#3ddc84'; }
    else if (beatInMeasure === 1 && b2) { b2.style.background='rgba(61,220,132,0.08)'; b2.style.borderColor='#1a6e40'; b2.style.color='#6ddc9a'; }
    else if (beatInMeasure === 2 && b3) { b3.style.background='rgba(61,220,132,0.08)'; b3.style.borderColor='#1a6e40'; b3.style.color='#6ddc9a'; }
  }

  rhythmGuideTimer = setTimeout(tickRhythmGuide, interval);
}

// ======================================================
// ⟳ 和弦循环训练
// ======================================================
let chordLoopTimer = null;
let chordLoopIdx = 0;

function startChordLoop() {
  stopChordLoop();
  const chords = currentHymn.chords || ['C','F','G'];
  const interval = 2500; // 每2.5秒换一个和弦，足够切换手型
  chordLoopIdx = 0;

  function showNext() {
    const ch = chords[chordLoopIdx % chords.length];
    document.getElementById('exam-chord').textContent = ch;

    // 找 fn
    const beat = currentHymn.jianpu.find(b => b.chord === ch);
    const fnNames = { 'I':'I 级 · 主和弦', 'IV':'IV 级 · 下属和弦', 'V':'V 级 · 属和弦', 'vi':'vi 级 · 关系小调' };
    document.getElementById('exam-fn').textContent = fnNames[beat?.fn] || (beat?.fn || '');

    // 高亮
    document.querySelectorAll('[id^="ecr-"]').forEach(el => {
      const isActive = el.id === 'ecr-' + ch;
      el.style.borderColor = isActive ? '#f0b429' : '#1a3a20';
      el.style.color = isActive ? '#f0b429' : '#5a8a6a';
      el.style.background = isActive ? 'rgba(240,180,41,0.08)' : '#0a1a10';
      el.style.transform = isActive ? 'scale(1.1)' : 'scale(1)';
    });

    chordLoopIdx++;
    chordLoopTimer = setTimeout(showNext, interval);
  }

  showNext();
  document.getElementById('btn-loop-train').style.borderColor = '#f0b429';
  document.getElementById('btn-loop-train').style.color = '#f0b429';
}

function stopChordLoop() {
  if (chordLoopTimer) clearTimeout(chordLoopTimer);
  chordLoopTimer = null;
  const btn = document.getElementById('btn-loop-train');
  if (btn) { btn.style.borderColor='#1a6e40'; btn.style.color='#3ddc84'; }
}
let audioCtx = null;
function toggleMetronome() {
  metronomePlaying = !metronomePlaying;
  if (metronomePlaying) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

// ======================================================
// SESSION TIMER
// ======================================================
function startSessionTimer() {
  sessionTimer = setInterval(() => {
    if (!sessionStart) return;
    const e = Math.floor((Date.now() - sessionStart) / 1000);
    const m = Math.floor(e / 60), s = e % 60;
    document.getElementById('fb-session').textContent = m + "'" + (s < 10 ? '0' : '') + s + '"';
  }, 1000);
}

function setOutputMode(mode) {
  outputMode = mode;
  const midiSel = document.getElementById('midi-out-sel');
  if (midiSel) midiSel.style.display = (mode==='midi'||mode==='both') ? 'inline-block' : 'none';
  if ((mode==='midi'||mode==='both') && !midiAccess) requestMIDI();
}

function setBPM(v) {
  bpm = v;
  const el = document.getElementById('bpm-display');
  if (el) el.textContent = v;
}

function transposeKey(k) {}
function setMode(m) {}
function toggleLoop() {
  looping = !looping;
  document.getElementById('btn-loop')?.classList.toggle('active', looping);
}
function skipBack() { beatIndex = 0; onBeat(); }
function skipFwd()  {
  beatIndex = Math.min(currentHymn.jianpu.length-1, beatIndex+(currentHymn.time==='3/4'?3:4));
  onBeat();
}
function togglePlay() { playing ? stopPlayback() : startPlayback(); }
