// 曲目数据模块
const JIANPU_MIDI = {
  'C': { '1':60, '2':62, '3':64, '4':65, '5':67, '6':69, '7':71 },
  'G': { '1':67, '2':69, '3':71, '4':72, '5':74, '6':76, '7':78 },
  'F': { '1':65, '2':67, '3':69, '4':70, '5':72, '6':74, '7':76 }
};

const CHORD_VOICING = {
  'C':  { root:60, notes:[60,64,67], name:'C–E–G', lh:'左手 C3', rh:'C E G' },
  'F':  { root:65, notes:[65,69,72], name:'F–A–C', lh:'左手 F3', rh:'F A C' },
  'G':  { root:67, notes:[67,71,74], name:'G–B–D', lh:'左手 G3', rh:'G B D' },
  'Bb': { root:70, notes:[70,74,77], name:'Bb–D–F', lh:'左手 Bb3', rh:'Bb D F' }
};

const HYMNS = {
  jesuslovesC: {
    name:'耶稣爱你（C调）', key:'C', bpm:80, time:'4/4',
    jianpu: [
      {n:'3',oct:0,chord:'C',fn:'I'},{n:'3',oct:0},{n:'5',oct:0},{n:'5',oct:0},
      {n:'6',oct:0,chord:'F',fn:'IV'},{n:'6',oct:0},{n:'5',oct:0,dur:4},
      {n:'4',oct:0,chord:'C'},{n:'4',oct:0},{n:'3',oct:0},{n:'2',oct:0,chord:'G',fn:'V'},
      {n:'1',oct:0,dur:4,chord:'C'}
    ],
    chords: ['C','F','C','G','C'],
    analysis: 'C大调 I-IV-V，柱式/节奏练习。手型：C=CEG F=FAC G=GBD'
  },
  jesuslovesF: {
    name:'耶稣爱你（F调）', key:'F', bpm:80, time:'4/4',
    jianpu: [
      {n:'3',oct:0,chord:'F'},{n:'3',oct:0},{n:'5',oct:0},{n:'5',oct:0},
      {n:'6',oct:0,chord:'Bb',fn:'IV'},{n:'6',oct:0},{n:'5',oct:0,dur:4},
      {n:'4',oct:0,chord:'F'},{n:'4',oct:0},{n:'3',oct:0},{n:'2',oct:0,chord:'C',fn:'V'},
      {n:'1',oct:0,dur:4,chord:'F'}
    ],
    chords: ['F','Bb','F','C','F'],
    analysis: 'F大调 Bb和弦注意黑键：Bb–D–F。稳住节奏比音全更重要'
  },
  jesuslovesG: {
    name:'耶稣爱你（G调）', key:'G', bpm:80, time:'4/4',
    jianpu: [
      {n:'3',oct:0,chord:'G'},{n:'3',oct:0},{n:'5',oct:0},{n:'5',oct:0},
      {n:'6',oct:0,chord:'C',fn:'IV'},{n:'6',oct:0},{n:'5',oct:0,dur:4},
      {n:'4',oct:0,chord:'G'},{n:'4',oct:0},{n:'3',oct:0},{n:'2',oct:0,chord:'D',fn:'V'},
      {n:'1',oct:0,dur:4,chord:'G'}
    ],
    chords: ['G','C','G','D','G'],
    analysis: 'G大调 最顺手，和弦：G=GBD C=CEG D=DF#A'
  },
  doxology: {
    name:'三一颂', key:'G', bpm:72, time:'4/4',
    jianpu: [
      {n:'5',oct:0,chord:'G'},{n:'5',oct:0},{n:'6',oct:0},
      {n:'5',oct:0,chord:'C'},{n:'4',oct:0},{n:'3',oct:0,chord:'G'},
      {n:'2',oct:0,dur:4,chord:'D'}
    ],
    chords: ['G','C','G','D','G'],
    analysis: '三种弹法：①柱式庄重 ②分解流动(G→B→D→B) ③节奏(咚·哒哒)'
  },
  amazing: {
    name:'奇异恩典', key:'G', bpm:84, time:'3/4',
    jianpu: [{n:'5',oct:0,chord:'G'}],
    chords: ['G','C','G','D','G'],
    analysis: '3/4拍 经典赞美诗，左手可用根音+五度分解'
  },
  gloria: {
    name:'荣耀归于圣父', key:'F', bpm:70, time:'4/4',
    jianpu: [{n:'1',oct:0,chord:'F'}],
    chords: ['F','C','Dm','Bb','F'],
    analysis: 'F大调，包含小调色彩，建议左手柱式和弦'
  }
};

function beatToMIDI(beat, key) {
  const map = JIANPU_MIDI[key] || JIANPU_MIDI['C'];
  let midi = map[beat.n] || 60;
  if (beat.oct === 1) midi += 12;
  return midi;
}
