// ═══════════════════════════════════════════════════
// ai.js — AI 辅导对话
// ═══════════════════════════════════════════════════

// ======================================================
// AI CHAT
// ======================================================
async function sendAI() {
  const inp = document.getElementById('ai-inp');
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';

  const chat = document.getElementById('ai-chat');
  const uMsg = document.createElement('div');
  uMsg.className = 'ai-msg ai-msg-user fade-up';
  uMsg.textContent = q;
  chat.appendChild(uMsg);
  chat.scrollTop = chat.scrollHeight;

  const thinking = document.createElement('div');
  thinking.className = 'ai-msg ai-msg-ai';
  thinking.innerHTML = '<span style="color:var(--green-dim)">…</span>';
  chat.appendChild(thinking);

  const h = currentHymn;
  const sys = `你是教会钢琴伴奏专业老师。用户正练习"${h.name}"（${h.key}大调，${h.time}，♩=${h.bpm}）。用户约70岁，有萨克斯及声乐背景，正学习钢琴以用于教会敬拜伴奏，使用Casio LK-280。请用简洁中文回答，重点实用。`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:800,
        system: sys,
        messages:[{role:'user',content:q}]
      })
    });
    const data = await res.json();
    const text = data.content?.map(b=>b.text||'').join('') || '无回应';
    thinking.textContent = text;
    thinking.classList.add('fade-up');
  } catch(e) {
    thinking.textContent = '连接失败：' + e.message;
  }
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('ai-inp').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendAI();
});
