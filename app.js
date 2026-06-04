const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const PSEUDOCODE = {
  bfs: `function Breadth_First_Search(Start, Goal):
  Frontier = FIFOQueue([Start])
  Reached = Set([Start])
  while Frontier is not empty:
    Node = Frontier.pop_left()
    if Node.state == Goal:
      return Node (Success)
    for each Action in [L, R, U, D]:
      Child = ChildNode(Node, Action)
      if Child is valid:
        if Child.state is not in Reached:
          add Child.state to Reached
          Frontier.append(Child)
  return Failure`,

  dfs: `function Depth_First_Search(Start, Goal):
  Frontier = Stack([Start])
  Reached = Set([Start])
  while Frontier is not empty:
    Node = Frontier.pop()
    if Node.state == Goal:
      return Node (Success)
    for each Action in [L, R, U, D]:
      Child = ChildNode(Node, Action)
      if Child is valid:
        if Child.state is not in Reached:
          add Child.state to Reached
          Frontier.push(Child)
  return Failure`,

  ids: `function Iterative_Deepening_Search(Start, Goal):
  for Depth_Limit = 0, 1, 2, ...:
    Result = Depth_Limited_Search(Start, Goal, Depth_Limit)
    if Result is GoalNode:
      return Result (Success)
    if Result is not Cutoff:
      return Failure

function Depth_Limited_Search(Node, Goal, Limit):
  if Node.state == Goal:
    return Node
  if Limit == 0:
    return Cutoff
  Cutoff_Occurred = False
  for each Action in [L, R, U, D]:
    Child = ChildNode(Node, Action)
    if Child is valid:
      if not IsCycle(Child):
        Result = Depth_Limited_Search(Child, Goal, Limit - 1)
        if Result == Goal: return Result
        if Result == Cutoff: Cutoff_Occurred = True
  return Cutoff if Cutoff_Occurred else Failure`,

  ucs: `function Uniform_Cost_Search(Start, Goal):
  Frontier = PriorityQueue(ordered by path cost g)
  Reached = Set([Start])
  add Start to Frontier with path cost 0
  while Frontier is not empty:
    Node = Frontier.pop_min()
    if Node.state == Goal:
      return Node (Success)
    for each Action in [L, R, U, D]:
      Child = ChildNode(Node, Action)
      if Child is valid:
        if Child.state is not in Reached or Child.g < Reached[Child.state].g:
          add Child.state to Reached with cost Child.g
          Frontier.insert_or_update(Child)
  return Failure`,

  greedy: `function Greedy_Best_First_Search(Start, Goal):
  Frontier = PriorityQueue(ordered by heuristic h)
  Reached = Set([Start])
  add Start to Frontier with priority h(Start)
  while Frontier is not empty:
    Node = Frontier.pop_min()
    if Node.state == Goal:
      return Node (Success)
    for each Action in [L, R, U, D]:
      Child = ChildNode(Node, Action)
      if Child is valid:
        if Child.state is not in Reached:
          add Child.state to Reached
          Frontier.insert(Child)
  return Failure`,

  astar: `function A_Star_Search(Start, Goal):
  Frontier = PriorityQueue(ordered by f = g + h)
  Reached = Set([Start])
  add Start to Frontier with priority f(Start) = h(Start)
  while Frontier is not empty:
    Node = Frontier.pop_min()
    if Node.state == Goal:
      return Node (Success)
    for each Action in [L, R, U, D]:
      Child = ChildNode(Node, Action)
      if Child is valid:
        if Child.state is not in Reached or Child.g < Reached[Child.state].g:
          add Child.state to Reached with cost Child.g
          Frontier.insert_or_update(Child)
  return Failure`,

  idastar: `function IDA_Star(Start, Goal):
  Limit = f(Start) = h(Start)
  while True:
    Next_Limit, Result = Search(Start, 0, Limit, Goal)
    if Result is GoalNode:
      return Result (Success)
    if Next_Limit == Infinity:
      return Failure
    Limit = Next_Limit

function Search(Node, g, Limit, Goal):
  f = g + h(Node)
  if f > Limit:
    return f, Cutoff
  if Node.state == Goal:
    return Limit, Node
  Min_Limit = Infinity
  for each Action in [L, R, U, D]:
    Child = ChildNode(Node, Action)
    if Child is valid:
      if not IsCycle(Child):
        Next_Limit, Result = Search(Child, g + Cost(Node, Child), Limit, Goal)
        if Result is GoalNode:
          return Next_Limit, Result
        if Next_Limit < Min_Limit:
          Min_Limit = Next_Limit
  return Min_Limit, Cutoff`,

  simpleHillClimbing: `function Simple_Hill_Climbing(Start, Goal):
  Current = Start
  while True:
    if Current == Goal:
      return Current (Success)
    Neighbors = GenerateNeighbors(Current)
    Better_Neighbor = None
    for Neighbor in Neighbors:
      if h(Neighbor) < h(Current):
        Better_Neighbor = Neighbor
        break // Select the first better neighbor
    if Better_Neighbor is None:
      return Current (Stuck at local minimum)
    Current = Better_Neighbor`,

  steepestAscentHillClimbing: `function Steepest_Ascent_Hill_Climbing(Start, Goal):
  Current = Start
  while True:
    if Current == Goal:
      return Current (Success)
    Neighbors = GenerateNeighbors(Current)
    Best_Neighbor = None
    for Neighbor in Neighbors:
      if h(Neighbor) < h(Current):
        if Best_Neighbor is None or h(Neighbor) < h(Best_Neighbor):
          Best_Neighbor = Neighbor // Select the best neighbor overall
    if Best_Neighbor is None:
      return Current (Stuck at local minimum)
    Current = Best_Neighbor`,
  
  localbeam: `function Local_Beam_Search(Start, Goal, k):
  1. Initialization:
     Current_State_set = {Generate k random states from Start}
  2. WHILE (True):
     Neighbor_States = empty
     2.1. GENERATE NEIGHBOR STATES:
     FOR EACH State in Current_State_set:
       Generate all neighboring states of State.
       Add these neighboring states to Neighbor_States.
     2.2. CHECK DEADLOCK / NO IMPROVEMENT:
     IF Neighbor_States is empty:
       Sort Current_State_set by h ascending
       RETURN best state in Current_State_set (deadlock)
     2.3. CHECK GOAL:
     FOR EACH Neighbor in Neighbor_States:
       IF Neighbor == Goal: RETURN Neighbor (Success)
     2.4. BEAM SELECTION:
     Sort Neighbor_States by objective function h ascending
     Current_State_set = Take k best states from sorted Neighbor_States`,

  ramdomreset: `function Random_Restart_Hill_Climbing(Start, Goal, Max_Restart):
  overallReached = Set([Start])
  for i = 1 to Max_Restart:
    Current = Start
    runReached = Set([Start])
    while True:
      if Current == Goal:
        return Current (Success)
      Neighbors = GenerateNeighbors(Current)
      Better_Neighbors = { N | h(N) < h(Current) and N not in runReached }
      if Better_Neighbors is empty:
        break // Stuck, restart from iteration i + 1
      else:
        Current = RandomSelect(Better_Neighbors)
        add Current to runReached, overallReached
  return Failure (Reached Max Restarts)`,

  stochastic: `function Stochastic_Hill_Climbing(Start, Goal):
  Current = Start
  Reached = Set([Start])
  while True:
    if Current == Goal:
      return Current (Success)
    Neighbors = GenerateNeighbors(Current)
    Better_Neighbors = { N | h(N) < h(Current) and N not in Reached }
    if Better_Neighbors is empty:
      return Current (Stuck at local minimum)
    else:
      Current = RandomSelect(Better_Neighbors)
      add Current to Reached`
};

function translateReason(r) {
  if (!r) return '';
  return r
    .replace(/không thể di chuyển/g, 'invalid move')
    .replace(/TRÙNG GOAL/g, 'GOAL MATCH')
    .replace(/đã trong reached/g, 'already in reached')
    .replace(/đã trong frontier/g, 'already in frontier')
    .replace(/thêm vào frontier/g, 'added to frontier')
    .replace(/thêm/g, 'added')
    .replace(/trùng lặp trong bước/g, 'duplicate in step')
    .replace(/đã đi qua trong lượt này/g, 'already visited in this run')
    .replace(/đạt giới hạn độ sâu/g, 'depth limit reached')
    .replace(/tạo chu trình/g, 'cycle detected')
    .replace(/trùng với tổ tiên/g, 'matches ancestor')
    .replace(/đã lặp/g, 'already in reached')
    .replace(/không tốt hơn/g, 'not better')
    .replace(/tốt hơn/g, 'better')
    .replace(/tốt nhất/g, 'best')
    .replace(/vượt ngưỡng/g, 'cutoff')
    .replace(/cập nhật từ reached/g, 'updated from reached')
    .replace(/cập nhật trong frontier/g, 'updated in frontier');
}

function translateMessage(m) {
  if (!m) return '';
  return m
    .replace(/Không mở rộng: Đạt giới hạn độ sâu/g, 'Cutoff: Depth limit reached')
    .replace(/Không mở rộng: Tạo chu trình \(trùng với tổ tiên\)/g, 'Cutoff: Cycle detected (matches ancestor)')
    .replace(/Dừng: Đạt cực đại cục bộ \(không có trạng thái lân cận nào tốt hơn\)/g, 'Stuck: Local maximum reached (no neighbor is better)')
    .replace(/Dừng: Đạt cực đại cục bộ \(không có trạng thái lân cận nào tốt hơn current\)/g, 'Stuck: Local maximum reached (no neighbor is better)')
    .replace(/Khởi động lại \(Lượt (\d+)\/(\d+)\)/g, 'Restarting (Iteration $1/$2)')
    .replace(/Bị kẹt ở cực đại cục bộ \(Lượt (\d+)\/(\d+)\)/g, 'Stuck at local maximum (Iteration $1/$2)')
    .replace(/Thất bại: Đã thử lại tối đa (\d+) lần nhưng không tìm thấy đích/g, 'Failed: Reached maximum restart limit of $1 without finding goal')
    .replace(/Dừng: Không còn trạng thái lân cận nào mới để đi tiếp \(bế tắc\)/g, 'Stuck: No new neighbors to explore (deadlock)')
    .replace(/Dừng: Đạt cực đại cục bộ \(không có lân cận nào tốt hơn\)/g, 'Stuck: Local maximum reached (no neighbor is better)')
    .replace(/Khởi tạo: Sinh ngẫu nhiên (\d+) trạng thái từ Start/g, 'Initialization: Generated $1 random states from Start')
    .replace(/— \( hết frontier \)/g, '— (empty frontier)');
}

const state = {
  algo: 'bfs',
  start: PRESETS.bfs.start.slice(),
  goal: PRESETS.bfs.goal.slice(),
  run: null,
  autoTimer: null,
  editMode: { start: false, goal: false },
  playback: { timer: null, idx: 0, path: null },
  labels: new Map(),   // map state to letter label
  gType: 'steps',
  hType: 'manhattan',
  k: 3,
  maxRestart: 5,
};

// Navigation tabs control
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
      renderPseudocode();
    });
  });
}

// Board editor and rendering logic
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
      alert('Invalid state. Board must contain digits 0-8 exactly once each (0 represents the blank space).');
      return;
    }
    state.editMode[which] = false;
    resetRun();
  } else {
    state.editMode[which] = true;
  }
  renderAll();
}

// Algorithmic information display
function renderInfo() {
  const meta = ALGO_META[state.algo];
  $('#info-algo').textContent = meta.name;

  const formulaEl = $('#info-formula');
  formulaEl.innerHTML = '';

  const hasG = ['ucs', 'astar', 'idastar'].includes(state.algo);
  const hasH = ['greedy', 'astar', 'idastar', 'simpleHillClimbing', 'steepestAscentHillClimbing', 'localbeam', 'ramdomreset', 'stochastic'].includes(state.algo);

  if (!hasG && !hasH) {
    formulaEl.textContent = 'None';
    $('#info-param-row').style.display = 'none';
    return;
  }

  const container = document.createElement('div');
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '6px';
  container.style.flexWrap = 'wrap';

  const labelF = document.createElement('span');
  labelF.textContent = 'f(n) = ';
  container.appendChild(labelF);

  if (hasG) {
    const selectG = document.createElement('select');
    selectG.id = 'select-g';
    selectG.className = 'formula-select';

    const optionsG = [
      { value: 'steps', text: 'g(n): Path cost (default)' },
      { value: 'manhattan', text: 'g(n): Manhattan' },
      { value: 'misplaced', text: 'g(n): Misplaced tiles' },
      { value: 'swap', text: 'g(n): Swapped tile value' }
    ];

    optionsG.forEach(opt => {
      const elOpt = document.createElement('option');
      elOpt.value = opt.value;
      elOpt.textContent = opt.text;
      elOpt.selected = (state.gType === opt.value);
      selectG.appendChild(elOpt);
    });

    selectG.addEventListener('change', (e) => {
      state.gType = e.target.value;
      resetRun();
      renderAll();
    });

    container.appendChild(selectG);
  }

  if (hasG && hasH) {
    const plus = document.createElement('span');
    plus.textContent = ' + ';
    container.appendChild(plus);
  }

  if (hasH) {
    const selectH = document.createElement('select');
    selectH.id = 'select-h';
    selectH.className = 'formula-select';

    const optionsH = [
      { value: 'manhattan', text: 'h(n): Manhattan (default)' },
      { value: 'misplaced', text: 'h(n): Misplaced tiles' },
      { value: 'swap', text: 'h(n): Swapped tile value' }
    ];

    optionsH.forEach(opt => {
      const elOpt = document.createElement('option');
      elOpt.value = opt.value;
      elOpt.textContent = opt.text;
      elOpt.selected = (state.hType === opt.value);
      selectH.appendChild(elOpt);
    });

    selectH.addEventListener('change', (e) => {
      state.hType = e.target.value;
      resetRun();
      renderAll();
    });

    container.appendChild(selectH);
  }

  formulaEl.appendChild(container);

  // Dynamic parameters row
  const paramRow = $('#info-param-row');
  const paramLabel = $('#info-param-label');
  const paramVal = $('#info-param-value');

  if (state.algo === 'localbeam') {
    paramRow.style.display = 'grid';
    paramLabel.textContent = 'Beam Width (k)';
    paramVal.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'formula-select';
    input.style.width = '70px';
    input.min = '1';
    input.max = '20';
    input.value = state.k;
    input.addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      state.k = val;
      resetRun();
      renderAll();
    });
    paramVal.appendChild(input);
  } else if (state.algo === 'ramdomreset') {
    paramRow.style.display = 'grid';
    paramLabel.textContent = 'Max Restarts';
    paramVal.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'formula-select';
    input.style.width = '70px';
    input.min = '1';
    input.max = '50';
    input.value = state.maxRestart;
    input.addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      state.maxRestart = val;
      resetRun();
      renderAll();
    });
    paramVal.appendChild(input);
  } else {
    paramRow.style.display = 'none';
  }
}

// Visualizer controls
function bindControls() {
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
    alert('Start or Goal state is invalid.');
    return false;
  }
  let gen;
  if (state.algo === 'localbeam') {
    gen = ALGORITHMS[state.algo](state.start.slice(), state.goal.slice(), state.gType, state.hType, state.k);
  } else if (state.algo === 'ramdomreset') {
    gen = ALGORITHMS[state.algo](state.start.slice(), state.goal.slice(), state.gType, state.hType, state.maxRestart);
  } else {
    gen = ALGORITHMS[state.algo](state.start.slice(), state.goal.slice(), state.gType, state.hType);
  }
  state.run = {
    gen, steps: [], finished: false, success: false, goalNode: null,
    finalReached: [],
  };
  state.playback = { timer: null, idx: 0, path: null };
  state.labels = new Map();
  return true;
}

function trackLabels(step) {
  // Clear accumulated labels when a restart occurs to reset labels back to A1
  if (step.expansionMessage && (step.expansionMessage.includes('Khởi động lại') || step.expansionMessage.includes('Restart') || step.expansionMessage.includes('restart'))) {
    state.labels = new Map();
  }

  const addLabel = (stateKeyStr, label) => {
    if (!state.labels.has(stateKeyStr)) {
      state.labels.set(stateKeyStr, new Set());
    }
    state.labels.get(stateKeyStr).add(label);
  };

  if (step.poppedNodes) {
    step.poppedNodes.forEach(pn => {
      if (pn && pn.id !== undefined && pn.id >= 0) {
        addLabel(stateKey(pn.state), toLabel(pn.id));
      }
    });
  }
  if (step.popped && step.popped.id !== undefined && step.popped.id >= 0) {
    addLabel(stateKey(step.popped.state), toLabel(step.popped.id));
  }
  (step.children || []).forEach(c => {
    if (c.state && c.id !== undefined && c.id >= 0) {
      addLabel(stateKey(c.state), toLabel(c.id));
    }
  });
  (step.frontierBefore || []).forEach(n => {
    if (n.state && n.id !== undefined && n.id >= 0) {
      addLabel(stateKey(n.state), toLabel(n.id));
    }
  });
  (step.frontierAfter || []).forEach(n => {
    if (n.id !== undefined && n.id >= 0) {
      addLabel(stateKey(n.state), toLabel(n.id));
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

function toLabel(id) {
  if (id === null || id === undefined || id < 0) return '?';
  return `A<sub>${id + 1}</sub>`;
}

function labelForState(stateArr) {
  const s = state.labels.get(stateKey(stateArr));
  if (!s) return '?';
  return Array.from(s).join(', ');
}

// Miniature board visualization
function getMovedIndex(state, action) {
  if (!action) return -1;
  const bi = state.indexOf(0);
  const { r, c } = rcOf(bi);
  const delta = ACTION_DELTA[action];
  if (!delta) return -1;
  const parentR = r - delta.dr;
  const parentC = c - delta.dc;
  if (parentR < 0 || parentR > 2 || parentC < 0 || parentC > 2) return -1;
  return idxOf(parentR, parentC);
}

function miniBoard(arr, opts = {}) {
  const div = document.createElement('div');
  div.className = 'mini-board' + (opts.goal ? ' goal-tile' : '');
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'mini-cell' + (arr[i] === 0 ? ' blank' : '');
    if (opts.movedIndex !== undefined && i === opts.movedIndex) {
      c.classList.add('moved-tile');
    }
    c.textContent = arr[i] === 0 ? '' : String(arr[i]);
    div.appendChild(c);
  }
  return div;
}

// Render node state notation showing state grid, parent label, action, and depth
function renderSetNotation(item, opts = {}) {
  // item fields: state, action, depth, id, parentId, g, h, status
  const node = document.createElement('div');
  node.className = 'set-notation';
  const kind = opts.kind;
  if (kind === 'popped') node.classList.add('is-popped');
  if (kind === 'added') node.classList.add('is-added');
  if (kind === 'goal') node.classList.add('is-goal');
  if (kind === 'skipped') node.classList.add('is-skipped');
  if (kind === 'cutoff') node.classList.add('is-cutoff');
  if (kind === 'just-added') { node.classList.add('is-added', 'is-just-added'); }

  // Handle invalid move case by showing action with invalid status
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

  // Render mini board with cost indicators
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container-with-cost';
  const movedIndex = getMovedIndex(item.state, item.action);
  gridContainer.appendChild(miniBoard(item.state, { movedIndex }));

  if (state.algo === 'ucs' && item.g !== undefined) {
    const costDiv = document.createElement('div');
    costDiv.className = 'node-cost-sub';
    costDiv.textContent = `g = ${item.g}`;
    gridContainer.appendChild(costDiv);
  } else if ((state.algo === 'greedy' || state.algo === 'simpleHillClimbing' || state.algo === 'steepestAscentHillClimbing' || state.algo === 'localbeam' || state.algo === 'ramdomreset' || state.algo === 'stochastic') && item.h !== undefined) {
    const costDiv = document.createElement('div');
    costDiv.className = 'node-cost-sub';
    costDiv.textContent = `h = ${item.h}`;
    gridContainer.appendChild(costDiv);
  } else if ((state.algo === 'astar' || state.algo === 'idastar') && item.g !== undefined && item.h !== undefined) {
    const costDiv = document.createElement('div');
    costDiv.className = 'node-cost-sub';
    costDiv.textContent = `g = ${item.g}, h = ${item.h} (f = ${item.g + item.h})`;
    gridContainer.appendChild(costDiv);
  }

  node.appendChild(gridContainer);

  // Show parent node label
  const sep1 = document.createElement('span'); sep1.className = 'sep'; sep1.textContent = ',';
  node.appendChild(sep1);
  const parentLabel = document.createElement('span');
  parentLabel.className = 'parent-label';
  parentLabel.innerHTML = (item.parentId === null || item.parentId === undefined)
    ? '∅'
    : toLabel(item.parentId);
  node.appendChild(parentLabel);

  // Show action direction
  const sep2 = document.createElement('span'); sep2.className = 'sep'; sep2.textContent = ',';
  node.appendChild(sep2);
  const act = document.createElement('span'); act.className = 'action-letter';
  act.textContent = item.action || '—';
  node.appendChild(act);

  // Show node evaluation cost value
  const sep3 = document.createElement('span'); sep3.className = 'sep'; sep3.textContent = ',';
  node.appendChild(sep3);
  const costEl = document.createElement('span'); costEl.className = 'cost-num';
  
  let costVal = 0;
  if (['astar', 'idastar'].includes(state.algo)) {
    costVal = (item.g ?? 0) + (item.h ?? 0);
  } else if (state.algo === 'ucs') {
    costVal = item.g ?? 0;
  } else if (['greedy', 'simpleHillClimbing', 'steepestAscentHillClimbing', 'localbeam', 'ramdomreset', 'stochastic'].includes(state.algo)) {
    costVal = item.h ?? 0;
  } else {
    costVal = item.depth ?? 0;
  }

  costEl.textContent = String(costVal);
  node.appendChild(costEl);

  const close = document.createElement('span'); close.className = 'brace'; close.textContent = '}';
  node.appendChild(close);

  // Show assigned letter label for node if it exists
  if (item.id !== undefined && item.id !== null && item.id >= 0) {
    const eq = document.createElement('span'); eq.className = 'eq'; eq.textContent = '=';
    node.appendChild(eq);
    const lab = document.createElement('span'); lab.className = 'child-label';
    lab.innerHTML = toLabel(item.id);
    node.appendChild(lab);
  }

  // Add execution status tags for children expansion
  if (opts.tag) {
    const t = document.createElement('span');
    t.className = 'tag tag-' + opts.tag;
    t.textContent = opts.tagText || opts.tag.toUpperCase();
    node.appendChild(t);
  }

  return node;
}

// Render visualizer components
function renderAll() {
  renderInfo();
  renderBoard('board-start', state.start, state.editMode.start);
  renderBoard('board-goal', state.goal, state.editMode.goal);
  $('#edit-start').textContent = state.editMode.start ? 'Done' : 'Edit';
  $('#edit-goal').textContent = state.editMode.goal ? 'Done' : 'Edit';

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
  else if (run.finished && !run.success) { stat.textContent = 'FAILED'; stat.classList.add('tag-fail'); }
  else {
    if (state.algo === 'ids' && last && last.limit !== undefined) {
      stat.textContent = `running (d=${last.limit})`;
    } else if (state.algo === 'idastar' && last && last.limit !== undefined) {
      stat.textContent = `running (f=${last.limit})`;
    } else {
      stat.textContent = 'running';
    }
    stat.classList.add('tag-run');
  }
}

// Trace table rendering logic
function renderTrace() {
  const tbody = $('#trace-body');
  tbody.innerHTML = '';
  if (!state.run) return;

  state.run.steps.forEach((step, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'trace-row';
    if (idx === state.run.steps.length - 1) tr.classList.add('current');
    if (step.done && step.success) tr.classList.add('goal-row');

    // Render step index
    const tdStep = document.createElement('td');
    tdStep.className = 'col-step';
    tdStep.textContent = step.iter;
    tr.appendChild(tdStep);

    // Render popped node without color highlights
    const tdNode = document.createElement('td');
    tdNode.className = 'col-node';
    if (step.poppedNodes) {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      step.poppedNodes.forEach(pn => {
        const setNode = renderSetNotation(pn, { kind: null });
        container.appendChild(setNode);
      });
      tdNode.appendChild(container);
    } else if (step.popped) {
      const setNode = renderSetNotation(step.popped, { kind: null });
      tdNode.appendChild(setNode);
    } else {
      tdNode.textContent = '— ( empty frontier )';
    }
    tr.appendChild(tdNode);

    // Render frontier expansion list
    const tdFront = document.createElement('td');
    tdFront.className = 'col-frontier';

    if (step.limit !== undefined && (state.algo === 'ids' || state.algo === 'idastar')) {
      const limitTitle = document.createElement('div');
      limitTitle.className = 'limit-header';
      limitTitle.textContent = `${state.algo === 'ids' ? 'DEPTH LIMIT' : 'F-LIMIT'} = ${step.limit}`;
      tdFront.appendChild(limitTitle);
    }

    // Render highlighted popped node
    if (step.poppedNodes) {
      const poppedTitle = document.createElement('div');
      poppedTitle.style.color = 'var(--text-faint)';
      poppedTitle.style.fontSize = '12px';
      poppedTitle.style.marginBottom = '6px';
      poppedTitle.textContent = 'CURRENT STATES IN BEAM (EVALUATING)';
      tdFront.appendChild(poppedTitle);

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      step.poppedNodes.forEach(pn => {
        const setPopped = renderSetNotation(pn, { kind: 'popped' });
        container.appendChild(setPopped);
      });
      tdFront.appendChild(container);
    } else if (step.popped) {
      const poppedTitle = document.createElement('div');
      poppedTitle.style.color = 'var(--text-faint)';
      poppedTitle.style.fontSize = '12px';
      poppedTitle.style.marginBottom = '6px';
      poppedTitle.textContent = 'POPPED FROM FRONTIER';
      tdFront.appendChild(poppedTitle);

      const setPopped = renderSetNotation(step.popped, { kind: 'popped' });
      tdFront.appendChild(setPopped);
    }

    // Render expansion children list
    const expandTitle = document.createElement('div');
    expandTitle.style.color = 'var(--text-faint)';
    expandTitle.style.fontSize = '12px';
    expandTitle.style.marginTop = '12px';
    expandTitle.style.paddingTop = '8px';
    expandTitle.style.borderTop = '1px dashed var(--line)';
    expandTitle.style.marginBottom = '6px';
    expandTitle.textContent = 'EXPANSION ( L → R → U → D )';
    tdFront.appendChild(expandTitle);

    const list = document.createElement('div');
    list.className = 'children-list';
    if (step.expansionMessage) {
      const msg = document.createElement('div');
      msg.style.color = 'var(--bad)';
      msg.style.fontWeight = 'bold';
      msg.style.fontSize = '13px';
      msg.style.marginTop = '4px';
      msg.style.marginBottom = '8px';
      msg.style.fontStyle = 'italic';
      msg.textContent = translateMessage(step.expansionMessage);
      list.appendChild(msg);
    }
    if (step.children && step.children.length > 0) {
      step.children.forEach(ch => {
        let kind = null, tag = null, tagText = null;
        if (ch.status === 'added') { kind = 'added'; tag = 'added'; tagText = 'ADDED'; }
        if (ch.status === 'goal') { kind = 'goal'; tag = 'goal'; tagText = 'GOAL'; }
        if (ch.status === 'skipped') { kind = 'skipped'; tag = 'skipped'; tagText = 'SKIPPED ( ' + translateReason(ch.reason || '') + ' )'; }
        if (ch.status === 'cutoff') { kind = 'cutoff'; tag = 'cutoff'; tagText = 'CUTOFF ( ' + translateReason(ch.reason || '') + ' )'; }
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

    // Render reached states list
    const tdReached = document.createElement('td');
    tdReached.className = 'col-reached';
    const reachedWrap = document.createElement('div');
    reachedWrap.className = 'reached-list';
    step.reachedAfter.forEach(k => {
      const arr = k.split('').map(Number);
      const labelsSet = state.labels.get(k);
      const label = labelsSet ? Array.from(labelsSet).join(', ') : '?';
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
      lab.innerHTML = label;
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

// Solution playback rendering
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
  $('#sol-len').innerHTML = `Path length: <b>${actions.length}</b>`;
  $('#sol-actions').innerHTML = `Action sequence: <b>${actions.join(' → ') || '(already at goal)'}</b>`;

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
    const movedIndex = getMovedIndex(node.state, node.action);
    for (let j = 0; j < 9; j++) {
      const c = document.createElement('div');
      c.className = 'step-cell' + (node.state[j] === 0 ? ' blank' : '');
      if (j === movedIndex) {
        c.classList.add('moved-tile');
      }
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
  $('#btn-play-path').textContent = 'Stop Playback';
  const speed = Number($('#speed').value);
  state.playback.timer = setInterval(() => {
    state.playback.idx++;
    if (state.playback.idx >= state.playback.path.length) {
      stopPlayback();
      return;
    }
    highlightPlayback(state.playback.idx);
    $('#playback-info').textContent = `Step ${state.playback.idx} / ${state.playback.path.length - 1}`;
  }, speed);
}

function stopPlayback() {
  if (state.playback.timer) clearInterval(state.playback.timer);
  state.playback.timer = null;
  $('#btn-play-path').textContent = 'Playback Path';
}

// Info card tabs interaction
function bindInfoCardTabs() {
  const tabDetails = $('#tab-info-details');
  const tabPseudo = $('#tab-info-pseudo');
  const paneDetails = $('#pane-info-details');
  const panePseudo = $('#pane-info-pseudo');

  if (tabDetails && tabPseudo) {
    tabDetails.addEventListener('click', () => {
      tabDetails.classList.add('active');
      tabPseudo.classList.remove('active');
      paneDetails.style.display = 'block';
      panePseudo.style.display = 'none';
    });

    tabPseudo.addEventListener('click', () => {
      tabPseudo.classList.add('active');
      tabDetails.classList.remove('active');
      panePseudo.style.display = 'block';
      paneDetails.style.display = 'none';
      renderPseudocode();
    });
  }
}

// Initialization
function init() {
  bindTabs();
  bindBoardEditors();
  bindControls();
  bindInfoCardTabs();
  $('#speed-val').textContent = $('#speed').value + 'ms';
  renderAll();
  renderPseudocode();
}

function renderPseudocode() {
  const code = PSEUDOCODE[state.algo] || 'No pseudocode available.';
  $('#pseudocode-display').textContent = code;
}

document.addEventListener('DOMContentLoaded', init);
