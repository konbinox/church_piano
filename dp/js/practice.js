let currentExerciseNotes = [];
let expectedIndex = 0;
let scorePractice = 0;

function startPractice(notesMidi) {
    currentExerciseNotes = notesMidi;
    expectedIndex = 0;
    scorePractice = 0;
    const panel = document.getElementById('practicePanel');
    if(panel) panel.innerHTML = `🎯 练习模式: 按顺序弹奏以下音符 (共${notesMidi.length}个)<br> 🎵 ${notesMidi.map(m=>noteNumToName(m)).join(" → ")}<br> ✅ 当前进度: 0/${notesMidi.length}`;
}

function noteNumToName(midi) {
    const p = midi % 12;
    const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    return names[p] + Math.floor(midi/12-1);
}

window.addEventListener('userPlayedNote', (e) => {
    if(currentExerciseNotes.length && expectedIndex < currentExerciseNotes.length) {
        if(e.detail.midi === currentExerciseNotes[expectedIndex]) {
            expectedIndex++;
            const panel = document.getElementById('practicePanel');
            if(panel) panel.innerHTML = `🎯 练习模式: 正确！进度 ${expectedIndex}/${currentExerciseNotes.length} <br> 🎹 继续下一个`;
            if(expectedIndex === currentExerciseNotes.length) panel.innerHTML += "<br> 🎉 完美完成练习！";
        } else {
            const panel = document.getElementById('practicePanel');
            panel.innerHTML += `<br> ❌ 错误，应该弹 ${noteNumToName(currentExerciseNotes[expectedIndex])}`;
        }
    }
});
