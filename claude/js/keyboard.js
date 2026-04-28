// ═══════════════════════════════════════════════════
// keyboard.js — 61键钢琴可视化
// ═══════════════════════════════════════════════════

const KB61_START = 36;
const KB61_END   = 96;
const BLACK_PC   = new Set([1,3,6,8,10]);

// ── iframe postMessage 通信 ──
function build61Keys(rootNotes, chordNotes, lhNote) {
  const frame = document.getElementById('kb61-frame');
  if (!frame || !frame.contentWindow) return;
  frame.contentWindow.postMessage({
    type: 'kb61update', rootNotes, chordNotes, lhNote
  }, '*');
}

window.addEventListener('message', e => {
  if (e.data && e.data.type === 'kb61ready') {
    const chord = document.getElementById('prac-chord')?.textContent
                  || currentHymn?.chords?.[0] || 'C';
    setTimeout(() => updatePracDisplay(chord), 30);
    return;
  }
  if (e.data && e.data.type === 'kb61click') {
    const midi = e.data.midi;
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state==='suspended') audioCtx.resume();
    playWebAudio(midi, 500);
    if (midiOutput) playMIDINote(midi, 500);
  }
});

function kb61Click() {}
