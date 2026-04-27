document.addEventListener('DOMContentLoaded', () => {
    // 全局音频上下文引用
    let isAudioInitialized = false;
    
    // 用户首次点击任何地方时激活音频
    function initAudioOnFirstInteraction() {
        if (isAudioInitialized) return;
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                console.log('音频已激活');
                isAudioInitialized = true;
            });
        } else if (!audioCtx) {
            initAudio();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            isAudioInitialized = true;
        }
    }
    
    // 监听用户点击、触摸等交互
    ['click', 'touchstart', 'keydown'].forEach(ev => {
        document.body.addEventListener(ev, initAudioOnFirstInteraction, { once: false });
    });
    
    // 加载曲目下拉菜单
    const select = document.getElementById('hymnSelect');
    if (select) {
        HYMNS_LIB.forEach((h, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.innerText = h.name;
            select.appendChild(opt);
        });
    }
    
    // 播放停止按钮
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const recordBtn = document.getElementById('recordBtn');
    const tempoSlider = document.getElementById('tempoSlider');
    const tempoVal = document.getElementById('tempoValue');
    
    let currentMidiSeq = [];
    let isRecording = false;
    let recordedNotes = [];
    
    function updateFromSelected() {
        const idx = select.value;
        const hymn = HYMNS_LIB[idx];
        if (!hymn) return;
        currentMidiSeq = hymn.notes.map(n => {
            // 转换音符名称为MIDI编号
            return midiFromName(n);
        });
        currentTempo = hymn.bpm;
        if (tempoSlider) {
            tempoSlider.value = currentTempo;
            tempoVal.innerText = currentTempo;
        }
        // 刷新显示
        if (typeof drawStaffCanvas === 'function') {
            drawStaffCanvas(currentMidiSeq);
        }
        if (typeof drawRollView === 'function') {
            drawRollView(currentMidiSeq);
        }
        if (typeof startPractice === 'function') {
            startPractice(currentMidiSeq);
        }
        // 更新AI面板
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel && typeof aiAdvice === 'function') {
            aiPanel.innerHTML = `<strong>🤖 AI 辅导</strong><br>当前曲目: ${hymn.name}<br>点击键盘或MIDI设备开始练习，AI会给你实时反馈。`;
        }
    }
    
    if (select) {
        select.addEventListener('change', updateFromSelected);
        // 初始加载第一首
        setTimeout(updateFromSelected, 100);
    }
    
    if (tempoSlider) {
        tempoSlider.addEventListener('input', (e) => { 
            currentTempo = parseInt(e.target.value); 
            if (tempoVal) tempoVal.innerText = currentTempo;
        });
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            initAudioOnFirstInteraction();
            if (currentMidiSeq.length) {
                startPlayback(currentMidiSeq, currentTempo);
            } else {
                console.warn('没有音符序列');
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopPlayback();
        });
    }
    
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (!isRecording) {
                isRecording = true;
                recordedNotes = [];
                recordBtn.style.background = '#c44';
                recordBtn.innerText = '🔴 录音中...';
                setTimeout(() => {
                    if (isRecording) {
                        isRecording = false;
                        recordBtn.style.background = '#3a3a4a';
                        recordBtn.innerText = '🔴 录音';
                        console.log('录音结束，共', recordedNotes.length, '个音符');
                    }
                }, 10000);
            } else {
                isRecording = false;
                recordBtn.style.background = '#3a3a4a';
                recordBtn.innerText = '🔴 录音';
            }
        });
    }
    
    // MIDI请求按钮
    const midiBtn = document.getElementById('requestMidiBtn');
    if (midiBtn && typeof requestMIDIAccess === 'function') {
        midiBtn.addEventListener('click', () => {
            requestMIDIAccess();
        });
    }
    
    // Tab切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const targetTab = document.getElementById(`${tab}Tab`);
            if (targetTab) targetTab.classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // 键盘桥接
    if (typeof setupKeyboardBridge === 'function') {
        setupKeyboardBridge();
    }
    
    // 初始化音频但不自动播放
    if (typeof initAudio === 'function') {
        initAudio();
    }
    
    // 测试用：点击控制台可检查
    console.log('App 初始化完成，点击播放按钮或键盘即可发声');
    
    // 监听用户弹奏用于练习和AI
    window.addEventListener('userPlayedNote', (e) => {
        if (isRecording) {
            recordedNotes.push({ midi: e.detail.midi, time: Date.now() });
        }
        // 刷新练习面板显示
        const practicePanel = document.getElementById('practicePanel');
        if (practicePanel && practicePanel.innerHTML.includes('练习模式')) {
            // 已经在practice.js中处理了，无需重复
        }
    });
});

// 辅助函数：音符名称转MIDI
function midiFromName(name) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    let pitchClass = name.slice(0, -1);
    let octave = parseInt(name.slice(-1));
    if (isNaN(octave) && name.length > 1) {
        // 可能是 C4 格式
        pitchClass = name.slice(0, -1);
        octave = parseInt(name.slice(-1));
    }
    if (isNaN(octave)) octave = 4;
    const midiNumber = 12 * (octave + 1) + (noteMap[pitchClass] || 0);
    return midiNumber;
}
