const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const state = {
  algo: 'bfs',
  start: PRESETS.bfs.start.slice(),
  goal: PRESETS.bfs.goal.slice(),
  run: null,
  autoTimer: null,
  editMode: { start: false, goal: false },
  playback: { timer: null, idx: 0, path: null },
  labels: new Map(),   // stateKey → letter label
};

/* ---------- TABS ---------- */
function bindTabs() {
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.algo;
      if (algo === state.algo) return;
      state.algo = algo;
      $$('.tab').forEach(b => b.classList.toggle('active', b === btn));
      state.start = PRESETS[algo].start.slice();
      state.goal = PRESETS[algo].goal.slice();
      state.editMode = { start: false, goal: false };
      resetRun();
      renderAll();
    });
  });
}

/* ---------- BOARDS ---------- */
function renderBoard(elId, stateArr, editing) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const v = stateArr[i];
    const cell = document.createElement('div');
    cell.className = 'cell' + (v === 0 ? ' blank' : '');
    if (editing) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.value = v === 0 ? '' : String(v);
      input.dataset.idx = String(i);
      input.addEventListener('input', onCellInput);
      input.addEventListener('focus', () => input.select());
      cell.appendChild(input);
      cell.classList.add('editing');
    } else {
      cell.textContent = v === 0 ? '' : String(v);
    }
    el.appendChild(cell);
  }
}

function onCellInput(e) {
  const inp = e.target;
  const board = inp.closest('#board-start') ? 'start' : 'goal';
  const idx = Number(inp.dataset.idx);
  const raw = inp.value.trim();
  let val;
  if (raw === '') val = 0;
  else if (/^[0-8]$/.test(raw)) val = Number(raw);
  else { inp.value = ''; val = 0; }
  state[board][idx] = val;
}

function validatePuzzle(arr) {
  if (arr.length !== 9) return false;
  const seen = new Set();
  for (const v of arr) {
    if (typeof v !== 'number' || v < 0 || v > 8) return false;
    if (seen.has(v)) return false;
    seen.add(v);
  }
  return seen.size === 9;
}

function bindBoardEditors() {
  $('#edit-start').addEventListener('click', () => toggleEdit('start'));
  $('#edit-goal').addEventListener('click', () => toggleEdit('goal'));
  $('#reset-start').addEventListener('click', () => {
    state.start = PRESETS[state.algo].start.slice();
    state.editMode.start = false;
    resetRun();
    renderAll();
  });
  $('#reset-goal').addEventListener('click', () => {
    state.goal = PRESETS[state.algo].goal.slice();
    state.editMode.goal = false;
    resetRun();
    renderAll();
  });
}

function toggleEdit(which) {
  if (state.editMode[which]) {
    const arr = which === 'start' ? state.start : state.goal;
    if (!validatePuzzle(arr)) {
      alert('Trạng thái không hợp lệ. Cần 9 ô chứa các số 0..8 mỗi số đúng 1 lần ( 0 = ô trống ).');
      return;
    }
    state.editMode[which] = false;
    resetRun();
  } else {
    state.editMode[which] = true;
  }
  renderAll();
}

/* ---------- INFO ---------- */
function renderInfo() {
  const meta = ALGO_META[state.algo];
  $('#info-algo').textContent = meta.name;
  $('#info-formula').textContent = meta.formula;
}

/* ---------- CONTROLS ---------- */
function bindControls() {
  $('#btn-run').addEventListener('click', onRun);
  $('#btn-step').addEventListener('click', onStep);
  $('#btn-auto').addEventListener('click', onAuto);
  $('#btn-pause').addEventListener('click', onPause);
  $('#btn-reset').addEventListener('click', () => { resetRun(); renderAll(); });
  $('#btn-play-path').addEventListener('click', onPlaybackToggle);

  const speed = $('#speed');
  speed.addEventListener('input', () => {
    $('#speed-val').textContent = speed.value + 'ms';
    if (state.autoTimer) { onPause(); onAuto(); }
  });
}

function ensureGenerator() {
  if (state.run && state.run.gen) return true;
  if (!validatePuzzle(state.start) || !validatePuzzle(state.goal)) {
    alert('Start hoặc Goal chưa hợp lệ.');
    return false;
  }
  if (!isSolvable(state.start, state.goal)) {
    if (!confirm('Cảnh báo: cấu hình Start → Goal có thể KHÔNG giải được. Vẫn chạy?')) return false;
  }
  const gen = ALGORITHMS[state.algo](state.start.slice(), state.goal.slice());
  state.run = {
    gen, steps: [], finished: false, success: false, goalNode: null,
    finalReached: [],
  };
  state.playback = { timer: null, idx: 0, path: null };
  state.labels = new Map();
  return true;
}

function trackLabels(step) {
  if (step.popped && step.popped.id !== undefined && step.popped.id >= 0) {
    state.labels.set(stateKey(step.popped.state), toLabel(step.popped.id));
  }
  (step.children || []).forEach(c => {
    if (c.state && c.id !== undefined && c.id >= 0) {
      state.labels.set(stateKey(c.state), toLabel(c.id));
    }
  });
  (step.frontierAfter || []).forEach(n => {
    if (n.id !== undefined && n.id >= 0) {
      state.labels.set(stateKey(n.state), toLabel(n.id));
    }
  });
}

function consumeOneStep() {
  if (!state.run || state.run.finished) return null;
  const { value, done } = state.run.gen.next();
  if (done || !value) {
    state.run.finished = true;
    return null;
  }
  state.run.steps.push(value);
  trackLabels(value);
  if (value.done) {
    state.run.finished = true;
    state.run.success = !!value.success;
    state.run.goalNode = value.goalNode || null;
    state.run.finalReached = value.reachedAfter || [];
  }
  return value;
}

function onRun() {
  resetRun();
  if (!ensureGenerator()) return;
  while (!state.run.finished) consumeOneStep();
  renderAll();
}

function onStep() {
  onPause();
  if (!ensureGenerator()) return;
  if (state.run.finished) return;
  consumeOneStep();
  renderAll();
}

function onAuto() {
  if (!ensureGenerator()) return;
  if (state.run.finished) return;
  if (state.autoTimer) return;
  $('#btn-auto').disabled = true;
  $('#btn-pause').disabled = false;
  const speed = Number($('#speed').value);
  state.autoTimer = setInterval(() => {
    const v = consumeOneStep();
    renderAll();
    if (!v || state.run.finished) onPause();
  }, speed);
}

function onPause() {
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
  }
  $('#btn-auto').disabled = false;
  $('#btn-pause').disabled = true;
}

function resetRun() {
  onPause();
  stopPlayback();
  state.run = null;
  state.playback = { timer: null, idx: 0, path: null };
  state.labels = new Map();
}

/* ---------- LABELS ---------- */
function toLabel(id) {
  if (id === null || id === undefined || id < 0) return '?';
  let n = id;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function labelForState(stateArr) {
  return state.labels.get(stateKey(stateArr)) || '?';
}

/* ---------- MINI BOARD ---------- */
function miniBoard(arr, opts = {}) {
  const div = document.createElement('div');
  div.className = 'mini-board' + (opts.goal ? ' goal-tile' : '');
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'mini-cell' + (arr[i] === 0 ? ' blank' : '');
    c.textContent = arr[i] === 0 ? '' : String(arr[i]);
    div.appendChild(c);
  }
  return div;
}

/* ---------- SET NOTATION  { grid , parent , action , depth } = label ---------- */
function renderSetNotation(item, opts = {}) {
  /*  item = { state, action, depth, id, parentId, g, h, status }  */
  const node = document.createElement('div');
  node.className = 'set-notation';
  const kind = opts.kind;
  if (kind === 'popped') node.classList.add('is-popped');
  if (kind === 'added') node.classList.add('is-added');
  if (kind === 'goal') node.classList.add('is-goal');
  if (kind === 'skipped') node.classList.add('is-skipped');
  if (kind === 'just-added') { node.classList.add('is-added', 'is-just-added'); }

  // Trường hợp invalid : không có grid, chỉ in dòng "action: invalid"
  if (item.status === 'invalid') {
    node.classList.add('invalid-row');
    const act = document.createElement('span');
    act.className = 'action-letter';
    act.textContent = item.action;
    node.appendChild(act);
    const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = ' : ';
    node.appendChild(sep);
    const tag = document.createElement('span');
    tag.className = 'tag tag-invalid';
    tag.textContent = 'INVALID';
    node.appendChild(tag);
    return node;
  }

  const open = document.createElement('span'); open.className = 'brace'; open.textContent = '{';
  node.appendChild(open);

  // grid
  node.appendChild(miniBoard(item.state));

  // , parent_label
  const sep1 = document.createElement('span'); sep1.className = 'sep'; sep1.textContent = ',';
  node.appendChild(sep1);
  const parentLabel = document.createElement('span');
  parentLabel.className = 'parent-label';
  parentLabel.textContent = (item.parentId === null || item.parentId === undefined)
    ? '∅'
    : toLabel(item.parentId);
  node.appendChild(parentLabel);

  // , action
  const sep2 = document.createElement('span'); sep2.className = 'sep'; sep2.textContent = ',';
  node.appendChild(sep2);
  const act = document.createElement('span'); act.className = 'action-letter';
  act.textContent = item.action || '—';
  node.appendChild(act);

  // , depth
  const sep3 = document.createElement('span'); sep3.className = 'sep'; sep3.textContent = ',';
  node.appendChild(sep3);
  const dep = document.createElement('span'); dep.className = 'depth-num';
  dep.textContent = String(item.depth ?? 0);
  node.appendChild(dep);

  const close = document.createElement('span'); close.className = 'brace'; close.textContent = '}';
  node.appendChild(close);

  // = label  ( chỉ với node có id )
  if (item.id !== undefined && item.id !== null && item.id >= 0) {
    const eq = document.createElement('span'); eq.className = 'eq'; eq.textContent = '=';
    node.appendChild(eq);
    const lab = document.createElement('span'); lab.className = 'child-label';
    lab.textContent = toLabel(item.id);
    node.appendChild(lab);
  }

  // Cost meta ( g / h ) — nhỏ phía cuối
  if (state.algo === 'ucs' && item.g !== undefined) {
    const eq = document.createElement('span'); eq.className = 'sep';
    eq.textContent = `   g = ${item.g}`;
    node.appendChild(eq);
  } else if (state.algo === 'greedy' && item.h !== undefined) {
    const eq = document.createElement('span'); eq.className = 'sep';
    eq.textContent = `   h = ${item.h}`;
    node.appendChild(eq);
  } else if ((state.algo === 'astar' || state.algo === 'idastar') && item.g !== undefined && item.h !== undefined) {
    const eq = document.createElement('span'); eq.className = 'sep';
    eq.textContent = `   g = ${item.g}, h = ${item.h} (f = ${item.g + item.h})`;
    node.appendChild(eq);
  }

  // tag trạng thái ( cho expansion list )
  if (opts.tag) {
    const t = document.createElement('span');
    t.className = 'tag tag-' + opts.tag;
    t.textContent = opts.tagText || opts.tag.toUpperCase();
    node.appendChild(t);
  }

  return node;
}

/* ---------- RENDER ---------- */
function renderAll() {
  renderInfo();
  renderBoard('board-start', state.start, state.editMode.start);
  renderBoard('board-goal', state.goal, state.editMode.goal);
  $('#edit-start').textContent = state.editMode.start ? 'Xong' : 'Sửa';
  $('#edit-goal').textContent = state.editMode.goal ? 'Xong' : 'Sửa';

  renderStatus();
  renderTrace();
  renderSolution();
}

function renderStatus() {
  const run = state.run;
  $('#stat-step').textContent = run ? run.steps.length : 0;
  const last = run && run.steps.length ? run.steps[run.steps.length - 1] : null;
  $('#stat-frontier').textContent = last ? last.frontierAfter.length : 0;
  $('#stat-reached').textContent = last ? last.reachedAfter.length : 0;

  const stat = $('#stat-status');
  stat.classList.remove('tag-success', 'tag-fail', 'tag-run');
  if (!run) { stat.textContent = '—'; }
  else if (run.finished && run.success) { stat.textContent = 'GOAL'; stat.classList.add('tag-success'); }
  else if (run.finished && !run.success) { stat.textContent = 'THẤT BẠI'; stat.classList.add('tag-fail'); }
  else {
    if (state.algo === 'ids' && last && last.limit !== undefined) {
      stat.textContent = `đang chạy (d=${last.limit})`;
    } else if (state.algo === 'idastar' && last && last.limit !== undefined) {
      stat.textContent = `đang chạy (f=${last.limit})`;
    } else {
      stat.textContent = 'đang chạy';
    }
    stat.classList.add('tag-run');
  }
}

/* ---------- LIVE FRONTIER PANEL — đã loại bỏ ( user yêu cầu ) ---------- */

/* ---------- TRACE TABLE ---------- */
function renderTrace() {
  const tbody = $('#trace-body');
  tbody.innerHTML = '';
  if (!state.run) return;

  state.run.steps.forEach((step, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'trace-row';
    if (idx === state.run.steps.length - 1) tr.classList.add('current');
    if (step.done && step.success) tr.classList.add('goal-row');

    // #
    const tdStep = document.createElement('td');
    tdStep.className = 'col-step';
    tdStep.textContent = step.iter;
    tr.appendChild(tdStep);

    // Node ( popped — KHÔNG tô đỏ theo yêu cầu )
    const tdNode = document.createElement('td');
    tdNode.className = 'col-node';
    if (step.popped) {
      const setNode = renderSetNotation(step.popped, { kind: null });
      tdNode.appendChild(setNode);
    } else {
      tdNode.textContent = '— ( hết frontier )';
    }
    tr.appendChild(tdNode);

    // Frontier ( popped được tô đỏ ở đây , kèm 4 children mở rộng )
    const tdFront = document.createElement('td');
    tdFront.className = 'col-frontier';

    // 1)  Popped node ( tô đỏ , nằm trong frontier column )
    if (step.popped) {
      const poppedTitle = document.createElement('div');
      poppedTitle.style.color = 'var(--text-faint)';
      poppedTitle.style.fontSize = '12px';
      poppedTitle.style.marginBottom = '6px';
      poppedTitle.textContent = 'VỪA POP KHỎI FRONTIER';
      tdFront.appendChild(poppedTitle);

      const setPopped = renderSetNotation(step.popped, { kind: 'popped' });
      tdFront.appendChild(setPopped);
    }

    // 2)  Children expansion list
    const expandTitle = document.createElement('div');
    expandTitle.style.color = 'var(--text-faint)';
    expandTitle.style.fontSize = '12px';
    expandTitle.style.marginTop = '12px';
    expandTitle.style.paddingTop = '8px';
    expandTitle.style.borderTop = '1px dashed var(--line)';
    expandTitle.style.marginBottom = '6px';
    expandTitle.textContent = 'MỞ RỘNG ( L → R → U → D )';
    tdFront.appendChild(expandTitle);

    const list = document.createElement('div');
    list.className = 'children-list';
    if (step.expansionMessage) {
      const msg = document.createElement('div');
      msg.style.color = 'var(--bad)';
      msg.style.fontWeight = 'bold';
      msg.style.fontSize = '13px';
      msg.style.marginTop = '4px';
      msg.style.fontStyle = 'italic';
      msg.textContent = step.expansionMessage;
      list.appendChild(msg);
    } else {
      step.children.forEach(ch => {
        let kind = null, tag = null, tagText = null;
        if (ch.status === 'added') { kind = 'added'; tag = 'added'; tagText = 'THÊM'; }
        if (ch.status === 'goal') { kind = 'goal'; tag = 'goal'; tagText = 'GOAL'; }
        if (ch.status === 'skipped') { kind = 'skipped'; tag = 'skipped'; tagText = 'BỎ QUA ( ' + (ch.reason || '') + ' )'; }
        if (ch.status === 'invalid') { kind = null; }
        const item = renderSetNotation({
          state: ch.state,
          action: ch.action,
          depth: ch.depth,
          id: ch.id,
          parentId: ch.parentId,
          g: ch.g,
          h: ch.h,
          status: ch.status,
        }, { kind, tag, tagText });
        list.appendChild(item);
      });
    }
    tdFront.appendChild(list);

    tr.appendChild(tdFront);

    // Reached
    const tdReached = document.createElement('td');
    tdReached.className = 'col-reached';
    const reachedWrap = document.createElement('div');
    reachedWrap.className = 'reached-list';
    step.reachedAfter.forEach(k => {
      const arr = k.split('').map(Number);
      const label = state.labels.get(k) || '?';
      const box = document.createElement('div');
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.alignItems = 'center';
      box.style.gap = '2px';
      box.appendChild(miniBoard(arr));
      const lab = document.createElement('span');
      lab.style.fontSize = '11px';
      lab.style.fontWeight = '700';
      lab.style.color = 'var(--text-dim)';
      lab.textContent = label;
      box.appendChild(lab);
      reachedWrap.appendChild(box);
    });
    tdReached.appendChild(reachedWrap);
    tr.appendChild(tdReached);

    tbody.appendChild(tr);
  });

  const wrap = $('.table-wrap');
  wrap.scrollTop = wrap.scrollHeight;
}

/* ---------- SOLUTION PLAYBACK ---------- */
function renderSolution() {
  const sec = $('#solution-section');
  const run = state.run;
  if (!run || !run.finished || !run.success || !run.goalNode) {
    sec.hidden = true;
    return;
  }
  sec.hidden = false;
  const path = tracePath(run.goalNode);
  const actions = path.slice(1).map(n => n.action);
  $('#sol-len').innerHTML = `Số bước : <b>${actions.length}</b>`;
  $('#sol-actions').innerHTML = `Chuỗi action : <b>${actions.join(' → ') || '( đã ở goal )'}</b>`;

  const strip = $('#solution-strip');
  strip.innerHTML = '';
  path.forEach((node, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'solution-arrow';
      arrow.textContent = '→';
      strip.appendChild(arrow);
    }
    const stepDiv = document.createElement('div');
    stepDiv.className = 'solution-step';
    stepDiv.dataset.idx = String(i);
    const board = document.createElement('div');
    board.className = 'step-board';
    for (let j = 0; j < 9; j++) {
      const c = document.createElement('div');
      c.className = 'step-cell' + (node.state[j] === 0 ? ' blank' : '');
      c.textContent = node.state[j] === 0 ? '' : String(node.state[j]);
      board.appendChild(c);
    }
    stepDiv.appendChild(board);
    const tag = document.createElement('span');
    tag.className = 'step-action';
    tag.textContent = i === 0 ? 'START' : `${i}. ${node.action}`;
    stepDiv.appendChild(tag);
    strip.appendChild(stepDiv);
  });

  state.playback.path = path;
  state.playback.idx = 0;
  highlightPlayback(0);
  $('#playback-info').textContent = '';
}

function highlightPlayback(i) {
  $$('.solution-step').forEach(el => el.classList.toggle('active', Number(el.dataset.idx) === i));
}

function onPlaybackToggle() {
  if (!state.playback.path) return;
  if (state.playback.timer) { stopPlayback(); return; }
  $('#btn-play-path').textContent = 'Dừng phát';
  const speed = Number($('#speed').value);
  state.playback.timer = setInterval(() => {
    state.playback.idx++;
    if (state.playback.idx >= state.playback.path.length) {
      stopPlayback();
      return;
    }
    highlightPlayback(state.playback.idx);
    $('#playback-info').textContent = `Bước ${state.playback.idx} / ${state.playback.path.length - 1}`;
  }, speed);
}

function stopPlayback() {
  if (state.playback.timer) clearInterval(state.playback.timer);
  state.playback.timer = null;
  $('#btn-play-path').textContent = 'Phát lại đường đi';
}

/* ---------- INIT ---------- */
function init() {
  bindTabs();
  bindBoardEditors();
  bindControls();
  $('#speed-val').textContent = $('#speed').value + 'ms';
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
