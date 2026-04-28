// ═══════════════════════════════════════════════════
// hymns.js — 曲库数据
// 添加新曲目：在 HYMNS 对象里增加一个条目即可
// ═══════════════════════════════════════════════════

const HYMNS = {

  // ★ 耶稣爱你 — C调（完整）
  jesuslovesC: {
    name:'耶稣爱你（C调）', key:'C', bpm:80, time:'4/4',
    styleHint:'右手：C=CEG  F=FAC  G=GBD\n左手：只弹根音单音\n节奏：咚·哒哒 或 整拍柱式',
    jianpu:[
      // 第一段 主歌
      {n:'3',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'6',oct:0,dur:2,chord:'F', fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:4,chord:'F', fn:''},
      {n:'4',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:''},
      {n:'2',oct:0,dur:2,chord:'G', fn:'V'},
      {n:'1',oct:0,dur:4,chord:'C', fn:'I'},
      // 第二段 主歌
      {n:'3',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'6',oct:0,dur:2,chord:'F', fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:4,chord:'F', fn:''},
      {n:'4',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'G', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'1',oct:0,dur:4,chord:'C', fn:'I'},
      // 副歌 第一句
      {n:'5',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'6',oct:0,dur:2,chord:'F', fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:4,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'G', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'1',oct:0,dur:4,chord:'C', fn:'I'},
      // 副歌 第二句
      {n:'5',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'6',oct:0,dur:2,chord:'F', fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:4,chord:'C', fn:''},
      {n:'4',oct:0,dur:2,chord:'G', fn:'V'},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'1',oct:0,dur:4,chord:'C', fn:'I'},
    ],
    chords:['C','F','C','G','C'],
    analysis:'C大调 只用三个和弦：C / F / G\n手型：C=CEG  F=FAC  G=GBD\n换和弦整体平移，不要逐指找位置\n\n录像建议：先柱式一遍，再节奏式一遍'
  },

  // ★ 耶稣爱你 — F调（完整）
  jesuslovesF: {
    name:'耶稣爱你（F调）', key:'F', bpm:80, time:'4/4',
    styleHint:'F=FAC  Bb=BbDF  C=CEG\n⚠ Bb：中指落D，先单独练50次\n左手只弹 F / Bb / C 单音',
    jianpu:[
      {n:'3',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:''},
      {n:'5',oct:0,dur:4,chord:'Bb',fn:''},
      {n:'4',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'F', fn:''},
      {n:'3',oct:0,dur:2,chord:'F', fn:''},
      {n:'2',oct:0,dur:2,chord:'C', fn:'V'},
      {n:'1',oct:0,dur:4,chord:'F', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:''},
      {n:'5',oct:0,dur:4,chord:'Bb',fn:''},
      {n:'4',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'F', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'C', fn:''},
      {n:'1',oct:0,dur:4,chord:'F', fn:'I'},
      // 副歌
      {n:'5',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'Bb',fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'F', fn:''},
      {n:'3',oct:0,dur:4,chord:'F', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:''},
      {n:'2',oct:0,dur:2,chord:'C', fn:''},
      {n:'1',oct:0,dur:4,chord:'F', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'F', fn:''},
      {n:'6',oct:0,dur:2,chord:'Bb',fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'Bb',fn:''},
      {n:'5',oct:0,dur:2,chord:'F', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'F', fn:''},
      {n:'3',oct:0,dur:4,chord:'F', fn:''},
      {n:'4',oct:0,dur:2,chord:'C', fn:'V'},
      {n:'3',oct:0,dur:2,chord:'C', fn:''},
      {n:'2',oct:0,dur:2,chord:'C', fn:''},
      {n:'2',oct:0,dur:2,chord:'C', fn:''},
      {n:'1',oct:0,dur:4,chord:'F', fn:'I'},
    ],
    chords:['F','Bb','F','C','F'],
    analysis:'F大调 三和弦：F / Bb / C\n⚠ Bb唯一难点：Bb–D–F\n  → Bb小节右手只按D+F两音也够\n  → 节奏不断比音全更重要\n\n录像策略：Bb不完美没关系，稳住节奏'
  },

  // ★ 耶稣爱你 — G调（完整）
  jesuslovesG: {
    name:'耶稣爱你（G调）', key:'G', bpm:80, time:'4/4',
    styleHint:'G=GBD  C=CEG  D=DF#A\n最顺手，奇异恩典同调\n左手：G / C / D 单音',
    jianpu:[
      {n:'3',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:4,chord:'C', fn:''},
      {n:'4',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'1',oct:0,dur:4,chord:'G', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:4,chord:'C', fn:''},
      {n:'4',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'1',oct:0,dur:4,chord:'G', fn:'I'},
      // 副歌
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:4,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'3',oct:0,dur:2,chord:'D', fn:''},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'1',oct:0,dur:4,chord:'G', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'4',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:4,chord:'G', fn:''},
      {n:'4',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'3',oct:0,dur:2,chord:'D', fn:''},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'1',oct:0,dur:4,chord:'G', fn:'I'},
    ],
    chords:['G','C','G','D','G'],
    analysis:'G大调 三和弦：G / C / D\n和奇异恩典同调，手型完全通用\n\n建议：G调最稳，录像放最后压轴'
  },

  // ★ 三一颂（完整四句）
  doxology: {
    name:'三一颂（Doxology）', key:'G', bpm:72, time:'4/4',
    styleHint:'① 柱式：左右手同时按和弦\n② 分解：G→B→D→B 循环\n③ 节奏：左手根音 + 右手咚哒哒',
    jianpu:[
      // 赞美真神，万福之源
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'G', fn:''},
      {n:'5',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'2',oct:0,dur:4,chord:'D', fn:'V'},
      // 天下众生，赞美圣子
      {n:'1',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'1',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'2',oct:0,dur:4,chord:'G', fn:'I'},
      // 圣灵同心，三位一体
      {n:'5',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'5',oct:0,dur:2,chord:'G', fn:''},
      {n:'6',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'5',oct:0,dur:2,chord:'C', fn:''},
      {n:'4',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'3',oct:0,dur:2,chord:'G', fn:''},
      {n:'2',oct:0,dur:4,chord:'D', fn:'V'},
      // 归荣耀与主，阿们
      {n:'1',oct:0,dur:2,chord:'G', fn:'I'},
      {n:'2',oct:0,dur:2,chord:'G', fn:''},
      {n:'3',oct:0,dur:2,chord:'C', fn:'IV'},
      {n:'4',oct:0,dur:2,chord:'C', fn:''},
      {n:'3',oct:0,dur:2,chord:'D', fn:'V'},
      {n:'2',oct:0,dur:2,chord:'D', fn:''},
      {n:'1',oct:0,dur:4,chord:'G', fn:'I'},
    ],
    chords:['G','C','G','D','G','C','D','G'],
    analysis:'G大调 三和弦：G / C / D（和奇异恩典完全一样！）\n\n① 柱式：速度♩=60，每和弦稳稳按住，庄重\n② 分解：G→B→D→B 四音循环，像二胡走音\n③ 节奏：左根音，右 咚·哒·哒\n\n录像顺序：柱式→分解→节奏，一首三遍全交'
  },

  amazing: {
    name:'奇异恩典', key:'G', bpm:84, time:'3/4',
    jianpu: [
      {n:'5',oct:0,dur:4,chord:'G',fn:'I'},
      {n:'1',oct:1,dur:2,chord:'',fn:''},
      {n:'1',oct:1,dur:2,chord:'',fn:''},
      {n:'6',oct:0,dur:4,chord:'G',fn:'I'},
      {n:'5',oct:0,dur:2,chord:'',fn:''},
      {n:'3',oct:0,dur:4,chord:'C',fn:'IV'},
      {n:'1',oct:1,dur:2,chord:'',fn:''},
      {n:'2',oct:1,dur:2,chord:'G',fn:'I'},
      {n:'1',oct:1,dur:6,chord:'',fn:''},
      {n:'6',oct:0,dur:4,chord:'G',fn:'I'},
      {n:'5',oct:0,dur:2,chord:'',fn:''},
      {n:'1',oct:0,dur:4,chord:'D',fn:'V'},
      {n:'2',oct:0,dur:2,chord:'',fn:''},
      {n:'3',oct:0,dur:4,chord:'G',fn:'I'},
      {n:'5',oct:0,dur:2,chord:'',fn:''},
      {n:'5',oct:0,dur:4,chord:'C',fn:'IV'},
      {n:'3',oct:0,dur:2,chord:'',fn:''},
      {n:'1',oct:0,dur:6,chord:'G',fn:'I'},
    ],
    chords:['G','C','G','D','G','C','G','D','G'],
    analysis:'主调 G 大调。经典 I–IV–I–V–I 进行。\n左手可用分解和弦（根音＋五度）配合 3/4 拍。'
  },
  father: {
    name:'这是天父世界', key:'C', bpm:76, time:'3/4',
    jianpu:[
      {n:'3',oct:0,dur:4,chord:'C',fn:'I'},
      {n:'3',oct:0,dur:2,chord:'',fn:''},
      {n:'5',oct:0,dur:4,chord:'C',fn:'I'},
      {n:'3',oct:0,dur:2,chord:'',fn:''},
      {n:'1',oct:1,dur:4,chord:'F',fn:'IV'},
      {n:'6',oct:0,dur:2,chord:'',fn:''},
      {n:'5',oct:0,dur:6,chord:'C',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'G',fn:'V'},
      {n:'4',oct:0,dur:2,chord:'',fn:''},
      {n:'3',oct:0,dur:4,chord:'C',fn:'I'},
      {n:'2',oct:0,dur:2,chord:'',fn:''},
      {n:'1',oct:0,dur:6,chord:'C',fn:'I'},
    ],
    chords:['C','F','C','G','C','F','G','C'],
    analysis:'C 大调，清晰的 I–IV–V 进行。\n适合初学者练习自然和弦。'
  },
  gloria: {
    name:'荣耀归于圣父', key:'F', bpm:70, time:'4/4',
    jianpu:[
      {n:'1',oct:0,dur:4,chord:'F',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'C',fn:'V'},
      {n:'6',oct:0,dur:4,chord:'Dm',fn:'vi'},
      {n:'4',oct:0,dur:4,chord:'Bb',fn:'IV'},
      {n:'3',oct:0,dur:4,chord:'F',fn:'I'},
      {n:'4',oct:0,dur:4,chord:'C',fn:'V'},
      {n:'1',oct:0,dur:8,chord:'F',fn:'I'},
    ],
    chords:['F','C','Dm','Bb','F','C','F'],
    analysis:'F 大调。包含 vi（Dm）小调色彩。\n建议左手柱式和弦，增加庄严感。'
  },
  holy: {
    name:'圣哉圣哉圣哉', key:'Bb', bpm:72, time:'4/4',
    jianpu:[
      {n:'1',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'3',oct:0,dur:4,chord:'Eb',fn:'IV'},
      {n:'5',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'F',fn:'V'},
      {n:'6',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'Eb',fn:'IV'},
      {n:'1',oct:1,dur:8,chord:'Bb',fn:'I'},
    ],
    chords:['Bb','Eb','Bb','F','Bb','Eb','F','Bb'],
    analysis:'Bb 大调，适合音域较宽的赞美诗。\n左手可用 Alberti 低音织体。'
  },
  itiswell: {
    name:'好像一道河', key:'Bb', bpm:72, time:'4/4',
    jianpu:[
      {n:'5',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'1',oct:1,dur:4,chord:'Eb',fn:'IV'},
      {n:'6',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'3',oct:0,dur:4,chord:'F',fn:'V'},
      {n:'5',oct:0,dur:4,chord:'Bb',fn:'I'},
      {n:'1',oct:0,dur:8,chord:'Bb',fn:'I'},
    ],
    chords:['Bb','Eb','Bb','F7','Bb'],
    analysis:'Bb 大调。V7（F7）增加张力，引向主和弦解决。\n适合练习属七和弦处理。'
  },
  joyful: {
    name:'喜乐颂', key:'D', bpm:100, time:'4/4',
    jianpu:[
      {n:'3',oct:0,dur:4,chord:'D',fn:'I'},
      {n:'3',oct:0,dur:4,chord:'D',fn:'I'},
      {n:'4',oct:0,dur:4,chord:'G',fn:'IV'},
      {n:'5',oct:0,dur:4,chord:'D',fn:'I'},
      {n:'5',oct:0,dur:4,chord:'A',fn:'V'},
      {n:'4',oct:0,dur:4,chord:'D',fn:'I'},
      {n:'3',oct:0,dur:4,chord:'Bm',fn:'vi'},
      {n:'2',oct:0,dur:4,chord:'A',fn:'V'},
      {n:'1',oct:0,dur:8,chord:'D',fn:'I'},
    ],
    chords:['D','G','D','A','D','Bm','A','D'],
    analysis:'D 大调，活泼进行。含 vi（Bm）色彩变化。\n速度稍快，左手需要灵活切换。'
  }
};

// 和弦音位映射（MIDI音符）
const CHORD_VOICING = {
  'C' : { root:60, notes:[60,64,67], name:'C–E–G',   lh:'左手：C4', rh:'右手：C E G' },
  'F' : { root:65, notes:[65,69,72], name:'F–A–C',   lh:'左手：F4', rh:'右手：F A C' },
  'G' : { root:67, notes:[67,71,74], name:'G–B–D',   lh:'左手：G4', rh:'右手：G B D' },
  'D' : { root:62, notes:[62,66,69], name:'D–F#–A',  lh:'左手：D4', rh:'右手：D F# A' },
  'Bb': { root:70, notes:[70,74,77], name:'Bb–D–F',  lh:'左手：Bb3',rh:'右手：Bb D F ⚠中指落D' },
  'Eb': { root:63, notes:[63,67,70], name:'Eb–G–Bb', lh:'左手：Eb4',rh:'右手：Eb G Bb' },
  'Am': { root:69, notes:[69,72,76], name:'A–C–E',   lh:'左手：A3', rh:'右手：A C E' },
  'Dm': { root:62, notes:[62,65,69], name:'D–F–A',   lh:'左手：D4', rh:'右手：D F A' },
  'Em': { root:64, notes:[64,67,71], name:'E–G–B',   lh:'左手：E4', rh:'右手：E G B' },
  'Bm': { root:71, notes:[71,74,78], name:'B–D–F#',  lh:'左手：B3', rh:'右手：B D F#' },
  'A' : { root:69, notes:[69,73,76], name:'A–C#–E',  lh:'左手：A3', rh:'右手：A C# E' },
};

// 简谱→MIDI映射（各调）
const JIANPU_MIDI = {
  'C' : { '1':60,'2':62,'3':64,'4':65,'5':67,'6':69,'7':71 },
  'G' : { '1':67,'2':69,'3':71,'4':72,'5':74,'6':76,'7':78 },
  'F' : { '1':65,'2':67,'3':69,'4':70,'5':72,'6':74,'7':76 },
  'D' : { '1':62,'2':64,'3':66,'4':67,'5':69,'6':71,'7':73 },
  'Bb': { '1':70,'2':72,'3':74,'4':75,'5':77,'6':79,'7':81 },
  'Eb': { '1':63,'2':65,'3':67,'4':68,'5':70,'6':72,'7':74 },
};

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function beatToMIDI(beat, key) {
  const map = JIANPU_MIDI[key] || JIANPU_MIDI['C'];
  let midi = map[beat.n] || 60;
  if (beat.oct === 1)  midi += 12;
  if (beat.oct === -1) midi -= 12;
  return midi;
}
