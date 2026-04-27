<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #060a0f; overflow-x: auto; overflow-y: hidden; }
canvas { display: block; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const WW = 24, BW = 15, WH = 100, BH = 62;
const START = 36, END = 96;
const BLACK = new Set([1, 3, 6, 8, 10]);
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let rootNotes = [], chordNotes = [], lhNote = -1;

function getLayout() {
  const L = [];
  let wx = 0;
  for (let m = START; m <= END; m++) {
    const pc = m % 12;
    const isB = BLACK.has(pc);
    if (isB) {
      L.push({ m, isB: true, x: wx - BW / 2 });
    } else {
      L.push({ m, isB: false, x: wx });
      wx += WW;
    }
  }
  return L;
}

const layout = getLayout();
const totalW = layout.filter(k => !k.isB).length * WW;

function draw() {
  const c = document.getElementById('c');
  c.width = totalW;
  c.height = WH + 10;
  c.style.width = totalW + 'px';
  const ctx = c.getContext('2d');
  
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, 0, totalW, WH + 10);
  
  // 白键
  layout.filter(k => !k.isB).forEach(k => {
    const isLH = lhNote === k.m;
    const isR = rootNotes.includes(k.m);
    const isC = chordNotes.includes(k.m);
    const g = ctx.createLinearGradient(k.x, 0, k.x, WH);
    if (isLH) { g.addColorStop(0, '#4a9eff'); g.addColorStop(1, '#1a5aaa'); }
    else if (isR) { g.addColorStop(0, '#f0b429'); g.addColorStop(1, '#c08010'); }
    else if (isC) { g.addColorStop(0, '#3ddc84'); g.addColorStop(1, '#1a8a4a'); }
    else { g.addColorStop(0, '#d8d8d8'); g.addColorStop(1, '#f0f0f0'); }
    ctx.fillStyle = g;
    ctx.fillRect(k.x, 0, WW - 1, WH);
    ctx.strokeStyle = '#888';
    ctx.strokeRect(k.x + 0.5, 0.5, WW - 1.5, WH - 0.5);
    
    const pc = k.m % 12;
    const oct = Math.floor(k.m / 12) - 1;
    if (pc === 0 || isLH || isR || isC) {
      ctx.fillStyle = (isLH || isR || isC) ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pc === 0 ? `C${oct}` : NAMES[pc], k.x + WW / 2, WH - 6);
    }
  });
  
  // 黑键
  layout.filter(k => k.isB).forEach(k => {
    const isLH = lhNote === k.m;
    const isR = rootNotes.includes(k.m);
    const isC = chordNotes.includes(k.m);
    const g = ctx.createLinearGradient(k.x, 0, k.x, BH);
    if (isLH) { g.addColorStop(0, '#4a9eff'); g.addColorStop(1, '#0a3070'); }
    else if (isR) { g.addColorStop(0, '#c08010'); g.addColorStop(1, '#7a4000'); }
    else if (isC) { g.addColorStop(0, '#1a8a4a'); g.addColorStop(1, '#0a4020'); }
    else { g.addColorStop(0, '#222'); g.addColorStop(1, '#444'); }
    ctx.fillStyle = g;
    ctx.fillRect(k.x, 0, BW, BH);
  });
}

// 点击事件
document.addEventListener('click', e => {
  const c = document.getElementById('c');
  const rect = c.getBoundingClientRect();
  const sx = c.width / rect.width;
  const cx = (e.clientX - rect.left) * sx;
  const cy = (e.clientY - rect.top) * (c.height / rect.height);
  let hit = null;
  for (const k of layout) {
    if (k.isB && cx >= k.x && cx <= k.x + BW && cy <= BH) { hit = k; break; }
  }
  if (!hit) {
    for (const k of layout) {
      if (!k.isB && cx >= k.x && cx <= k.x + WW && cy <= WH) { hit = k; break; }
    }
  }
  if (hit) window.parent.postMessage({ type: 'kb61click', midi: hit.m }, '*');
});

// 接收和弦更新
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'kb61update') {
    rootNotes = e.data.rootNotes || [];
    chordNotes = e.data.chordNotes || [];
    lhNote = e.data.lhNote ?? -1;
    draw();
  }
});

draw();
window.parent.postMessage({ type: 'kb61ready' }, '*');
</script>
</body>
</html>
