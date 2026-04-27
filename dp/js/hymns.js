// ========== 曲库数据（已修正《奇异恩典》G调） ==========
// 音符格式：音名+八度，如 G4 = 中央G
const HYMNS_LIB = [
    { 
        id: 0, 
        name: "🎄 平安夜 (Silent Night)", 
        bpm: 90, 
        key: "C大调",
        notes: ["C4", "E4", "G4", "C5", "B4", "G4", "A4", "A4", "G4", "E4", "C4", "D4", "D4", "C4"]
    },
    { 
        id: 1, 
        name: "🌟 奇异恩典 (Amazing Grace) - G调修正版", 
        bpm: 80, 
        key: "G大调",
        notes: ["D4", "G4", "B4", "B4", "A4", "G4", "A4", "G4", "E4", "D4", "D4", "G4", "B4", "G4","B4","D3"]
        // 简谱对应: 5 1 3 3 2 1 2 1 6 5 5 1 3 1 3 5 4 3 2
    },
    { 
        id: 2, 
        name: "🎵 小星星 (Twinkle Twinkle)", 
        bpm: 100, 
        key: "C大调",
        notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"]
    },
    { 
        id: 3, 
        name: "🎹 欢乐颂 (Ode to Joy)", 
        bpm: 90, 
        key: "C大调",
        notes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4", "C4", "C4", "D4", "E4", "E4", "D4", "D4"]
    }
];

// 获取曲库
function getHymns() { return HYMNS_LIB; }

// 添加新曲目（用户自定义）
function addCustomHymn(name, bpm, key, notesArray) {
    const newId = HYMNS_LIB.length;
    HYMNS_LIB.push({
        id: newId,
        name: `✏️ ${name}`,
        bpm: parseInt(bpm),
        key: key || "自定义",
        notes: notesArray
    });
    return newId;
}

// 编辑已有曲目
function editHymn(id, name, bpm, key, notesArray) {
    if (HYMNS_LIB[id]) {
        HYMNS_LIB[id] = {
            ...HYMNS_LIB[id],
            name: name,
            bpm: parseInt(bpm),
            key: key,
            notes: notesArray
        };
        return true;
    }
    return false;
}

// 删除曲目
function deleteHymn(id) {
    if (id < HYMNS_LIB.length && id > 2) { // 保留前3首预设
        HYMNS_LIB.splice(id, 1);
        // 重新整理ID
        HYMNS_LIB.forEach((h, idx) => h.id = idx);
        return true;
    }
    return false;
}

// 导出全局
window.HYMNS_LIB = HYMNS_LIB;
window.getHymns = getHymns;
window.addCustomHymn = addCustomHymn;
window.editHymn = editHymn;
window.deleteHymn = deleteHymn;
