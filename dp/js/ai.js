function aiAdvice(playedNotes, expectedNotes) {
    if(!expectedNotes || !expectedNotes.length) return "请先选择一首赞美诗";
    let correct = 0;
    for(let i=0; i<Math.min(playedNotes.length, expectedNotes.length); i++) {
        if(playedNotes[i] === expectedNotes[i]) correct++;
    }
    const acc = correct / expectedNotes.length;
    if(acc > 0.8) return "🎉 非常棒！节奏和音准都很好，继续挑战下一首吧。";
    if(acc > 0.5) return "👍 不错，但有少量错音，放慢速度再试试。注意指法。";
    return "💡 建议先分段练习，用右手单独弹旋律。保持手型放松。";
}

window.addEventListener('userPlayedNote', (()=>{
    let userSeq = [];
    return (e) => {
        userSeq.push(e.detail.midi);
        if(userSeq.length > 50) userSeq.shift();
        const selectedId = document.getElementById('hymnSelect')?.value;
        if(selectedId && HYMNS_LIB[selectedId]) {
            const expectedMidi = HYMNS_LIB[selectedId].notes.map(n=>midiFromName(n));
            const advice = aiAdvice(userSeq, expectedMidi);
            const aiPanel = document.getElementById('aiPanel');
            if(aiPanel) aiPanel.innerHTML = `<strong>🤖 AI 实时分析:</strong><br> ${advice}<br>📝 最近弹奏: ${userSeq.slice(-5).map(m=>noteNumToName(m)).join(" ")}`;
        }
    };
})());

function midiFromName(name) {
    const map = {C:0, C#:1, D:2, D#:3, E:4, F:5, F#:6, G:7, G#:8, A:9, A#:10, B:11};
    const oct = parseInt(name.slice(-1));
    const pitch = name.slice(0,-1);
    return 12*(oct+1) + map[pitch];
}
