// AI 对话模块
async function sendAI() {
  const inp = document.getElementById('ai-inp');
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';
  
  const chat = document.getElementById('ai-chat');
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg ai-msg-user fade-up';
  userMsg.textContent = q;
  chat.appendChild(userMsg);
  
  const thinking = document.createElement('div');
  thinking.className = 'ai-msg ai-msg-ai';
  thinking.innerHTML = '🤔 思考中...';
  chat.appendChild(thinking);
  chat.scrollTop = chat.scrollHeight;
  
  // 模拟 AI 响应（实际可接入 API）
  setTimeout(() => {
    const chordInfo = currentHymn?.chords?.[0] || 'C';
    const v = CHORD_VOICING[chordInfo] || CHORD_VOICING['C'];
    const response = `关于《${currentHymn?.name || '当前曲目'}》：<br>
    • 和弦 ${chordInfo} 的指法：${v.name}<br>
    • 左手弹 ${v.lh}，右手弹 ${v.rh}<br>
    • 建议先用柱式练习，速度 ${bpm} BPM<br>
    • 保持节奏稳定比追求完美更重要！`;
    thinking.innerHTML = response;
    thinking.classList.add('fade-up');
    chat.scrollTop = chat.scrollHeight;
  }, 500);
}
