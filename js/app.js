// ═══════════════════════════════════════════════════
// app.js — 应用初始化与主控制
// ═══════════════════════════════════════════════════

let currentStyle = 'block';
let zoomActive   = false;

// ======================================================
// LOAD HYMN
// ======================================================
let currentStyle = 'block'; // block | arpeggio | rhythm

function setStyle(s) {
  currentStyle = s;
  document.querySelectorAll('.style-btn').forEach(el => {
    const isActive = el.id === 'sb-' + s;
    el.style.background = isActive ? 'rgba(0,212,255,0.08)' : 'transparent';
    el.style.borderColor = isActive ? 'rgba(0,212,255,0.3)' : 'var(--border2)';
    el.style.color = isActive ? 'var(--accent)' : 'var(--text-dim)';
  });
  const hints = {
    block:    '左手：根音单音\n右手：三音柱式，整拍同时按下\n效果：庄重稳定，适合圣餐、祷告',
    arpeggio: '左手：根音\n右手：根→三→五→三 逐音弹出\n效果：流动如水，类似二胡线性思维\n示例：G→B→D→B→G→B→D→B',
    rhythm:   '左手：根音（第1拍）\n右手：和弦（第2拍）+ 和弦（第3+4拍）\n节奏：咚 · 哒 · 哒\n效果：有律动感，适合敬拜赞美',
  };
  document.getElementById('style-hint').style.whiteSpace = 'pre-wrap';
  document.getElementById('style-hint').textContent = hints[s];

  // 调整播放BPM
  const bpms = { block: 60, arpeggio: 72, rhythm: 80 };
  if (currentHymn.name.includes('三一颂')) {
    bpm = bpms[s];
    document.getElementById('bpm-range').value = bpm;
    document.getElementById('bpm-display').textContent = bpm;
  }
}

function loadHymn(id) {
  currentHymn = HYMNS[id];
  document.querySelectorAll('.hymn-item').forEach(el => el.classList.remove('active'));
  document.getElementById('h-' + id)?.classList.add('active');

  bpm = currentHymn.bpm;
  document.getElementById('bpm-range').value = bpm;
  document.getElementById('bpm-display').textContent = bpm;

  const keyMap = {G:'G',C:'C',F:'F',Bb:'Bb',D:'D',Eb:'Eb'};
  document.getElementById('key-sel').value = keyMap[currentHymn.key] || 'G';

  // 显示/隐藏弹法面板
  const isDoxology = id === 'doxology';
  document.getElementById('style-panel').style.display = isDoxology ? 'block' : 'none';

  renderJianpu();
  renderChordProg();
  drawStaff();
  drawPianoRoll();
  updateChordOverlay(0);
  stopPlayback();
  beatIndex = 0;

  // 显示分析 + 弹法提示
  const analysis = currentHymn.analysis || '';
  const hint = currentHymn.styleHint ? '\n\n手型提示：\n' + currentHymn.styleHint : '';
  document.getElementById('chord-analysis').style.whiteSpace = 'pre-wrap';
  document.getElementById('chord-analysis').textContent = analysis + hint;

  buildChordDetail();
}

// ======================================================
// TAB SWITCHING (updated)
// ======================================================
function switchTab(id) {
  document.querySelectorAll('.tab').forEach((t,i) => {
    const ids = ['score','midi','chord','practice'];
    t.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.getElementById('tab-' + id)?.classList.add('active');
  if (id === 'chord')    buildChordDetail();
  if (id === 'practice') {
    buildPracChordRow();
    const firstChord = currentHymn.chords?.[0] || 'C';
    // 延迟等 flex 布局算完再渲染键盘
    setTimeout(() => updatePracDisplay(firstChord), 50);
  }
  if (id === 'score') setTimeout(resizeCanvases, 50);
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
// INIT — 等 DOM 完全渲染后再初始化
// ======================================================
window.addEventListener('load', function() {

  // 1. 先加载曲目数据
  loadHymn('jesuslovesC');

  // 2. 等一帧让 flex 布局计算完毕，再设置 canvas 尺寸并绘制
  requestAnimationFrame(() => {
    setTimeout(resizeCanvases, 80);
  });
});

function resizeCanvases() {
  // 五线谱 canvas
  const sc = document.getElementById('staff-canvas');
  if (sc) {
    sc.width  = sc.parentElement.clientWidth  || 800;
    drawStaff();
  }
  // 钢琴卷帘 canvas
  const prc = document.getElementById('piano-roll-canvas');
  if (prc) {
    prc.width  = prc.parentElement.clientWidth  || 800;
    prc.height = prc.parentElement.clientHeight || 320;
    drawPianoRoll();
  }
}

window.addEventListener('resize', resizeCanvases);

// Auto MIDI — inputs + outputs
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess({ sysex: false }).then(access => {
    midiAccess = access;
    if (access.inputs.size > 0 || access.outputs.size > 0) {
      document.getElementById('pill-midi').className = 'pill pill-on';
      document.getElementById('pill-midi').textContent = '⬤ MIDI 已连接';
      access.inputs.forEach(input => {
        input.onmidimessage = onMIDIMessage;
        logMIDI('自动 IN：' + input.name);
      });
      // 自动选输出
      const outSel = document.getElementById('midi-out-sel');
      outSel.innerHTML = '<option value="">— 选择输出设备 —</option>';
      access.outputs.forEach(output => {
        const opt = document.createElement('option');
        opt.value = output.id;
        opt.textContent = output.name;
        outSel.appendChild(opt);
        logMIDI('自动 OUT：' + output.name);
        if (!midiOutput &&
            (output.name.toLowerCase().includes('lk') ||
             output.name.toLowerCase().includes('casio') ||
             output.name.toLowerCase().includes('m148') ||
             output.name.toLowerCase().includes('midi out'))) {
          selectMIDIOutput(output);
          outSel.value = output.id;
        }
      });
      if (!midiOutput && access.outputs.size > 0) {
        const first = access.outputs.values().next().value;
        selectMIDIOutput(first);
        outSel.value = first.id;
      }
    }
  }).catch(()=>{});
}
