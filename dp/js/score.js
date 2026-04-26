function drawStaffCanvas(notesMidiArr) {
    const canvas = document.getElementById('staffCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 200;
    ctx.fillStyle = "#fff8e7"; ctx.fillRect(0,0,800,200);
    // 简易五线谱
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    for(let i=0;i<5;i++) {
        let y = 60 + i*12;
        ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(760,y); ctx.stroke();
    }
    // 简易简谱文本
    const jpuDiv = document.getElementById('jpuArea');
    if(jpuDiv) {
        let names = notesMidiArr.map(m => {
            const pitch = m % 12;
            const map = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
            return map[pitch] + Math.floor(m/12-1);
        }).slice(0,20).join(" ");
        jpuDiv.innerText = names;
    }
}

let rollCtx = null;
function drawRollView(notesMidiArr) {
    const canvas = document.getElementById('rollCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 300;
    ctx.fillStyle = "#1f1f2a"; ctx.fillRect(0,0,800,300);
    const noteHeight = 6;
    notesMidiArr.forEach((midi,idx) => {
        let y = 280 - (midi - 36) * 2.5;
        if(y<10) y=10;
        ctx.fillStyle = "#6cd9ff";
        ctx.fillRect(idx*12, y, 10, noteHeight);
    });
}
