// UI 交互（标签切换、Zoom、节拍器）
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');
}

function zoomToggle() {
  const zoomActive = document.getElementById('zoom-dot').classList.toggle('live');
  const pill = document.getElementById('pill-zoom');
  pill.className = zoomActive ? 'pill pill-on' : 'pill pill-off';
  pill.textContent = zoomActive ? '⬤ Zoom 直播' : '⬤ Zoom 待机';
}

function toggleMetronome() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, 0);
  gain.gain.exponentialRampToValueAtTime(0.001, 0.1);
  osc.start();
  osc.stop(0.1);
}
