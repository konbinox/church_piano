let audioCtx = null;
let currentTimer = null;
let isPlaying = false;
let currentTempo = 100;
let currentNotesSeq = [];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playNote(midi, durationSec, timeOffsetSec = 0) {
    if (!audioCtx) {
        initAudio();
        if (!audioCtx) return;
    }
    // 如果音频未激活，先尝试激活
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            playNoteInternal(midi, durationSec, timeOffsetSec);
        });
        return;
    }
    playNoteInternal(midi, durationSec, timeOffsetSec);
}

function playNoteInternal(midi, durationSec, timeOffsetSec = 0) {
    const now = audioCtx.currentTime;
    const start = now + Math.max(0, timeOffsetSec);
    const end = start + durationSec;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    osc.frequency.value = freq;
    osc.type = 'sine'; // 更柔和，也可用 'triangle'
    
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    
    osc.start(start);
    osc.stop(end);
    
    // 视觉反馈
    const kbFrame = document.getElementById('kbFrame');
    if (kbFrame && kbFrame.contentWindow) {
        kbFrame.contentWindow.postMessage({ type: 'flashKey', midi: midi }, '*');
    }
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
        playNote(midi, beatDuration * 0.8, currentTimeOffset);
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
