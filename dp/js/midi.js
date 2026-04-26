let midiAccess = null;
let midiOutput = null;

async function requestMIDIAccess() {
    if (!navigator.requestMIDIAccess) {
        updateMidiStatus(false, "浏览器不支持WebMIDI");
        return;
    }
    try {
        midiAccess = await navigator.requestMIDIAccess();
        updateMidiStatus(true, "MIDI已就绪");
        // 监听输入
        const inputs = midiAccess.inputs.values();
        for (let input of inputs) {
            input.onmidimessage = handleMIDIMessage;
        }
        // 获取输出
        const outputs = midiAccess.outputs.values();
        midiOutput = outputs.next().value || null;
    } catch(e) {
        updateMidiStatus(false, "MIDI权限被拒绝");
    }
}

function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;
    if (status >= 144 && status <= 159 && velocity > 0) {
        // Note On
        window.dispatchEvent(new CustomEvent('externalMidiNoteOn', { detail: { midi: note, velocity } }));
        // 键盘视觉
        const kbFrame = document.getElementById('kbFrame');
        if(kbFrame) kbFrame.contentWindow.postMessage({ type: 'flashKey', midi: note }, '*');
    } else if ((status >= 128 && status <= 143) || (status >= 144 && velocity === 0)) {
        let noteOff = status >= 144 ? status-128 : status;
        window.dispatchEvent(new CustomEvent('externalMidiNoteOff', { detail: { midi: note } }));
    }
}

function updateMidiStatus(connected, text) {
    const ind = document.getElementById('midiIndicator');
    const txt = document.getElementById('midiStatusText');
    if (ind) ind.className = `indicator ${connected ? 'active' : ''}`;
    if (txt) txt.innerText = text;
}
