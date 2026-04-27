// 乐谱渲染模块
function renderJianpu() {
  const row = document.getElementById('jianpu-row');
  if (!row || !currentHymn) return;
  row.innerHTML = '';
  currentHymn.jianpu.forEach((beat, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'jianpu-beat';
    wrap.id = `jp-${i}`;
    const chordDiv = document.createElement('div');
    chordDiv.className = 'jianpu-chord';
    chordDiv.textContent = beat.chord || '';
    const numDiv = document.createElement('div');
    numDiv.className = `jianpu-num${beat.oct === 1 ? ' dot-above' : ''}`;
    numDiv.textContent = beat.n;
    wrap.appendChild(chordDiv);
    wrap.appendChild(numDiv);
    row.appendChild(wrap);
  });
}

function drawStaff() {
  const canvas = document.getElementById('staff-canvas');
  if (!canvas || !currentHymn) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 160;
  ctx.fillStyle = '#0c1218';
  ctx.fillRect(0, 0, canvas.width, 160);
  
  // 画五线谱线条
  for (let line = 0; line < 5; line++) {
    ctx.beginPath();
    ctx.moveTo(40, 35 + line * 12);
    ctx.lineTo(canvas.width - 20, 35 + line * 12);
    ctx.strokeStyle = '#2a4a3a';
    ctx.stroke();
  }
  
  // 画音符
  let x = 60;
  const step = (canvas.width - 80) / currentHymn.jianpu.length;
  currentHymn.jianpu.forEach((beat, i) => {
    ctx.fillStyle = i === beatIndex ? '#3ddc84' : '#8ab4a0';
    ctx.beginPath();
    ctx.ellipse(x, 45, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    x += step;
  });
}

function drawPianoRoll() {
  const canvas = document.getElementById('piano-roll-canvas');
  if (!canvas || !currentHymn) return;
  canvas.width = canvas.offsetWidth || 500;
  canvas.height = canvas.offsetHeight || 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080c10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const w = canvas.width / currentHymn.jianpu.length;
  currentHymn.jianpu.forEach((beat, i) => {
    const x = i * w;
    ctx.fillStyle = i === beatIndex ? '#3ddc84' : '#2a4a3a';
    ctx.fillRect(x + 2, canvas.height - 50, w - 4, 35);
    if (beat.chord) {
      ctx.fillStyle = '#f0b429';
      ctx.font = '11px monospace';
      ctx.fillText(beat.chord, x + 4, canvas.height - 12);
    }
  });
  
  // 播放头
  const playX = (beatIndex / currentHymn.jianpu.length) * canvas.width;
  ctx.strokeStyle = '#3ddc84';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playX, 0);
  ctx.lineTo(playX, canvas.height);
  ctx.stroke();
}

function updateChordOverlay(idx) {
  let chord = '';
  for (let i = idx; i >= 0; i--) {
    if (currentHymn?.jianpu[i]?.chord) {
      chord = currentHymn.jianpu[i].chord;
      break;
    }
  }
  const overlay = document.getElementById('chord-overlay');
  if (overlay) {
    overlay.innerHTML = chord ? `<div class="chord-badge"><div class="chord-root">${chord}</div></div>` : '';
  }
}

function renderChordProg() {
  const container = document.getElementById('chord-prog');
  if (!container || !currentHymn) return;
  container.innerHTML = '';
  const chords = [...new Set(currentHymn.jianpu.map(b => b.chord).filter(Boolean))];
  chords.forEach(ch => {
    const div = document.createElement('div');
    div.textContent = ch;
    container.appendChild(div);
  });
  const analysisDiv = document.getElementById('chord-analysis');
  if (analysisDiv) analysisDiv.innerHTML = currentHymn.analysis || '';
}

function buildChordDetail() {
  const area = document.getElementById('chord-detail-area');
  if (!area || !currentHymn) return;
  area.innerHTML = '';
  const chords = [...new Set(currentHymn.jianpu.map(b => b.chord).filter(Boolean))];
  chords.forEach(ch => {
    const v = CHORD_VOICING[ch] || CHORD_VOICING['C'];
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const card = document.createElement('div');
    card.className = 'chord-card';
    card.innerHTML = `
      <div class="name">${ch}</div>
      <div class="notes">${v.notes.map(n => `<span>${notes[n % 12]}</span>`).join('')}</div>
      <div style="font-size: 13px; margin-top: 8px;">${v.lh} · ${v.rh}</div>
    `;
    area.appendChild(card);
  });
}

window.addEventListener('beat', (e) => {
  drawStaff();
  drawPianoRoll();
  updateChordOverlay(e.detail.beatIndex);
});
