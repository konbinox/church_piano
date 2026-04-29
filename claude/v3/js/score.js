// ═══════════════════════════════════════════════════
// score.js — 乐谱显示（五线谱 + 简谱 + 钢琴卷帘）
// ═══════════════════════════════════════════════════

// ======================================================
// JIANPU RENDER
// ======================================================
function renderJianpu() {
  const row = document.getElementById('jianpu-row');
  row.innerHTML = '';
  currentHymn.jianpu.forEach((beat, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'jianpu-beat';
    wrap.id = 'jp-' + i;

    const chord = document.createElement('div');
    chord.className = 'jianpu-chord';
    chord.textContent = beat.chord || '';

    const num = document.createElement('div');
    num.className = 'jianpu-num' + (beat.oct === 1 ? ' dot-above' : beat.oct === -1 ? ' dot-below' : '');
    num.textContent = beat.n;

    const dur = document.createElement('div');
    dur.className = 'jianpu-dur';
    if (beat.dur >= 6) dur.textContent = '—';
    else if (beat.dur >= 4) dur.textContent = '';
    else dur.textContent = '·';

    wrap.appendChild(chord);
    wrap.appendChild(num);
    wrap.appendChild(dur);
    row.appendChild(wrap);
  });
}

// ======================================================
// STAFF CANVAS (simplified 5-line staff with notes)
// ======================================================
function drawStaff() {
  const canvas = document.getElementById('staff-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = 160 * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const W = canvas.offsetWidth, H = 160;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0c1218';
  ctx.fillRect(0, 0, W, H);

  const staffTop = 30, lineGap = 12;

  // Treble clef area label
  ctx.fillStyle = '#3a5a4a';
  ctx.font = '10px Share Tech Mono';
  ctx.fillText('高音谱表', 10, 14);

  // Bass clef label
  ctx.fillText('低音谱表', 10, H/2 + 14);

  // Draw 5 staff lines × 2 (treble + bass)
  for (let staff = 0; staff < 2; staff++) {
    const top = staff === 0 ? staffTop : H/2 + staffTop - 10;
    for (let l = 0; l < 5; l++) {
      const y = top + l * lineGap;
      ctx.strokeStyle = staff === beatIndex % 2 ? '#2a4a3a' : '#1a2a24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }
  }

  // Draw bar lines
  const numBeats = currentHymn.jianpu.length;
  const beatsPerMeasure = currentHymn.time === '3/4' ? 3 : 4;
  const numMeasures = Math.ceil(numBeats / beatsPerMeasure);
  const measureWidth = (W - 60) / numMeasures;

  for (let m = 0; m <= numMeasures; m++) {
    const x = 40 + m * measureWidth;
    ctx.strokeStyle = '#2d4a3a';
    ctx.lineWidth = m === 0 || m === numMeasures ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, staffTop);
    ctx.lineTo(x, staffTop + 4 * lineGap);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, H/2 + staffTop - 10);
    ctx.lineTo(x, H/2 + staffTop - 10 + 4 * lineGap);
    ctx.stroke();
  }

  // Draw note heads (simplified — map jianpu to approximate Y positions)
  const noteYMap = { '1': 4, '2': 3.5, '3': 3, '4': 2.5, '5': 2, '6': 1.5, '7': 1 };
  let xPos = 60;
  const beatWidth = (W - 80) / numBeats;

  currentHymn.jianpu.forEach((beat, i) => {
    const base = noteYMap[beat.n] || 3;
    const yOffset = (base - (beat.oct === 1 ? 3.5 : 3)) * lineGap;
    const y = staffTop + yOffset * (beat.oct === 1 ? 0.7 : 1);

    const isActive = (i === beatIndex);
    ctx.fillStyle = isActive ? '#3ddc84' : '#8ab4a0';
    if (isActive) ctx.shadowBlur = 8, ctx.shadowColor = '#3ddc84';
    else ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.ellipse(xPos, y, 5, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = isActive ? '#3ddc84' : '#5a8a70';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(xPos + 5, y);
    ctx.lineTo(xPos + 5, y - 20);
    ctx.stroke();

    xPos += beatWidth;
  });

  ctx.shadowBlur = 0;
}

// ======================================================
// PIANO ROLL
// ======================================================
function drawPianoRoll() {
  const canvas = document.getElementById('piano-roll-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 400;
  canvas.height = canvas.offsetHeight || 200;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#080c10';
  ctx.fillRect(0, 0, W, H);

  const noteMap = { '1':0,'2':2,'3':4,'4':5,'5':7,'6':9,'7':11 };
  const numNotes = currentHymn.jianpu.length;
  const noteW = Math.max(20, (W * 0.8) / numNotes);
  const pitchRange = 24;
  const pitchBase = 48;

  // grid lines
  for (let p = 0; p < pitchRange; p++) {
    const y = H - (p / pitchRange) * H;
    ctx.strokeStyle = p % 12 === 0 ? '#1a2a1a' : '#111820';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // playhead
  const playX = (beatIndex / numNotes) * W;
  ctx.strokeStyle = '#3ddc84';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6; ctx.shadowColor = '#3ddc84';
  ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, H); ctx.stroke();
  ctx.shadowBlur = 0;

  currentHymn.jianpu.forEach((beat, i) => {
    const pitch = (noteMap[beat.n] || 0) + (beat.oct === 1 ? 12 : 0);
    const x = (i / numNotes) * W;
    const y = H - ((pitch + 2) / pitchRange) * H;
    const h = Math.max(6, H / pitchRange - 2);
    const isActive = i === beatIndex;

    ctx.fillStyle = isActive ? '#3ddc84' : (beat.chord ? '#4a7a5a' : '#2a4a3a');
    if (isActive) { ctx.shadowBlur = 10; ctx.shadowColor = '#3ddc84'; }
    ctx.fillRect(x + 1, y, noteW - 2, h);
    ctx.shadowBlur = 0;

    if (beat.chord) {
      ctx.fillStyle = '#8a6020';
      ctx.font = '9px Share Tech Mono';
      ctx.fillText(beat.chord, x + 2, H - 4);
    }
  });
}

// ======================================================
// CHORD OVERLAY
// ======================================================
function updateChordOverlay(idx) {
  const beat = currentHymn.jianpu[idx];
  if (!beat) return;
  const overlay = document.getElementById('chord-overlay');

  // Find last chord up to idx
  let chord = '', fn = '';
  for (let i = idx; i >= 0; i--) {
    if (currentHymn.jianpu[i].chord) { chord = currentHymn.jianpu[i].chord; fn = currentHymn.jianpu[i].fn; break; }
  }

  if (!chord) { overlay.innerHTML = ''; return; }

  const root = chord.replace('m','').replace('7','').replace('maj','');
  const qual = chord.includes('m') && !chord.includes('maj') ? 'm' : chord.includes('7') ? '7' : '';

  overlay.innerHTML = `
    <div class="chord-badge">
      <div class="chord-root">${root}</div>
      <div><div class="chord-qual">${qual}</div><div class="chord-fn">${fn}</div></div>
    </div>`;

  // Highlight chord prog
  document.querySelectorAll('.cp-chord').forEach(el => {
    el.classList.toggle('current', el.dataset.chord === chord);
  });
}

// ======================================================
// CHORD PROGRESSION PANEL
// ======================================================
function renderChordProg() {
  const el = document.getElementById('chord-prog');
  el.innerHTML = '';
  const seen = new Set();
  currentHymn.jianpu.forEach(beat => {
    if (beat.chord && !seen.has(beat.chord)) {
      seen.add(beat.chord);
      const div = document.createElement('div');
      div.className = 'cp-chord';
      div.dataset.chord = beat.chord;
      div.textContent = beat.chord;
      el.appendChild(div);
    }
  });
  document.getElementById('chord-analysis').textContent = currentHymn.analysis;
}

// ======================================================
// CHORD DETAIL VIEW
// ======================================================
function buildChordDetail() {
  const area = document.getElementById('chord-detail-area');
  area.innerHTML = '';
  const seen = new Set();
  currentHymn.jianpu.forEach(beat => {
    if (!beat.chord || seen.has(beat.chord)) return;
    seen.add(beat.chord);

    const CHORD_NOTES = {
      'C':['C','E','G'], 'G':['G','B','D'], 'F':['F','A','C'],
      'D':['D','F#','A'], 'Bb':['Bb','D','F'], 'Eb':['Eb','G','Bb'],
      'Am':['A','C','E'], 'Dm':['D','F','A'], 'Em':['E','G','B'],
      'Bm':['B','D','F#'], 'A':['A','C#','E'], 'Cm':['C','Eb','G'],
      'C7':['C','E','G','Bb'], 'G7':['G','B','D','F'],
      'F7':['F','A','C','Eb'], 'D7':['D','F#','A','C'],
    };

    const notes = CHORD_NOTES[beat.chord] || [beat.chord];
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface);border:1px solid var(--border);padding:14px;border-radius:2px';
    card.innerHTML = `
      <div style="font-family:'Libre Baskerville',serif;font-size:22px;color:var(--gold);margin-bottom:8px">${beat.chord}</div>
      <div style="font-size:11px;color:var(--text-dim);font-family:'Share Tech Mono',monospace;letter-spacing:1px;margin-bottom:8px">${beat.fn || ''}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${notes.map(n=>`<span style="padding:3px 8px;background:rgba(61,220,132,0.08);border:1px solid var(--green-dim);border-radius:1px;font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--green)">${n}</span>`).join('')}
      </div>
      <div style="margin-top:10px;font-size:10px;color:var(--text-dim);font-family:'Share Tech Mono',monospace;line-height:1.7">
        ${getChordHint(beat.chord)}
      </div>`;
    area.appendChild(card);
  });
}

function getChordHint(chord) {
  const hints = {
    'G':'根音G在低音区，用G-D-G织体', 'C':'清澈主和弦，常作落脚点',
    'D':'大调属和弦，推向G解决', 'F':'下属和弦，增加柔和色彩',
    'Bb':'降七度色彩，需熟悉黑键位置', 'Eb':'常配Bb大调，丰满织体',
    'Am':'关系小调，增加深沉感', 'Dm':'F大调的vi，自然小调',
    'Em':'G大调的vi', 'Bm':'D大调的vi',
    'F7':'属七和弦，强烈推进感', 'G7':'属七，向C解决',
  };
  return hints[chord] || '练习根音→五度→八度分解模式';
}

// ======================================================
// CANVAS RESIZE
// ======================================================
window.addEventListener('resize', () => {
  drawStaff();
  drawPianoRoll();
});
