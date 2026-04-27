// 弹法练习模块（包含 61 键键盘通信）
let pracStyle = 'block', pracPlaying = false, pracTimer = null, pracMeasBeat = 0, pracChordIdx = 0;

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
  // 更新 61 键键盘
  const frame = document.getElementById('kb61-frame');
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({
      type: 'kb61update',
      rootNotes: [v.root],
      chordNotes: v.rh,
      lhNote: v.lh
    }, '*');
  }
}

function startPracPlay() {
  initAudio();
  pracPlaying = true;
  pracMeasBeat = 0;
  pracChordIdx = 0;
  tickPracPlay();
}

function stopPracPlay() {
  pracPlaying = false;
  if (pracTimer) clearTimeout(pracTimer);
}

function tickPracPlay() {
  if (!pracPlaying) return;
  const interval = (60 / bpm) * 1000;
  const chords = currentHymn?.chords || ['C'];
  const chord = chords[pracChordIdx % chords.length];
  const v = getPracVoicing(chord);
  if (pracMeasBeat === 0) updatePracDisplay(chord);
  // 根据 praStyle 发出对应的音...
  const pattern = {
    block: [[v.lh, ...v.rh], [], [], []],
    arpeggio: [[v.lh, v.rh[0]], [v.rh[1]], [v.rh[2]], [v.rh[1]]],
    rhythm: [[v.lh], [...v.rh], [...v.rh], []]
  }[pracStyle] || [[v.lh]];
  (pattern[pracMeasBeat % 4] || []).forEach(n => {
    if (typeof n === 'number') playWebAudio(n, interval * 0.8);
  });
  pracMeasBeat++;
  if (pracMeasBeat >= 4) { pracMeasBeat = 0; pracChordIdx++; }
  pracTimer = setTimeout(tickPracPlay, interval);
}

// 监听 iframe 键盘点击
window.addEventListener('message', (e) => {
  if (e.data?.type === 'kb61click') {
    playWebAudio(e.data.midi, 500);
    if (midiOutput) playMIDINote(e.data.midi, 500);
  }
});
