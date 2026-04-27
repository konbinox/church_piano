// 应用初始化模块
function loadHymn(id) {
  currentHymn = HYMNS[id];
  if (!currentHymn) return;
  
  bpm = currentHymn.bpm;
  document.getElementById('bpm-range').value = bpm;
  document.getElementById('bpm-display').textContent = bpm;
  document.getElementById('key-sel').value = currentHymn.key;
  
  // 显示/隐藏弹法面板
  const stylePanel = document.getElementById('style-panel');
  if (stylePanel) stylePanel.style.display = id === 'doxology' ? 'block' : 'none';
  
  // 渲染所有视图
  renderJianpu();
  renderChordProg();
  buildChordDetail();
  drawStaff();
  drawPianoRoll();
  updateChordOverlay(0);
  buildPracChordRow();
  updatePracDisplay(currentHymn.chords?.[0] || 'C');
  
  // 停止播放并重置
  stopPlayback();
  beatIndex = 0;
  
  // 更新活动状态
  document.querySelectorAll('.hymn-item').forEach(h => h.classList.remove('active'));
  document.getElementById(`h-${id}`)?.classList.add('active');
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载默认曲目
  loadHymn('jesuslovesC');
  
  // 绑定事件
  document.getElementById('play-pause')?.addEventListener('click', () => playing ? stopPlayback() : startPlayback());
  document.getElementById('skip-back')?.addEventListener('click', () => { beatIndex = 0; onBeat(); });
  document.getElementById('skip-fwd')?.addEventListener('click', () => {
    beatIndex = Math.min(currentHymn.jianpu.length - 1, beatIndex + 4);
    onBeat();
  });
  document.getElementById('bpm-range')?.addEventListener('input', (e) => setBPM(parseInt(e.target.value)));
  document.getElementById('output-mode')?.addEventListener('change', (e) => {});
  document.getElementById('zoom-btn')?.addEventListener('click', zoomToggle);
  document.getElementById('metronome-btn')?.addEventListener('click', toggleMetronome);
  document.getElementById('midi-connect')?.addEventListener('click', requestMIDI);
  document.getElementById('ai-send')?.addEventListener('click', sendAI);
  document.getElementById('ai-inp')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAI(); });
  
  // 曲目切换
  document.querySelectorAll('.hymn-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.hymn;
      if (id && HYMNS[id]) loadHymn(id);
    });
  });
  
  // Tab 切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // 弹法选择
  document.querySelectorAll('.psb').forEach(btn => {
    btn.addEventListener('click', () => setPracStyle(btn.dataset.ps));
  });
  
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.style;
      if (style) {
        setPracStyle(style);
        const hints = {
          block: '柱式：三音同时按下，庄重稳定，适合圣餐、祷告',
          arpeggio: '分解：根→三→五→三，流动如水，类似二胡走音',
          rhythm: '节奏：左手根音(咚) + 右手和弦(哒哒)，有敬拜律动感'
        };
        const hintDiv = document.getElementById('style-hint');
        if (hintDiv) hintDiv.innerHTML = hints[style];
        
        if (currentHymn?.name?.includes('三一颂')) {
          const bpms = { block: 60, arpeggio: 72, rhythm: 80 };
          bpm = bpms[style];
          document.getElementById('bpm-range').value = bpm;
          document.getElementById('bpm-display').textContent = bpm;
        }
      }
    });
  });
  
  // 练习控制
  document.getElementById('prac-play-btn')?.addEventListener('click', () => {
    pracPlaying ? stopPracPlay() : startPracPlay();
  });
  document.getElementById('prac-stop-btn')?.addEventListener('click', stopPracPlay);
  document.getElementById('prac-loop-btn')?.addEventListener('click', loopChords);
  
  // 61键键盘消息
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'kb61click') {
      playWebAudio(e.data.midi, 500);
      const mode = document.getElementById('output-mode')?.value || 'webaudio';
      if ((mode === 'midi' || mode === 'both') && window.midiOutput) {
        playMIDINote(e.data.midi, 500);
      }
    }
  });
});
