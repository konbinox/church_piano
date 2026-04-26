let audioCtx = null;
let currentSchedule = [];
let currentTimer = null;
let isPlaying = false;
let currentTempo = 100;
let currentNotesSeq = [];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playNote(midi, durationSec, timeOffsetSec = 0) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const start = now + timeOffsetSec;
    const end = start + durationSec;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, start);
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
    initAudio();
    if (!notesMidi.length) return;
    isPlaying = true;
    const beatDuration = 60 / bpm;
    let currentTimeOffset = 0;
    notesMidi.forEach(midi => {
        playNote(midi, beatDuration * 0.9, currentTimeOffset);
        currentTimeOffset += beatDuration;
    });
    const totalDuration = currentTimeOffset + 0.5;
    currentTimer = setTimeout(() => { isPlaying = false; }, totalDuration * 1000);
}

function stopPlayback() {
    if (currentTimer) clearTimeout(currentTimer);
    isPlaying = false;
}
