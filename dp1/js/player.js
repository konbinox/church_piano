// 播放引擎模块
let currentHymn = null;
let bpm = 80;
let playing = false;
let beatIndex = 0;
let beatTimer = null;
let sessionStart = null;
let sessionTimer = null;

function startPlayback() {
  if (!currentHymn) return;
  playing = true;
  const playBtn = document.getElementById('play-pause');
  if (playBtn) playBtn.textContent = '⏸';
  if (!sessionStart) {
    sessionStart = Date.now();
    sessionTimer = setInterval(() => {
      if (!sessionStart) return;
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      document.getElementById('time-display').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      document.getElementById('fb-session').textContent = `${m}'${s < 10 ? '0' : ''}${s}"`;
    }, 1000);
  }
  scheduleBeat();
}

function stopPlayback() {
  playing = false;
  if (beatTimer) clearTimeout(beatTimer);
  const playBtn = document.getElementById('play-pause');
  if (playBtn) playBtn.textContent = '▶';
}

function scheduleBeat() {
  if (!playing) return;
  const interval = (60 / bpm) * 1000;
  beatTimer = setTimeout(() => {
    beatIndex = (beatIndex + 1) % currentHymn.jianpu.length;
    onBeat();
    scheduleBeat();
  }, interval);
}

function onBeat() {
  if (!currentHymn) return;
  const beat = currentHymn.jianpu[beatIndex];
  const key = document.getElementById('key-sel')?.value || currentHymn.key;
  const midiNote = beatToMIDI(beat, key);
  const outputMode = document.getElementById('output-mode')?.value || 'webaudio';
  
  if (outputMode === 'webaudio' || outputMode === 'both') {
    playWebAudio(midiNote, 380);
  }
  if ((outputMode === 'midi' || outputMode === 'both') && window.midiOutput) {
    playMIDINote(midiNote, 380);
  }
  
  // 触发UI更新事件
  const event = new CustomEvent('beat', { detail: { beatIndex, beat } });
  window.dispatchEvent(event);
}

function setBPM(value) {
  bpm = value;
  document.getElementById('bpm-display').textContent = bpm;
}
