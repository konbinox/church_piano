// MIDI 输入/输出管理
let midiAccess = null, midiOutput = null;

function requestMIDI() {
  if (!navigator.requestMIDIAccess) return;
  navigator.requestMIDIAccess().then(access => {
    midiAccess = access;
    document.getElementById('pill-midi').className = 'pill pill-on';
    document.getElementById('pill-midi').textContent = '⬤ MIDI 已连接';
    
    access.inputs.forEach(input => {
      input.onmidimessage = (e) => {
        const [status, note, vel] = e.data;
        if ((status & 0xF0) === 0x90 && vel > 0) {
          const noteName = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][note % 12];
          document.getElementById('lk-note').innerHTML = `▶ ${noteName}`;
        }
      };
    });
    
    access.outputs.forEach(out => {
      if (!midiOutput && (out.name.toLowerCase().includes('lk') || out.name.toLowerCase().includes('casio'))) {
        midiOutput = out;
        document.getElementById('pill-lk').className = 'pill pill-on';
        document.getElementById('lk-status').textContent = '已连接';
      }
    });
  });
}
