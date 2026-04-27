// 乐谱渲染模块
function renderJianpu() {
  const row = document.getElementById('jianpu-row');
  if (!row || !currentHymn) return;
  row.innerHTML = '';
  currentHymn.jianpu.forEach((beat, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'jianpu-beat';
    wrap.id = 'jp-' + i;
    const chordDiv = document.createElement('div');
    chordDiv.className = 'jianpu-chord';
    chordDiv.textContent = beat.chord || '';
    const num = document.createElement('div');
    num.className = 'jianpu-num' + (beat.oct === 1 ? ' dot-above' : '');
    num.textContent = beat.n;
    wrap.appendChild(chordDiv);
    wrap.appendChild(num);
    row.appendChild(wrap);
  });
}

function drawStaff() {
  const canvas = document.getElementById('staff-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 160;
  ctx.fillStyle = '#0c1218';
  ctx.fillRect(0, 0, canvas.width, 160);
  // 画五线谱线条...
  let x = 60;
  currentHymn?.jianpu.forEach((b, i) => {
    ctx.fillStyle = i === beatIndex ? '#3ddc84' : '#8ab4a0';
    ctx.beginPath();
    ctx.ellipse(x, 40, 5, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    x += (canvas.width - 80) / currentHymn.jianpu.length;
  });
}

function drawPianoRoll() { /* 钢琴卷帘渲染 */ }
function updateChordOverlay(idx) { /* 显示当前和弦 */ }
function renderChordProg() { /* 显示和弦进行列表 */ }
function buildChordDetail() { /* 和弦详情卡片 */ }

window.addEventListener('beat', (e) => {
  drawStaff();
  drawPianoRoll();
  updateChordOverlay(e.detail.beatIndex);
});
