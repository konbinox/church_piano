// UI 交互模块
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  if (tabId === 'chord') buildChordDetail();
  if (tabId === 'practice') {
    setTimeout(() => updatePracDisplay(currentHymn?.chords?.[0] || 'C'), 50);
  }
  if (tabId === 'score') {
    setTimeout(() => { drawStaff(); drawPianoRoll(); }, 50);
  }
}

let zoomActive = false;
let vuTimer = null;

function zoomToggle() {
  zoomActive = !zoomActive;
  const dot = document.getElementById('zoom-dot');
  const pill = document.getElementById('pill-zoom');
  if (zoomActive) {
    dot.classList.add('live');
    pill.className = 'pill pill-on';
    pill.textContent = '📹 Zoom 直播';
    if (vuTimer) clearInterval(vuTimer);
    vuTimer = setInterval(() => {
      if (zoomActive) {
        const vu = document.getElementById('vu-fill');
        if (vu) vu.style.width = playing ? (30 + Math.random() * 50) + '%' : (5 + Math.random() * 15) + '%';
      }
    }, 200);
  } else {
    dot.classList.remove('live');
    pill.className = 'pill pill-off';
    pill.textContent = '📹 Zoom 待机';
    if (vuTimer) clearInterval(vuTimer);
    const vu = document.getElementById('vu-fill');
    if (vu) vu.style.width = '0%';
  }
}

function toggleMetronome() {
  initAudio();
  playClick(true);
  setTimeout(() => playClick(false), (60 / bpm) * 500);
}
