// ========== 五线谱绘制模块 ==========
function drawStaffCanvas(notesMidiArr) {
    const canvas = document.getElementById('staffCanvas');
    if (!canvas) {
        console.warn('staffCanvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    canvas.width = width;
    canvas.height = 200;
    
    // 背景
    ctx.fillStyle = "#fff8e7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制五线谱（5条线）
    const staffTopY = 50;
    const lineSpacing = 10;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.2;
    
    for (let i = 0; i < 5; i++) {
        const y = staffTopY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 30, y);
        ctx.stroke();
    }
    
    if (!notesMidiArr || notesMidiArr.length === 0) {
        ctx.fillStyle = "#999";
        ctx.font = "16px sans-serif";
        ctx.fillText("无音符数据", canvas.width/2 - 50, 120);
        return;
    }
    
    // 绘制音符（简化版：圆形+符干）
    const noteSpacing = Math.min(22, (canvas.width - 60) / notesMidiArr.length);
    let startX = 40;
    
    // MIDI转五线谱Y坐标（MIDI 60 = C4 = 下加一线）
    function midiToY(midi) {
        // C4 (60) 对应 Y = staffTopY + 4*lineSpacing (第4线)
        const baseY = staffTopY + 4 * lineSpacing;  // C4位置
        const stepsFromC4 = midi - 60;
        // 每半音移动 3.5px（全音7px）
        return baseY - (stepsFromC4 * 3.5);
    }
    
    for (let i = 0; i < Math.min(notesMidiArr.length, 40); i++) {
        const midi = notesMidiArr[i];
        const x = startX + i * noteSpacing;
        let y = midiToY(midi);
        
        // 边界限制
        y = Math.max(25, Math.min(175, y));
        
        // 画符头（椭圆）
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(x - 1, y - 1, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 画符干
        ctx.beginPath();
        ctx.moveTo(x + 5, y);
        ctx.lineTo(x + 5, y - 25);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#111";
        ctx.stroke();
        
        // 如果音符太高，画上加线
        if (y < staffTopY + 2) {
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + 12, y);
            ctx.stroke();
        }
        // 如果音符太低，画下加线
        if (y > staffTopY + 4 * lineSpacing + 8) {
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + 12, y);
            ctx.stroke();
        }
    }
    
    // 绘制谱号
    ctx.font = "bold 36px 'Segoe UI'";
    ctx.fillStyle = "#222";
    ctx.fillText("𝄞", 12, staffTopY + 32);
    
    // 简谱显示（更新到jpu区域）
    const jpuDiv = document.getElementById('jpuArea');
    if (jpuDiv && notesMidiArr.length) {
        const simpleNames = notesMidiArr.slice(0, 24).map(m => {
            const pitchMap = ["1", "#1", "2", "#2", "3", "4", "#4", "5", "#5", "6", "#6", "7"];
            return pitchMap[m % 12];
        }).join(" ");
        jpuDiv.innerHTML = `<span style="font-size:1.4rem;">🎵 简谱: ${simpleNames}</span><br>
                           <span style="font-size:0.9rem; color:#555;">${notesMidiArr.length}个音符</span>`;
    }
}

// ========== 卷帘视图 ==========
function drawRollView(notesMidiArr) {
    const canvas = document.getElementById('rollCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    canvas.width = width;
    canvas.height = 300;
    
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!notesMidiArr || notesMidiArr.length === 0) return;
    
    // 绘制钢琴卷帘背景网格
    ctx.strokeStyle = "#334";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 12; i++) {
        const y = 300 - (i * 25);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    const noteWidth = Math.max(3, (canvas.width - 40) / notesMidiArr.length);
    const startX = 20;
    
    for (let i = 0; i < notesMidiArr.length; i++) {
        const midi = notesMidiArr[i];
        // 将MIDI映射到Y坐标 (MIDI 36 = C2 底部, MIDI 96 = C7 顶部)
        const y = 280 - ((midi - 36) * 2.8);
        if (y > 10 && y < 290) {
            ctx.fillStyle = `hsl(${200 + (midi % 30)}, 70%, 60%)`;
            ctx.fillRect(startX + i * noteWidth, y - 4, noteWidth - 1, 8);
        }
    }
    
    // 标注音名
    ctx.fillStyle = "#ccc";
    ctx.font = "10px monospace";
    for (let m = 36; m <= 96; m += 12) {
        const y = 280 - ((m - 36) * 2.8);
        if (y > 10) ctx.fillText(`C${Math.floor(m/12)-1}`, 2, y);
    }
}
