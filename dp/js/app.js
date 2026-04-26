document.addEventListener('DOMContentLoaded', () => {
    // 加载曲目
    const select = document.getElementById('hymnSelect');
    HYMNS_LIB.forEach((h,idx) => {
        const opt = document.createElement('option');
        opt.value = idx; opt.innerText = h.name;
        select.appendChild(opt);
    });
    // 播放
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const tempoSlider = document.getElementById('tempoSlider');
    const tempoVal = document.getElementById('tempoValue');
    let currentMidiSeq = [];
    function updateFromSelected() {
        const idx = select.value;
        const hymn = HYMNS_LIB[idx];
        currentMidiSeq = hymn.notes.map(n => midiFromName(n));
        currentTempo = hymn.bpm;
        tempoSlider.value = currentTempo;
        tempoVal.innerText = currentTempo;
        drawStaffCanvas(currentMidiSeq);
        drawRollView(currentMidiSeq);
        startPractice(currentMidiSeq);
    }
    select.addEventListener('change', updateFromSelected);
    tempoSlider.addEventListener('input', (e) => { currentTempo = e.target.value; tempoVal.innerText = currentTempo; });
    playBtn.addEventListener('click', () => startPlayback(currentMidiSeq, currentTempo));
    stopBtn.addEventListener('click', () => stopPlayback());
    document.getElementById('requestMidiBtn').addEventListener('click', () => requestMIDIAccess());
    // tab切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(`${tab}Tab`).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    setupKeyboardBridge();
    initAudio();
    updateFromSelected();
});
