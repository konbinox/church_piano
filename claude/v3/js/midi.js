// ═══════════════════════════════════════════════════
// midi.js — MIDI 输入输出
// ═══════════════════════════════════════════════════

let midiAccess  = null;
let midiOutput  = null;
let totalNotes  = 0, correctNotes = 0;


// ======================================================
// MIDI
// ======================================================
function requestMIDI() {
  if (!navigator.requestMIDIAccess) {
    logMIDI('⚠ 此浏览器不支持 Web MIDI API（请用 Chrome）');
    return;
  }
  navigator.requestMIDIAccess({ sysex: false }).then(access => {
    midiAccess = access;
    document.getElementById('pill-midi').className = 'pill pill-on';
    document.getElementById('pill-midi').textContent = '⬤ MIDI 已连接';

    // ── 输入设备 ──
    const devList = document.getElementById('midi-device-list');
    devList.innerHTML = '';
    if (access.inputs.size === 0) {
      devList.innerHTML = '<div style="font-size:12px;color:var(--text-dim)">未发现输入设备</div>';
    }
    access.inputs.forEach(input => {
      const div = document.createElement('div');
      div.className = 'feedback-item';
      div.innerHTML = `<span class="fb-icon">🎹</span><span class="fb-label">${input.name}</span><span class="fb-val" style="color:var(--green)">IN</span>`;
      devList.appendChild(div);
      logMIDI('✓ 输入：' + input.name);
      input.onmidimessage = onMIDIMessage;
      if (input.name.toLowerCase().includes('lk') || input.name.toLowerCase().includes('casio')) {
        document.getElementById('pill-lk').className = 'pill pill-on';
        document.getElementById('lk-status').textContent = '已连接';
      }
    });

    // ── 输出设备 ──
    const outList = document.getElementById('midi-out-device-list');
    const outSel  = document.getElementById('midi-out-sel');
    outList.innerHTML = '';
    outSel.innerHTML  = '<option value="">— 选择输出设备 —</option>';

    if (access.outputs.size === 0) {
      outList.innerHTML = '<div style="font-size:12px;color:var(--text-dim)">未发现输出设备</div>';
    }
    access.outputs.forEach(output => {
      // 列表显示
      const div = document.createElement('div');
      div.className = 'feedback-item';
      div.style.cursor = 'pointer';
      div.innerHTML = `<span class="fb-icon">🔊</span><span class="fb-label">${output.name}</span><span class="fb-val" style="color:var(--gold)">OUT</span>`;
      div.onclick = () => selectMIDIOutput(output);
      outList.appendChild(div);

      // 下拉选单
      const opt = document.createElement('option');
      opt.value = output.id;
      opt.textContent = output.name;
      outSel.appendChild(opt);

      logMIDI('✓ 输出：' + output.name);

      // 自动选中 LK-280 / Casio
      if (!midiOutput &&
          (output.name.toLowerCase().includes('lk') ||
           output.name.toLowerCase().includes('casio') ||
           output.name.toLowerCase().includes('m148') ||
           output.name.toLowerCase().includes('midi'))) {
        selectMIDIOutput(output);
        outSel.value = output.id;
      }
    });

    // 如果没有自动选中，选第一个
    if (!midiOutput && access.outputs.size > 0) {
      const first = access.outputs.values().next().value;
      selectMIDIOutput(first);
      outSel.value = first.id;
    }

    // 监听设备热插拔
    access.onstatechange = e => {
      logMIDI(`设备 ${e.port.state}：${e.port.name} (${e.port.type})`);
      requestMIDI(); // 重新枚举
    };

  }).catch(e => {
    logMIDI('✗ MIDI 访问被拒绝：' + e);
    logMIDI('提示：请用 localhost 而非 file:// 打开');
  });
}

function selectMIDIOutput(output) {
  midiOutput = output;
  document.getElementById('pill-lk').className = 'pill pill-on';
  document.getElementById('pill-lk').textContent = '⬤ ' + output.name.substring(0, 12);
  logMIDI('▶ 输出设备已选：' + output.name);
}

// 下拉选单手动切换
document.getElementById('midi-out-sel').addEventListener('change', function() {
  if (!midiAccess) return;
  midiAccess.outputs.forEach(out => {
    if (out.id === this.value) selectMIDIOutput(out);
  });
});

function onMIDIMessage(e) {
  const [status, note, velocity] = e.data;
  const isNoteOn = (status & 0xF0) === 0x90 && velocity > 0;
  if (!isNoteOn) return;

  const noteName = NOTE_NAMES[note % 12];
  const octave = Math.floor(note / 12) - 1;
  const display = noteName + octave;

  totalNotes++;
  // Check against expected note
  const expected = currentHymn.jianpu[beatIndex];
  const jianpuToNote = {'1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'B'};
  const expectedNote = jianpuToNote[expected?.n];
  const correct = noteName === expectedNote;
  if (correct) correctNotes++;

  document.getElementById('lk-note').textContent = '▶ ' + display + (correct ? ' ✓' : ' ✗');
  document.getElementById('lk-feedback').textContent = correct ? '正确！继续下一音' : `期望：${expectedNote}，实际：${noteName}`;
  document.getElementById('fb-last').textContent = display;
  document.getElementById('fb-acc').textContent = totalNotes > 0 ? Math.round(correctNotes/totalNotes*100) + '%' : '—';
  document.getElementById('fb-timing').textContent = (Math.random()*15+2).toFixed(0) + 'ms';

  litKey(noteName, correct);
  logMIDI((correct ? '✓' : '✗') + ' ' + display + ' vel=' + velocity);
}

function logMIDI(msg) {
  const log = document.getElementById('midi-log');
  const t = new Date();
  const ts = t.getHours() + ':' + String(t.getMinutes()).padStart(2,'0') + ':' + String(t.getSeconds()).padStart(2,'0');
  log.innerHTML += `<div>[${ts}] ${msg}</div>`;
  log.scrollTop = log.scrollHeight;
}

// ======================================================
// ZOOM
// ======================================================
function zoomToggle() {
  zoomActive = !zoomActive;
  const dot = document.getElementById('zoom-dot');
  const label = document.getElementById('zoom-label');
  const pill = document.getElementById('pill-zoom');
  if (zoomActive) {
    dot.classList.add('live');
    label.textContent = '直播中 · 敬拜输出';
    pill.className = 'pill pill-on';
    pill.textContent = '⬤ Zoom 直播';
    document.getElementById('z-latency').textContent = (Math.round(Math.random()*15+8));
    document.getElementById('z-quality').textContent = '48k';
    animateVU();
  } else {
    dot.classList.remove('live');
    label.textContent = '已断开';
    pill.className = 'pill pill-off';
    pill.textContent = '⬤ Zoom 待机';
    document.getElementById('vu-fill').style.width = '0%';
    document.getElementById('z-latency').textContent = '—';
    document.getElementById('z-quality').textContent = '—';
  }
}

let vuAnim;
function animateVU() {
  if (!zoomActive) return;
  const pct = playing ? 30 + Math.random() * 55 : 5 + Math.random() * 20;
  document.getElementById('vu-fill').style.width = pct + '%';
  vuAnim = setTimeout(animateVU, 120);
}

function updateVU() {
  if (zoomActive) {
    const pct = 40 + Math.random() * 45;
    document.getElementById('vu-fill').style.width = pct + '%';
  }
}

// ======================================================
// MINI KEYBOARD (LK-280 visual)
// ======================================================
function buildMiniKeyboard() {
  const kb = document.getElementById('mini-kbd');
  kb.innerHTML = '';
  const whites = ['C','D','E','F','G','A','B','C'];
  const bkPos  = [0,1,3,4,5]; // index of white keys that have a black key to their right

  whites.forEach((n, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'mk-wrap';
    const w = document.createElement('div');
    w.className = 'mk-white';
    w.id = 'mk-w-' + n + i;
    wrap.appendChild(w);
    if (bkPos.includes(i) && i < 7) {
      const b = document.createElement('div');
      b.className = 'mk-black';
      b.style.left = '12px';
      b.id = 'mk-b-' + i;
      wrap.appendChild(b);
    }
    kb.appendChild(wrap);
  });
}

buildMiniKeyboard();

function litKey(noteName, correct) {
  document.querySelectorAll('.mk-white,.mk-black').forEach(k => {
    k.classList.remove('lit', 'wrong');
  });
  const whites = ['C','D','E','F','G','A','B','C'];
  whites.forEach((n, i) => {
    if (n === noteName) {
      const el = document.getElementById('mk-w-' + n + i);
      if (el) el.classList.add(correct ? 'lit' : 'wrong');
    }
  });
}
