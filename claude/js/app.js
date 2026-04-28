// ═══════════════════════════════════════════════════
// app.js — 应用初始化与主控制
// v3: 修复 currentStyle 重复声明；曲库改顶部下拉
// ═══════════════════════════════════════════════════

let currentStyle = 'block'; // block | arpeggio | rhythm
let zoomActive   = false;

// ======================================================
// 弹法切换
// ======================================================
function setStyle(s) {
  currentStyle = s;
  document.querySelectorAll('.style-btn').forEach(el => {
    const isActive = el.id === 'sb-' + s;
    el.style.background   = isActive ? 'rgba(0,212,255,0.08)' : 'transparent';
    el.style.borderColor  = isActive ? 'rgba(0,212,255,0.3)'  : 'var(--border2)';
    el.style.color        = isActive ? 'var(--accent)'        : 'var(--text-dim)';
  });
  const hints = {
    block:    '左手：根音单音\n右手：三音柱式，整拍同时按下\n效果：庄重稳定，适合圣餐、祷告',
    arpeggio: '左手：根音\n右手：根→三→五→三 逐音弹出\n效果：流动如水，类似二胡线性思维\n示例：G→B→D→B→G→B→D→B',
    rhythm:   '左手：根音（第1拍）\n右手：和弦（第2拍）+ 和弦（第3+4拍）\n节奏：咚 · 哒 · 哒\n效果：有律动感，适合敬拜赞美',
  };
  document.getElementById('style-hint').style.whiteSpace = 'pre-wrap';
  document.getElementById('style-hint').textContent = hints[s];

  // 三一颂自动调整 BPM
  const bpms = { block: 60, arpeggio: 72, rhythm: 80 };
  if (currentHymn && currentHymn.name && currentHymn.name.includes('三一颂')) {
    bpm = bpms[s];
    document.getElementById('bpm-range').value = bpm;
    document.getElementById('bpm-display').textContent = bpm;
  }
}

// ======================================================
// 加载曲目（核心）
// ======================================================
function loadHymn(id) {
  currentHymn = HYMNS[id];
  if (!currentHymn) return;

  // 更新左侧列表高亮（兼容旧侧边栏，如果存在）
  document.querySelectorAll('.hymn-item').forEach(el => el.classList.remove('active'));
  document.getElementById('h-' + id)?.classList.add('active');

  // 同步顶部下拉选中值
  const sel = document.getElementById('hymn-select-top');
  if (sel) sel.value = id;

  bpm = currentHymn.bpm;
  document.getElementById('bpm-range').value = bpm;
  document.getElementById('bpm-display').textContent = bpm;

  const keyMap = { G:'G', C:'C', F:'F', Bb:'Bb', D:'D', Eb:'Eb' };
  document.getElementById('key-sel').value = keyMap[currentHymn.key] || 'G';

  // 三一颂显示弹法面板
  const isDoxology = id === 'doxology';
  const stylePanel = document.getElementById('style-panel');
  if (stylePanel) stylePanel.style.display = isDoxology ? 'block' : 'none';

  renderJianpu();
  renderChordProg();
  drawStaff();
  drawPianoRoll();
  updateChordOverlay(0);
  stopPlayback();
  beatIndex = 0;

  // 和弦分析文字
  const analysis = currentHymn.analysis || '';
  const hint = currentHymn.styleHint ? '\n\n手型提示：\n' + currentHymn.styleHint : '';
  const el = document.getElementById('chord-analysis');
  if (el) {
    el.style.whiteSpace = 'pre-wrap';
    el.textContent = analysis + hint;
  }

  buildChordDetail();
}

// ======================================================
// Tab 切换
// ======================================================
function switchTab(id) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    const ids = ['score', 'midi', 'chord', 'practice'];
    t.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.getElementById('tab-' + id)?.classList.add('active');

  if (id === 'chord')    buildChordDetail();
  if (id === 'practice') {
    buildPracChordRow();
    const firstChord = currentHymn.chords?.[0] || 'C';
    setTimeout(() => updatePracDisplay(firstChord), 50);
  }
  if (id === 'score') setTimeout(resizeCanvases, 50);
}

// ======================================================
// Zoom 状态
// ======================================================
function zoomToggle() {
  zoomActive = !zoomActive;
  const dot   = document.getElementById('zoom-dot');
  const label = document.getElementById('zoom-label');
  const pill  = document.getElementById('pill-zoom');
  if (zoomActive) {
    dot.classList.add('live');
    label.textContent = '直播中 · 敬拜输出';
    pill.className    = 'pill pill-on';
    pill.textContent  = '⬤ Zoom 直播';
    document.getElementById('z-latency').textContent = Math.round(Math.random() * 15 + 8);
    document.getElementById('z-quality').textContent = '48k';
    animateVU();
  } else {
    dot.classList.remove('live');
    label.textContent = '已断开';
    pill.className    = 'pill pill-off';
    pill.textContent  = '⬤ Zoom 待机';
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
    document.getElementById('vu-fill').style.width = (40 + Math.random() * 45) + '%';
  }
}

// ======================================================
// Canvas 自适应
// ======================================================
function resizeCanvases() {
  const sc = document.getElementById('staff-canvas');
  if (sc) {
    sc.width = sc.parentElement.clientWidth || 800;
    drawStaff();
  }
  const prc = document.getElementById('piano-roll-canvas');
  if (prc) {
    prc.width  = prc.parentElement.clientWidth  || 800;
    prc.height = prc.parentElement.clientHeight || 320;
    drawPianoRoll();
  }
}

window.addEventListener('resize', resizeCanvases);

// ======================================================
// 顶部曲库下拉：动态构建
// ======================================================
function buildHymnDropdown() {
  const sel = document.getElementById('hymn-select-top');
  if (!sel || typeof HYMNS === 'undefined') return;

  // 分组定义
  const groups = [
    {
      label: '★ 本次作业',
      keys:  ['jesuslovesC', 'jesuslovesF', 'jesuslovesG', 'doxology'],
    },
    {
      label: '其他曲目',
      keys:  ['amazing', 'father', 'gloria', 'holy', 'itiswell', 'joyful'],
    },
  ];

  sel.innerHTML = '';
  groups.forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.keys.forEach(k => {
      if (!HYMNS[k]) return;
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = HYMNS[k].name + '　' + (HYMNS[k].key || '') + '调';
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });

  sel.addEventListener('change', () => loadHymn(sel.value));
}

// ======================================================
// MIDI 自动连接
// ======================================================
function initMIDI() {
  if (!navigator.requestMIDIAccess) return;
  navigator.requestMIDIAccess({ sysex: false }).then(access => {
    midiAccess = access;
    if (access.inputs.size > 0 || access.outputs.size > 0) {
      document.getElementById('pill-midi').className    = 'pill pill-on';
      document.getElementById('pill-midi').textContent  = '⬤ MIDI 已连接';
      access.inputs.forEach(input => {
        input.onmidimessage = onMIDIMessage;
        logMIDI('自动 IN：' + input.name);
      });
      const outSel = document.getElementById('midi-out-sel');
      if (outSel) {
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
    }
  }).catch(() => {});
}

// ======================================================
// 初始化入口
// ======================================================
window.addEventListener('load', function () {
  // 1. 构建顶部下拉曲库
  buildHymnDropdown();

  // 2. 加载默认曲目
  loadHymn('jesuslovesC');

  // 3. 等 flex 布局完毕再设置 canvas 尺寸
  requestAnimationFrame(() => {
    setTimeout(resizeCanvases, 80);
  });

  // 4. MIDI 自动连接
  initMIDI();
});
