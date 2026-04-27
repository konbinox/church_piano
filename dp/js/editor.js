// ========== 曲目编辑模块 ==========
let editorOpen = false;

function initEditor() {
    // 在底部面板添加编辑器入口
    const bottomPanel = document.querySelector('.bottom-panel');
    if (!bottomPanel) return;
    
    // 添加编辑器按钮到tabs旁
    const tabsDiv = document.querySelector('.tabs');
    if (tabsDiv) {
        const editorBtn = document.createElement('button');
        editorBtn.className = 'tab-btn';
        editorBtn.setAttribute('data-tab', 'editor');
        editorBtn.innerHTML = '✏️ 曲目编辑';
        editorBtn.style.background = '#4a6a3a';
        tabsDiv.appendChild(editorBtn);
        
        // 添加编辑器面板
        const editorPanel = document.createElement('div');
        editorPanel.id = 'editorTab';
        editorPanel.className = 'tab-content';
        editorPanel.innerHTML = `
            <div style="padding: 1rem;">
                <h3>📝 曲目编辑器</h3>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <h4>📋 现有曲目</h4>
                        <select id="editorSongSelect" style="width:100%; padding:0.5rem; margin-bottom:1rem;"></select>
                        <button id="editSongBtn" class="small-btn" style="background:#3a6a9a;">✏️ 编辑选中</button>
                        <button id="deleteSongBtn" class="small-btn" style="background:#9a3a3a;">🗑️ 删除选中</button>
                        <hr>
                        <h4>➕ 新建曲目</h4>
                        <input type="text" id="newSongName" placeholder="曲目名称" style="width:100%; margin-bottom:0.5rem;">
                        <input type="number" id="newSongBpm" placeholder="BPM (40-200)" value="90" style="width:100%; margin-bottom:0.5rem;">
                        <input type="text" id="newSongKey" placeholder="调式 (如 C大调)" value="C大调" style="width:100%; margin-bottom:0.5rem;">
                        <textarea id="newSongNotes" rows="3" placeholder="音符序列，用空格或逗号分隔&#10;例如: C4 D4 E4 F4 G4 A4 B4 C5" style="width:100%; margin-bottom:0.5rem;"></textarea>
                        <button id="createSongBtn" class="ctrl-btn" style="background:#2a6a4a;">➕ 创建新曲目</button>
                    </div>
                    <div style="flex: 2; min-width: 350px;">
                        <h4>🎹 音符输入辅助</h4>
                        <p>点击下方按钮插入音符（格式：音名+八度，如 C4、G5）</p>
                        <div id="noteInputPad" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                            ${['C','D','E','F','G','A','B'].map(pitch => `
                                <button class="note-pad-btn" data-pitch="${pitch}" style="padding:0.5rem; background:#3a4a5a;">${pitch}</button>
                            `).join('')}
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${[3,4,5,6].map(oct => `
                                <button class="oct-btn" data-oct="${oct}" style="padding:0.3rem 0.8rem; background:#2a3a4a;">八度${oct}</button>
                            `).join('')}
                        </div>
                        <div style="margin-top: 1rem;">
                            <label>当前编辑音符: <input type="text" id="currentNoteInput" placeholder="C4" style="width:100px;"></label>
                            <button id="addNoteBtn" class="small-btn">➕ 添加音符</button>
                            <button id="clearNotesBtn" class="small-btn" style="background:#6a3a3a;">🗑️ 清空</button>
                        </div>
                        <div style="margin-top: 1rem;">
                            <strong>音符序列预览:</strong>
                            <div id="notesPreview" style="background:#1a1a2a; padding:0.5rem; border-radius:0.5rem; font-family:monospace; font-size:0.9rem; word-break:break-all; min-height:60px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        bottomPanel.appendChild(editorPanel);
        
        // 绑定tab切换
        editorBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById('editorTab').classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            editorBtn.classList.add('active');
            refreshEditorList();
        });
        
        // 初始化编辑器功能
        setupEditorEvents();
    }
}

function refreshEditorList() {
    const select = document.getElementById('editorSongSelect');
    if (!select) return;
    select.innerHTML = '';
    HYMNS_LIB.forEach((song, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${song.name} (${song.key}, ${song.bpm} BPM)`;
        select.appendChild(opt);
    });
}

function setupEditorEvents() {
    // 音符输入板
    let currentOctave = 4;
    let workingNotes = [];
    
    document.querySelectorAll('.oct-btn')?.forEach(btn => {
        btn.addEventListener('click', () => {
            currentOctave = parseInt(btn.getAttribute('data-oct'));
            document.getElementById('currentNoteInput').placeholder = `C${currentOctave}`;
        });
    });
    
    document.querySelectorAll('.note-pad-btn')?.forEach(btn => {
        btn.addEventListener('click', () => {
            const pitch = btn.getAttribute('data-pitch');
            document.getElementById('currentNoteInput').value = `${pitch}${currentOctave}`;
        });
    });
    
    function updatePreview() {
        const preview = document.getElementById('notesPreview');
        if (preview) {
            preview.innerHTML = workingNotes.join(' → ') || '（空）';
        }
        document.getElementById('newSongNotes').value = workingNotes.join(' ');
    }
    
    document.getElementById('addNoteBtn')?.addEventListener('click', () => {
        const input = document.getElementById('currentNoteInput');
        let note = input.value.trim().toUpperCase();
        // 验证格式
        if (/^[ABCDEFG][#]?[0-9]$/i.test(note)) {
            workingNotes.push(note);
            updatePreview();
            input.value = '';
        } else {
            alert('格式错误！示例: C4, F#5, Bb3');
        }
    });
    
    document.getElementById('clearNotesBtn')?.addEventListener('click', () => {
        workingNotes = [];
        updatePreview();
    });
    
    document.getElementById('createSongBtn')?.addEventListener('click', () => {
        const name = document.getElementById('newSongName')?.value;
        const bpm = document.getElementById('newSongBpm')?.value;
        const key = document.getElementById('newSongKey')?.value;
        const notesText = document.getElementById('newSongNotes')?.value;
        
        if (!name) {
            alert('请输入曲目名称');
            return;
        }
        
        let notesArray = workingNotes.length ? workingNotes : notesText.split(/[\s,]+/).filter(n => n);
        if (notesArray.length === 0) {
            alert('请输入音符序列');
            return;
        }
        
        if (typeof addCustomHymn === 'function') {
            addCustomHymn(name, bpm, key, notesArray);
            refreshEditorList();
            // 刷新主下拉菜单
            const mainSelect = document.getElementById('hymnSelect');
            if (mainSelect) {
                const opt = document.createElement('option');
                opt.value = HYMNS_LIB.length - 1;
                opt.innerText = `✏️ ${name}`;
                mainSelect.appendChild(opt);
            }
            alert(`✅ 曲目 "${name}" 已添加！`);
            workingNotes = [];
            updatePreview();
            document.getElementById('newSongName').value = '';
        }
    });
    
    document.getElementById('editSongBtn')?.addEventListener('click', () => {
        const select = document.getElementById('editorSongSelect');
        const id = parseInt(select.value);
        if (isNaN(id)) return;
        const song = HYMNS_LIB[id];
        if (song) {
            document.getElementById('newSongName').value = song.name.replace('✏️ ', '');
            document.getElementById('newSongBpm').value = song.bpm;
            document.getElementById('newSongKey').value = song.key;
            workingNotes = [...song.notes];
            updatePreview();
            alert(`编辑模式：现在可以修改后点击"创建新曲目"保存为新曲目，或手动调用editHymn函数`);
        }
    });
    
    document.getElementById('deleteSongBtn')?.addEventListener('click', () => {
        const select = document.getElementById('editorSongSelect');
        const id = parseInt(select.value);
        if (id < 3) {
            alert('预设曲目（前3首）不能删除');
            return;
        }
        if (confirm('确定删除这首曲目吗？')) {
            if (typeof deleteHymn === 'function') {
                deleteHymn(id);
                refreshEditorList();
                // 刷新主下拉菜单
                const mainSelect = document.getElementById('hymnSelect');
                if (mainSelect) {
                    mainSelect.innerHTML = '';
                    HYMNS_LIB.forEach((h, idx) => {
                        const opt = document.createElement('option');
                        opt.value = idx;
                        opt.innerText = h.name;
                        mainSelect.appendChild(opt);
                    });
                }
                alert('已删除');
            }
        }
    });
}

// 页面加载时初始化编辑器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditor);
} else {
    initEditor();
}
