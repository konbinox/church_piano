// 弹法练习模块
let pracStyle = 'block';
let pracPlaying = false;
let pracTimer = null;
let pracMeasBeat = 0;
let pracChordIdx = 0;

function getPracVoicing(chord) {
  const v = CHORD_VOICING[chord] || CHORD_VOICING['C'];
  const rh = v.notes.map(n => n < 60 ? n + 12 : n > 76 ? n - 12 : n);
  return { root: v.root, rh, lh: v.root - 12, name: v.name, lhHint: v.lh, rhHint: v.rh };
}

function updatePracDisplay(chord) {
  if (!chord) return;
  const v = getPracVoicing(chord);
  document.getElementById('prac-chord').textContent = chord;
  document.getElementById('prac-notes').textContent = v.name;
  
  // 更新61键键盘
  const frame = document.getElementById('kb61-frame');
  if (frame && frame.contentWindow) {
    const roots = [], chords = [];
    for (let oct = -1; oct <= 1; oct++) {
      roots.push(v.root + oct * 12);
      v.rh.forEach(n => chords.push(n + oct * 12));
    }
    frame.contentWindow.postMessage({
      type: 'kb61update',
      rootNotes: roots.filter(n => n >= 36 && n <= 96),
      chordNotes: chords.filter(n => n >= 36 && n <= 96),
      lhNote: v.lh
    }, '*');
  }
  
  document.getElementById('kb61-label').innerHTML = 
    `左手根音: ${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][v.lh % 12]}${Math.floor(v.lh / 12) - 1} &nbsp; 右手和弦: ${v.name}`;
  
  const hints = {
    block: `${v.lhHint}<br>${v.rhHint} 同时按`,
    arpeggio: `${v.lhHint}<br>逐音分解: 根→三→五→三`,
    rhythm: `${v.lhHint} 第1拍<br>右手和弦 第2+3拍`
  };
  document.getElementById('prac-hint').innerHTML = hints[pracStyle] || hints.block;
  
  renderPracBeatCells(chord);
}

function renderPracBeatCells(chord) {
  const container = document.getElementById('prac-beat-cells');
  if (!container) return;
  container.innerHTML = '';
  const beatsMap = {
    block: [{ s: '和弦', t: 'root' }, { s: '—', t: 'rest' }, { s: '—', t: 'rest' }, { s: '—', t: 'rest' }],
    arpeggio: [{ s: '根', t: 'root' }, { s: '三', t: 'chord' }, { s: '五', t: 'chord' }, { s: '三', t: 'chord' }],
    rhythm: [{ s: '咚', t: 'root' }, { s: '哒', t: 'chord' }, { s: '哒', t: 'chord' }, { s: '—', t: 'rest' }]
  };
  const beats = beatsMap[pracStyle] || beatsMap.block;
  for (let i = 0; i < 4; i++) {
    const cell = document.createElement('div');
    cell.className = 'prac-cell';
    const noteDiv = document.createElement('div');
    noteDiv.className = `prac-note on-${beats[i].t}`;
    noteDiv.textContent = beats[i].s;
    cell.appendChild(noteDiv);
    container.appendChild(cell);
  }
}

function litPracBeat(beatInMeasure) {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`pb${i + 1}`);
    if (el) {
      el.className = `pulse-dot ${i === beatInMeasure ? (i === 0 ? 'beat-on-root' : 'beat-on-chord') : ''} ${i === 0 ? 'big-dot' : ''}`;
    }
  }
}

function startPracPlay() {
  initAudio();
  pracPlaying = true;
  pracMeasBeat = 0;
  pracChordIdx = 0;
  document.getElementById('prac-play-btn').textContent = '⏸';
  tickPracPlay();
}

function stopPracPlay() {
  pracPlaying = false;
  if (pracTimer) clearTimeout(pracTimer);
  document.getElementById('prac-play-btn').textContent = '▶ 开始练习';
}

function tickPracPlay() {
  if (!pracPlaying) return;
  const interval = (60 / bpm) * 1000;
  const chords = currentHymn?.chords || ['C'];
  const chord = chords[pracChordIdx % chords.length];
  const v = getPracVoicing(chord);
  
  if (pracMeasBeat === 0) updatePracDisplay(chord);
  litPracBeat(pracMeasBeat);
  
  const patterns = {
    block: [[v.lh, ...v.rh], [], [], []],
    arpeggio: [[v.lh, v.rh[0]], [v.rh[1]], [v.rh[2]], [v.rh[1]]],
    rhythm: [[v.lh], [...v.rh], [...v.rh], []]
  };
  const pattern = patterns[pracStyle] || patterns.block;
  const toPlay = pattern[pracMeasBeat % 4] || [];
  const dur = interval * 0.85;
  
  toPlay.forEach(n => {
    if (typeof n === 'number') {
      playWebAudio(n, dur);
      const mode = document.getElementById('output-mode')?.value || 'webaudio';
      if ((mode === 'midi' || mode === 'both') && window.midiOutput) {
        playMIDINote(n, dur);
      }
    }
  });
  
  pracMeasBeat++;
  if (pracMeasBeat >= 4) {
    pracMeasBeat = 0;
    pracChordIdx++;
  }
  pracTimer = setTimeout(tickPracPlay, interval);
}

function setPracStyle(style) {
  pracStyle = style;
  document.querySelectorAll('.psb').forEach(btn => btn.classList.remove('active-psb'));
  document.querySelector(`.psb[data-ps="${style}"]`)?.classList.add('active-psb');
  const chord = document.getElementById('prac-chord')?.textContent || 'C';
  updatePracDisplay(chord);
}

function buildPracChordRow() {
  const row = document.getElementById('prac-chord-row');
  if (!row || !currentHymn) return;
  row.innerHTML = '';
  const chords = [...new Set(currentHymn.jianpu.map(b => b.chord).filter(Boolean))];
  chords.forEach(ch => {
    const div = document.createElement('div');
    div.textContent = ch;
    div.onclick = () => {
      updatePracDisplay(ch);
      const v = getPracVoicing(ch);
      v.rh.forEach(n => playWebAudio(n, 400));
    };
    row.appendChild(div);
  });
}

let pracLoopActive = false;
function loopChords() {
  pracLoopActive = !pracLoopActive;
  const btn = document.getElementById('prac-loop-btn');
  if (pracLoopActive) {
    btn.textContent = '⟳ 循环中';
    btn.style.borderColor = '#f0b429';
    if (!pracPlaying) startPracPlay();
  } else {
    btn.textContent = '⟳ 循环';
    btn.style.borderColor = '';
  }
}
