function setupKeyboardBridge() {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'keyDown') {
            const midi = event.data.midi;
            // 播放钢琴音
            if (typeof playNote === 'function') {
                // 短暂音符，模拟钢琴按键
                playNote(midi, 0.8, 0);
            } else {
                // fallback: 直接用audioCtx
                if (window.audioCtx) {
                    const freq = 440 * Math.pow(2, (midi - 69) / 12);
                    const gain = audioCtx.createGain();
                    const osc = audioCtx.createOscillator();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.8);
                }
            }
            // 通知练习和AI模块
            window.dispatchEvent(new CustomEvent('userPlayedNote', { detail: { midi: midi } }));
        }
    });
    console.log('键盘桥接已建立');
}

// 暴露全局playNote供其他模块使用
window.playNote = playNote;
