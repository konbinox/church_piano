// ═══════════════════════════════════════════════════
// practice.js — 弹法练习模块
// ═══════════════════════════════════════════════════

let pracStyle     = 'block';
let pracPlaying   = false;
let pracPlayTimer = null;
let pracMeasBeat  = 0;
let pracChordIdx2 = 0;
let pracLoopActive= false;
let pracLoopTimer = null;
let pracLoopI     = 0;
let pracLooping   = false;
let pracTimer     = null;
let pracBeat      = 0;
let pracChordI    = 0;

// ======================================================
// 🎹 弹法练习标签页引擎
// ======================================================

// LK-280 61键布局：从C2(MIDI36)到C7(MIDI96)
// KB61_START / KB61_END / BLACK_PC 已在 keyboard.js 定义

// ── 61键 iframe 通信 ──────────────────────────────────
let _kbLayout = null; // keep for kb61Click compat

function build61Keys(rootNotes, chordNotes, lhNote) {
  const frame = document.getElementById('kb61-frame');
  if (!frame || !frame.contentWindow) return;
  frame.contentWindow.postMessage({
    type: 'kb61update',
    rootNotes,
    chordNotes,
    lhNote
  }, '*');
}

// Receive click events from iframe
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'kb61ready') {
    // iframe loaded — send current chord immediately
    const chord = document.getElementById('prac-chord')?.textContent || (currentHymn.chords?.[0] || 'C');
    setTimeout(() => updatePracDisplay(chord), 30);
    return;
  }
  if (e.data && e.data.type === 'kb61click') {
    const midi = e.data.midi;
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playWebAudio(midi, 500);
    if (midiOutput) playMIDINote(midi, 500);
  }
});

function kb61Click() {} // kept for compat


function getPracVoicing(chord) {
  const v = CHORD_VOICING[chord] || CHORD_VOICING['C'];
  // 右手：中央C附近（MIDI 60-75），左手：低一个八度根音
  const rh = v.notes.map(n => n < 60 ? n + 12 : n > 76 ? n - 12 : n);
  const lh = v.root - 12; // 左手低八度
  return { root: v.root, rh, lh, name: v.name, lhHint: v.lh, rhHint: v.rh };
}

function updatePracDisplay(chord) {
  if (!chord) return;
  const v = getPracVoicing(chord);

  // 大字和弦
  const el = document.getElementById('prac-chord');
  if (el) el.textContent = chord;

  // 功能级
  const bd = currentHymn.jianpu.find(b => b.chord === chord);
  const fnNames = {'I':'I 级·主和弦','IV':'IV 级·下属和弦','V':'V 级·属和弦','vi':'vi 级·关系小调','V7':'V7·属七'};
  const fnEl = document.getElementById('prac-fn');
  if (fnEl) fnEl.textContent = fnNames[bd?.fn] || '';

  // 音符组成
  const nEl = document.getElementById('prac-notes');
  if (nEl) nEl.textContent = v.name;

  // 键盘高亮
  // 所有右手音 + 不同八度的同名音
  const allChord = [];
  for (let oct = 0; oct < 5; oct++) {
    v.rh.forEach(n => {
      const shifted = n + oct * 12;
      if (shifted >= KB61_START && shifted <= KB61_END) allChord.push(shifted);
      const down = n - oct * 12;
      if (down >= KB61_START && down <= KB61_END) allChord.push(down);
    });
  }
  const rootAll = [];
  for (let oct = -2; oct <= 2; oct++) {
    const r = v.root + oct * 12;
    if (r >= KB61_START && r <= KB61_END) rootAll.push(r);
  }
  build61Keys(rootAll, [...new Set(allChord)], v.lh);

  // 标注
  const lblEl = document.getElementById('kb61-label');
  if (lblEl) lblEl.innerHTML =
    `<span style="color:#4a9eff">左手</span>: ${NOTE_NAMES[v.lh%12]}${Math.floor(v.lh/12)-1}&nbsp;&nbsp;` +
    `<span style="color:#f0b429">根音</span>: ${NOTE_NAMES[v.root%12]}&nbsp;&nbsp;` +
    `<span style="color:#3ddc84">右手和弦</span>: ${v.name}`;

  // 更新拍格
  renderPracBeatCells(chord);

  // 手型提示
  const hintEl = document.getElementById('prac-hint');
  const styleHints = {
    block:    `${v.lhHint}\n${v.rhHint}\n三音同时按`,
    arpeggio: `${v.lhHint}\n右手逐音: 根→三→五→三`,
    rhythm:   `${v.lhHint} 第1拍\n右手和弦 第2+3拍`,
  };
  if (hintEl) hintEl.textContent = styleHints[pracStyle] || '';

  // 高亮进行条
  document.querySelectorAll('[id^="pcr-"]').forEach(el => {
    const active = el.id === 'pcr-' + chord;
    el.style.borderColor = active ? '#f0b429' : '#1a3a20';
    el.style.color       = active ? '#f0b429' : '#5a8a6a';
    el.style.background  = active ? 'rgba(240,180,41,0.1)' : 'transparent';
  });

  // 更新指法显示
  if (typeof updateFingering === 'function') updateFingering(chord);
}

function renderPracBeatCells(chord) {
  const container = document.getElementById('prac-beat-cells');
  if (!container) return;
  container.innerHTML = '';

  const v = getPracVoicing(chord);
  const beats4 = {
    block:    [{t:'root',s:'和弦'},{t:'rest',s:'—'},{t:'rest',s:'—'},{t:'rest',s:'—'}],
    arpeggio: [{t:'root',s:NOTE_NAMES[v.rh[0]%12]},{t:'chord',s:NOTE_NAMES[v.rh[1]%12]},{t:'chord',s:NOTE_NAMES[v.rh[2]%12]},{t:'chord',s:NOTE_NAMES[v.rh[1]%12]}],
    rhythm:   [{t:'root',s:'咚'},{t:'chord',s:'哒'},{t:'chord',s:'哒'},{t:'rest',s:'—'}],
  };
  const beats = beats4[pracStyle] || beats4.block;
  const beatsPerMeasure = currentHymn.time === '3/4' ? 3 : 4;

  beats.slice(0, beatsPerMeasure).forEach((b, i) => {
    const cell = document.createElement('div');
    cell.className = 'prac-cell';

    const note = document.createElement('div');
    note.className = 'prac-note on-' + b.t;
    note.id = 'pnote-' + i;
    note.textContent = b.s;

    const lbl = document.createElement('div');
    lbl.className = 'prac-cell-lbl';
    lbl.textContent = '第' + (i+1) + '拍';

    cell.appendChild(note);
    cell.appendChild(lbl);
    container.appendChild(cell);
  });
}

function litPracBeat(beatInMeasure) {
  const beatsPerMeasure = currentHymn.time === '3/4' ? 3 : 4;
  // 脉冲圆
  ['pb1','pb2','pb3','pb4'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i === beatInMeasure) {
      el.className = 'pulse-dot' + (i===0?' big-dot':'') +
        (i === 0 ? ' beat-on-root' : ' beat-on-chord');
    } else {
      el.className = 'pulse-dot' + (i===0?' big-dot':'');
    }
  });
  // 拍格高亮
  for (let i = 0; i < beatsPerMeasure; i++) {
    const el = document.getElementById('pnote-' + i);
    if (!el) continue;
    const wasClass = el.className;
    if (i === beatInMeasure) {
      el.style.transform = 'scale(1.12)';
      el.style.filter = 'brightness(1.4)';
    } else {
      el.style.transform = 'scale(1)';
      el.style.filter = 'brightness(1)';
    }
  }
}

function setPracStyle(s) {
  pracStyle = s;
  ['block','arpeggio','rhythm'].forEach(id => {
    const b = document.getElementById('psb-' + id);
    if (b) b.className = 'psb' + (id === s ? ' active-psb' : '');
  });
  const chord = document.getElementById('prac-chord')?.textContent || currentHymn.chords?.[0] || 'C';
  updatePracDisplay(chord);
}

function buildPracChordRow() {
  const row = document.getElementById('prac-chord-row');
  if (!row) return;
  row.innerHTML = '';
  const seen = [];
  currentHymn.jianpu.forEach(b => { if (b.chord && !seen.includes(b.chord)) seen.push(b.chord); });
  seen.forEach(ch => {
    const div = document.createElement('div');
    div.id = 'pcr-' + ch;
    div.textContent = ch;
    div.style.cssText = 'padding:8px 18px;background:transparent;border:1px solid #1a3a20;border-radius:2px;font-family:Libre Baskerville,serif;font-size:22px;color:#5a8a6a;cursor:pointer;transition:all 0.15s;flex-shrink:0';
    div.onclick = () => {
      updatePracDisplay(ch);
      // 发声预览
      if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      if (audioCtx.state==='suspended') audioCtx.resume();
      const v = getPracVoicing(ch);
      v.rh.forEach(n => playWebAudio(n, 600));
      if (midiOutput) v.rh.forEach(n => playMIDINote(n, 600));
    };
    row.appendChild(div);
  });
}

// 弹法练习播放

function startPracPlay() {
  stopPracPlay();
  // 确保 AudioContext 在用户手势里创建
  if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  pracPlaying  = true;
  pracMeasBeat = 0;
  pracChordIdx2 = 0;
  const btn = document.getElementById('prac-play-btn');
  if (btn) { btn.textContent = '⏸ 暂停'; btn.style.borderColor = '#3ddc84'; }
  tickPracPlay();
}

function stopPracPlay() {
  pracPlaying = false;
  if (pracPlayTimer) { clearTimeout(pracPlayTimer); pracPlayTimer = null; }
  const btn = document.getElementById('prac-play-btn');
  if (btn) { btn.textContent = '▶ 开始'; btn.style.borderColor = ''; }
}

function togglePracPlay() {
  if (pracPlaying) stopPracPlay(); else startPracPlay();
}

function tickPracPlay() {
  if (!pracPlaying) return;
  const interval = (60 / bpm) * 1000;
  const beatsPerMeasure = currentHymn.time === '3/4' ? 3 : 4;
  const chords = currentHymn.chords || ['C'];

  const chord = chords[pracChordIdx2 % chords.length];
  const v = getPracVoicing(chord);

  // 小节开头更新显示和键盘
  if (pracMeasBeat === 0) updatePracDisplay(chord);

  // 节奏脉冲 + 拍格闪光
  litPracBeat(pracMeasBeat);

  // 发音模式
  const beats4 = {
    block:    [ [v.lh, ...v.rh], [],          [],          []          ],
    arpeggio: [ [v.lh, v.rh[0]], [v.rh[1]],   [v.rh[2]],   [v.rh[1]]  ],
    rhythm:   [ [v.lh],          [...v.rh],    [...v.rh],   []          ],
  };
  const pattern  = beats4[pracStyle] || beats4.block;
  const toPlay   = pattern[pracMeasBeat % beatsPerMeasure] || [];
  const dur      = interval * 0.82;

  toPlay.forEach(n => {
    if (typeof n !== 'number' || isNaN(n)) return;
    playWebAudio(n, dur);
    if ((outputMode === 'midi' || outputMode === 'both') && midiOutput) playMIDINote(n, dur);
  });

  // 推进拍子
  pracMeasBeat++;
  if (pracMeasBeat >= beatsPerMeasure) {
    pracMeasBeat = 0;
    pracChordIdx2++;
    if (pracChordIdx2 >= chords.length) {
      pracChordIdx2 = 0; // 始终循环，不自动停止
    }
  }

  pracPlayTimer = setTimeout(tickPracPlay, interval);
}

function loopChords() {
  pracLoopActive = !pracLoopActive;
  const btn = document.getElementById('prac-loop-btn');
  if (pracLoopActive) {
    if (btn) { btn.className = 'btn btn-gold'; btn.style.borderColor = '#f0b429'; btn.textContent = '⟳ 循环中'; }
    pracLoopI = 0;
    // 如果没在播放，也启动播放
    if (!pracPlaying) startPracPlay();
  } else {
    if (btn) { btn.textContent = '⟳ 循环'; btn.style.borderColor = ''; }
  }
}

function cycleNextChord() {
  if (!pracLoopActive) return;
  const chords = currentHymn.chords || ['C','F','G'];
  updatePracDisplay(chords[pracLoopI % chords.length]);
  pracLoopI++;
  pracLoopTimer = setTimeout(cycleNextChord, (60/bpm)*1000 * (currentHymn.time==='3/4'?3:4));
}

// ══════════════════════════════════════════════
// 指法显示系统
// ══════════════════════════════════════════════

const FINGERING = {
  C:  { root:'C3',  rh:['C4','E4','G4']  },
  F:  { root:'F3',  rh:['F4','A4','C5']  },
  G:  { root:'G3',  rh:['G4','B4','D5']  },
  D:  { root:'D3',  rh:['D4','F#4','A4'] },
  Am: { root:'A2',  rh:['A3','C4','E4']  },
  Em: { root:'E3',  rh:['E4','G4','B4']  },
  Bb: { root:'Bb2', rh:['Bb3','D4','F4'] },
  Eb: { root:'Eb3', rh:['Eb4','G4','Bb4']},
};

const RH_FINGERS = [1, 3, 5];
let fingerAnimTimer = null;
let fingerArpIdx    = 0;

function updateFingering(chordName) {
  const data  = FINGERING[chordName] || FINGERING['C'];
  const style = (typeof pracStyle !== 'undefined') ? pracStyle : 'block';

  const cn = document.getElementById('finger-chord-name');
  const sh = document.getElementById('finger-style-hint');
  if (cn) cn.textContent = chordName;
  if (sh) sh.textContent = style === 'block' ? '柱式' : style === 'arpeggio' ? '分解' : '节奏';

  clearFingerHighlight();

  // 左手5按根音
  setFingerNote('lf', 5, data.root);
  const lhHint = document.getElementById('lh-hint');
  if (lhHint) lhHint.textContent = '根音 ' + data.root;

  // 右手
  const rhNotes = data.rh;
  RH_FINGERS.forEach((f, i) => setFingerNote('rf', f, rhNotes[i] || '—'));
  const rhHint = document.getElementById('rh-hint');
  if (rhHint) rhHint.textContent = style === 'arpeggio' ? '1 → 3 → 5 → 3' : '1 - 3 - 5';

  highlightFingerStatic(chordName, style);
}

function setFingerNote(hand, finger, note) {
  const el = document.getElementById(hand + '-' + finger + '-note');
  if (el) el.textContent = note;
}

function clearFingerHighlight() {
  ['lf-1','lf-2','lf-3','lf-4','lf-5',
   'rf-1','rf-2','rf-3','rf-4','rf-5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'finger-key';
  });
}

function highlightFingerStatic(chordName, style) {
  const lf5 = document.getElementById('lf-5');
  if (lf5) lf5.classList.add('lh-active');

  if (style === 'arpeggio') {
    const rf1 = document.getElementById('rf-1');
    if (rf1) rf1.classList.add('root-active');
  } else {
    RH_FINGERS.forEach(f => {
      const el = document.getElementById('rf-' + f);
      if (el) el.classList.add(f === 1 ? 'root-active' : 'active');
    });
  }
}

function animateArpFinger() {
  if (fingerAnimTimer) clearInterval(fingerAnimTimer);
  fingerArpIdx = 0;
  const seq = [1, 3, 5, 3];
  const interval = (60 / bpm) * 1000 / 4;
  fingerAnimTimer = setInterval(() => {
    clearFingerHighlight();
    const lf5 = document.getElementById('lf-5');
    if (lf5) lf5.classList.add('lh-active');
    const f  = seq[fingerArpIdx % seq.length];
    const el = document.getElementById('rf-' + f);
    if (el) el.classList.add('active');
    fingerArpIdx++;
  }, interval);
}

function stopFingerAnim() {
  if (fingerAnimTimer) { clearInterval(fingerAnimTimer); fingerAnimTimer = null; }
}

function onFingerBeat(chordName) {
  const style = (typeof pracStyle !== 'undefined') ? pracStyle : 'block';
  if (style === 'arpeggio') {
    animateArpFinger();
  } else {
    clearFingerHighlight();
    const lf5 = document.getElementById('lf-5');
    if (lf5) lf5.classList.add('lh-active');
    RH_FINGERS.forEach(f => {
      const el = document.getElementById('rf-' + f);
      if (el) el.classList.add(f === 1 ? 'root-active' : 'active');
    });
    setTimeout(() => highlightFingerStatic(chordName, style), 200);
  }
}
