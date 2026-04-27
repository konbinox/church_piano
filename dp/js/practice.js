let currentExerciseNotes = [];
let expectedIndex = 0;

function startPractice(notesMidi) {
    if (!notesMidi || !notesMidi.length) return;
    currentExerciseNotes = [...notesMidi];
    expectedIndex = 0;
    const panel = document.getElementById('practicePanel');
    if (panel) {
        panel.innerHTML = `🎯 弹法练习模式<br>
        📝 请按顺序弹奏以下音符（共 ${notesMidi.length} 个）<br>
        🎵 ${notesMidi.map(m => noteNumToName(m)).join(' → ')}<br>
        ✅ 当前进度: <span id="practiceProgress">0</span>/${notesMidi.length}<br>
        <span id="practiceHint" style="color:#aaf;">点击虚拟键盘或外接MIDI键盘开始</span>`;
    }
}

function noteNumToName(midi) {
    const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const pitch = pitchClass[midi % 12];
    return pitch + octave;
}

// 监听用户弹奏
window.addEventListener('userPlayedNote', (e) => {
    if (currentExerciseNotes.length && expectedIndex < currentExerciseNotes.length) {
        const playedMidi = e.detail.midi;
        const expectedMidi = currentExerciseNotes[expectedIndex];
        
        const panel = document.getElementById('practicePanel');
        const progressSpan = document.getElementById('practiceProgress');
        const hintSpan = document.getElementById('practiceHint');
        
        if (playedMidi === expectedMidi) {
            expectedIndex++;
            if (progressSpan) progressSpan.innerText = expectedIndex;
            if (hintSpan) hintSpan.innerHTML = '✅ 正确！继续下一个音符';
            if (expectedIndex === currentExerciseNotes.length) {
                if (panel) panel.innerHTML += '<br><span style="color:#6f6;">🎉 恭喜！完美完成练习！</span>';
            }
        } else {
            if (hintSpan) {
                hintSpan.innerHTML = `❌ 应该弹 ${noteNumToName(expectedMidi)}，你弹了 ${noteNumToName(playedMidi)}，再试一次`;
            }
        }
    }
});
