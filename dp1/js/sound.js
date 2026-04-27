// 高级钢琴音色引擎 - 使用多采样合成
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 高级钢琴音色 - 由基频 + 多个泛音组成
function playPianoNote(midiNote, durationMs, velocity = 0.7) {
  const ctx = initAudio();
  const now = ctx.currentTime;
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // 主振荡器 (三角波 + 正弦波混合，更温暖)
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);
  
  // 基频 (正弦波，纯净)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq;
  
  // 第二泛音 (三角波，增加温暖感)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = freq * 2.0;
  
  // 第三泛音 (正弦波，五度泛音)
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = freq * 3.01;
  
  // 滤波器 - 模拟钢琴音色衰减
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  filter.Q.value = 2;
  
  // 连接
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(masterGain);
  
  // 音量包络 (钢琴: 快起、渐衰)
  const attack = 0.008;
  const decay = 0.15;
  const sustain = 0.25;
  const release = 0.3;
  
  const vol = Math.min(0.5, velocity * 0.6);
  
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(vol, now + attack);
  masterGain.gain.exponentialRampToValueAtTime(vol * sustain, now + decay);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000) + release);
  
  // 滤波器动态变化
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + (durationMs / 1000) + 0.2);
  osc2.stop(now + (durationMs / 1000) + 0.2);
  osc3.stop(now + (durationMs / 1000) + 0.2);
  
  return { osc1, osc2, osc3, gain: masterGain };
}

// 简单的节拍器/引导音
function playClick(low = true) {
  const ctx = initAudio();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = low ? 110 : 660;
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(now + 0.08);
}

function playWebAudio(midiNote, durationMs) {
  playPianoNote(midiNote, durationMs, 0.65);
}

function playMIDINote(midiNote, durationMs) {
  if (window.midiOutput) {
    window.midiOutput.send([0x90, midiNote, 85]);
    setTimeout(() => {
      if (window.midiOutput) window.midiOutput.send([0x80, midiNote, 0]);
    }, durationMs);
  }
}
