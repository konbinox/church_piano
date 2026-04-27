// 播放引擎（Web Audio + MIDI 输出）
let currentHymn = null, bpm = 84, playing = false, beatIndex = 0, beatTimer = null;
let outputMode = 'webaudio', audioCtx = null, midiOutput = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playWebAudio(midiNote, durationMs) {
  initAudio();
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.32, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(now + durationMs / 1000 + 0.05);
}

function playMIDINote(note, durationMs) {
  if (midiOutput) {
    midiOutput.send([0x90, note, 85]);
    setTimeout(() => midiOutput.send([0x80, note, 0]), durationMs);
  }
}

function onBeat() {
  if (!currentHymn) return;
  const beat = currentHymn.jianpu[beatIndex];
  const key = document.getElementById('key-sel')?.value || currentHymn.key;
  const midi = beatToMIDI(beat, key);
  if (outputMode === 'webaudio' || outputMode === 'both') playWebAudio(midi, 400);
  if ((outputMode === 'midi' || outputMode === 'both') && midiOutput) playMIDINote(midi, 400);
  
  // 触发 UI 更新事件
  window.dispatchEvent(new CustomEvent('beat', { detail: { beatIndex, beat } }));
}

function startPlayback() {
  if (!currentHymn) return;
  playing = true;
  scheduleBeat();
}

function stopPlayback() {
  playing = false;
  if (beatTimer) clearTimeout(beatTimer);
}

function scheduleBeat() {
  if (!playing) return;
  beatTimer = setTimeout(() => {
    beatIndex = (beatIndex + 1) % currentHymn.jianpu.length;
    onBeat();
    scheduleBeat();
  }, (60 / bpm) * 1000);
}

function setBPM(v) { bpm = v; }
function setOutputMode(mode) { outputMode = mode; }
function setMidiOutput(out) { midiOutput = out; }
