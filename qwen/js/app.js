import { PracticePlayer } from './player.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let player = null;
let currentSong = null;

const init = async () => {
  await loadSongs();
  bindEvents();
  loadSong('amazing_grace'); // 預載
};

const loadSongs = async () => {
  const sel = $('#songSelect');
  const songs = ['amazing_grace', 'jesus_loves_you'];
  sel.innerHTML = '<option value="">選擇詩歌...</option>';
  for (const id of songs) {
    try {
      const res = await fetch(`songs/${id}.json`);
      const data = await res.json();
      const opt = document.createElement('option');
      opt.value = data.id;
      opt.textContent = data.title;
      sel.appendChild(opt);
    } catch(e) { console.warn(`載入 ${id} 失敗`, e); }
  }
};

const loadSong = async (id) => {
  try {
    const res = await fetch(`songs/${id}.json`);
    currentSong = await res.json();
    player = new PracticePlayer(currentSong);
    player.setKey($('#keySelect').value);
    player.setPattern($('#patternSelect').value);
    render();
  } catch(e) { alert('詩歌載入失敗'); }
};

const render = () => {
  if (!player) return;
  const g = player.getGuidance();
  
  // 和弦進行
  $('#chordProgression').innerHTML = `
    <span class="chord-prog-item">${g.progression.prev}</span>
    <span class="chord-prog-item active"> ${g.progression.current}</span>
    <span class="chord-prog-item">${g.progression.next}</span>
  `;
  
  $('#currentChord').textContent = g.chord;
  $('#lyrics').textContent = g.lyrics;
  $('#hint').textContent = `${g.hint} (BPM: ${g.effectiveBpm})`;
  
  // 節奏網格
  $('#rhythmGrid').innerHTML = g.patternGrid.map(v => 
    `<div class="beat-dot ${v ? 'play' : ''}"></div>`
  ).join('');
  
  // 重置反饋
  $('#reactionTime').textContent = '-';
  $('#accuracy').textContent = '-';
};

const bindEvents = () => {
  $('#songSelect').addEventListener('change', (e) => loadSong(e.target.value));
  $('#keySelect').addEventListener('change', (e) => { player?.setKey(e.target.value); render(); });
  $('#patternSelect').addEventListener('change', (e) => { player?.setPattern(e.target.value); render(); });
  
  $('#btnSlow').addEventListener('click', (e) => {
    const isSlow = player.toggleSlow();
    e.target.textContent = isSlow ? '🐌 慢速(ON)' : '🐌 慢速';
    render();
  });
  
  $('#btnLoop').addEventListener('click', (e) => {
    const isActive = player.toggleLoop(0, player.song.sections[0].measures.length - 1);
    e.target.textContent = isActive ? '🔁 循環(ON)' : ' 循環';
  });
  
  $('#btnNext').addEventListener('click', () => { player.next(); render(); });
  $('#btnPrev').addEventListener('click', () => { player.prev(); render(); });
  
  $('#btnConfirm').addEventListener('click', () => {
    const feedback = player.recordFeedback(100); // 100% 為預設，未來可接 MIDI/按鍵檢測
    $('#reactionTime').textContent = feedback.rt;
    $('#accuracy').textContent = feedback.accuracy;
    
    // 視覺反饋
    $('#btnConfirm').style.background = '#059669';
    setTimeout(() => $('#btnConfirm').style.background = '', 300);
  });
};

document.addEventListener('DOMContentLoaded', init);
