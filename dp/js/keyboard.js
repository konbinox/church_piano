// 处理来自iframe的键盘点击，并发出声音
function setupKeyboardBridge() {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'keyDown') {
            const midi = event.data.midi;
            // 播放钢琴音
            if (window.audioCtx) {
                const freq = 440 * Math.pow(2, (midi - 69) / 12);
                const gain = audioCtx.createGain();
                const osc = audioCtx.createOscillator();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.8);
                osc.start(); osc.stop(audioCtx.currentTime+0.8);
            }
            // 可记录用户弹奏
            window.dispatchEvent(new CustomEvent('userPlayedNote', { detail: { midi } }));
        }
    });
}
