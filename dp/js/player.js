// ========== 统一播放引擎 - 钢琴音色版 ==========
let audioCtx = null;
let currentTimer = null;
let isPlaying = false;
let currentTempo = 100;
let currentNotesSeq = [];

// 采样钢琴音色（使用多个正弦波叠加模拟钢琴）
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// 钢琴音色函数（更真实、音量更大）
function playPianoNote(midi, durationSec, timeOffsetSec = 0, volume = 0.5) {
    if (!audioCtx) {
        initAudio();
        if (!audioCtx) return;
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            playPianoNoteInternal(midi, durationSec, timeOffsetSec, volume);
        });
        return;
    }
    playPianoNoteInternal(midi, durationSec, timeOffsetSec, volume);
}

function playPianoNoteInternal(midi, durationSec, timeOffsetSec = 0, volume = 0.5) {
    const now = audioCtx.currentTime;
    const start = now + Math.max(0, timeOffsetSec);
    const end = start + durationSec;
    
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    
    // 钢琴音色：主音 + 谐波（更丰富）
    const harmonics = [
        { gain: volume * 0.8, detune: 0 },      // 基频
        { gain: volume * 0.4, detune: 1200 },   // 第2泛音 (+1八度)
        { gain: volume * 0.2, detune: 1900 },   // 第3泛音
        { gain: volume * 0.15, detune: 2400 }   // 第4泛音
    ];
    
    const oscillators = [];
    const gains = [];
    
    harmonics.forEach((h, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.frequency.value = freq;
        if (idx > 0) {
            osc.detune.value = h.detune;
        }
        osc.type = 'triangle'; // 三角波更柔和
        
        // 包络：快速起音 + 衰减 + 释放
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(h.gain, start + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(h.gain * 0.4, start + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, end);
        
        osc.start(start);
        osc.stop(end);
        
        oscillators.push(osc);
        gains.push(gainNode);
    });
    
    // 视觉反馈
    const kbFrame = document.getElementById('kbFrame');
    if (kbFrame && kbFrame.contentWindow) {
        kbFrame.contentWindow.postMessage({ type: 'flashKey', midi: midi }, '*');
    }
}

// 播放音符（对外接口）
function playNote(midi, durationSec, timeOffsetSec = 0) {
    playPianoNote(midi, durationSec, timeOffsetSec, 0.7); // 音量0.7
}

function startPlayback(notesMidi, bpm) {
    stopPlayback();
    if (!notesMidi || !notesMidi.length) return;
    
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            startPlaybackInternal(notesMidi, bpm);
        });
        return;
    }
    startPlaybackInternal(notesMidi, bpm);
}

function startPlaybackInternal(notesMidi, bpm) {
    isPlaying = true;
    const beatDuration = 60 / bpm;
    let currentTimeOffset = 0;
    
    notesMidi.forEach(midi => {
        playNote(midi, beatDuration * 0.7, currentTimeOffset);
        currentTimeOffset += beatDuration;
    });
    
    const totalDuration = currentTimeOffset + 0.5;
    currentTimer = setTimeout(() => { 
        isPlaying = false;
        console.log('播放完成');
    }, totalDuration * 1000);
}

function stopPlayback() {
    if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
    }
    isPlaying = false;
}

// 导出
window.playNote = playNote;
window.startPlayback = startPlayback;
window.stopPlayback = stopPlayback;
window.initAudio = initAudio;
