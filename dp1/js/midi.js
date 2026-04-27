// MIDI 模块
let midiAccess = null;
window.midiOutput = null;

function requestMIDI() {
  if (!navigator.requestMIDIAccess) {
    logMIDI('⚠️ 此浏览器不支持 Web MIDI API');
    return;
  }
  navigator.requestMIDIAccess({ sysex: false })
    .then(access => {
      midiAccess = access;
      document.getElementById('pill-midi').className = 'pill pill-on';
      document.getElementById('pill-midi').textContent = '🎹 MIDI 已连接';
      
      // 输入设备
      const devList = document.getElementById('midi-device-list');
      if (devList) {
        devList.innerHTML = '';
        access.inputs.forEach(input => {
          const div = document.createElement('div');
          div.className = 'feedback-item';
          div.innerHTML = `<span>🎹 ${input.name}</span><span class="fb-val">IN</span>`;
          devList.appendChild(div);
          logMIDI(`✓ 输入设备: ${input.name}`);
          input.onmidimessage = onMIDIMessage;
        });
        if (access.inputs.size === 0) {
          devList.innerHTML = '<div style="color: var(--text-dim);">未发现输入设备</div>';
        }
      }
      
      // 输出设备
      access.outputs.forEach(output => {
        if (!window.midiOutput && (output.name.toLowerCase().includes('lk') || 
            output.name.toLowerCase().includes('casio') ||
            output.name.toLowerCase().includes('midi'))) {
          window.midiOutput = output;
          document.getElementById('pill-lk').className = 'pill pill-on';
          document.getElementById('lk-status').textContent = '已连接';
          logMIDI(`✓ 输出设备: ${output.name}`);
        }
      });
    })
    .catch(e => logMIDI(`✗ MIDI 错误: ${e.message}`));
}

function onMIDIMessage(e) {
  const [status, note, velocity] = e.data;
  if ((status & 0xF0) === 0x90 && velocity > 0) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;
    
    // 简单的正确性判断
    const expected = currentHymn?.jianpu[beatIndex];
    const expectedMap = { '1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'B' };
    const expectedNote = expectedMap[expected?.n];
    const correct = noteName === expectedNote;
    
    if (!window.totalNotes) window.totalNotes = 0;
    if (!window.correctNotes) window.correctNotes = 0;
    window.totalNotes++;
    if (correct) window.correctNotes++;
    
    document.getElementById('lk-note').innerHTML = `▶ ${noteName}${octave} ${correct ? '✓' : '✗'}`;
    document.getElementById('lk-feedback').innerHTML = correct ? '正确！继续下一音' : `期望：${expectedNote || '?'}`;
    document.getElementById('fb-last').textContent = `${noteName}${octave}`;
    const acc = window.totalNotes > 0 ? Math.round(window.correctNotes / window.totalNotes * 100) : 0;
    document.getElementById('fb-acc').textContent = `${acc}%`;
    
    logMIDI(`${correct ? '✓' : '✗'} ${noteName}${octave} (vel:${velocity})`);
  }
}

function logMIDI(msg) {
  const logDiv = document.getElementById('midi-log');
  if (logDiv) {
    const time = new Date().toLocaleTimeString();
    logDiv.innerHTML += `<div>[${time}] ${msg}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}
