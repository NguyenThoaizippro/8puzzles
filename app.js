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
      add Current to Reached`,

  simulatedAnnealing: `function SimulatedAnnealing(Start, Goal):
  Current = Start
  T = T0
  while T > Tmin:
    if Current == Goal:
      return Current (Success)
    Next = RandomNeighbor(Current)
    Δ = h(Next) - h(Current)
    if Δ < 0:
      Current = Next
    else:
      p = exp(-Δ / T)
      if Random(0,1) < p:
        Current = Next
    T = α * T
  return Current`,

  sensorless: `function Sensorless_Search(Start1, Start2, Goal):
  StartBelief = Set([Start1, Start2])
  Frontier = Queue/Stack/PriorityQueue([StartBelief])
  Reached = Set([StartBelief])
  while Frontier is not empty:
    BeliefNode = Frontier.pop() // strategy: BFS, DFS, A*, etc.
    if BeliefNode.state is GoalBelief: // all states in belief are Goal
      return BeliefNode (Success)
    for each Action in [L, R, U, D]:
      ChildBelief = TransitionBelief(BeliefNode.state, Action)
      if ChildBelief is not empty:
        if ChildBelief is not in Reached:
          add ChildBelief to Reached
          Frontier.push(ChildBelief)
  return Failure`
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
    .replace(/cập nhật trong frontier/g, 'updated in frontier')
    .replace(/không được chọn ngẫu nhiên/g, 'not selected randomly')
    .replace(/chấp nhận/g, 'accepted')
    .replace(/bỏ qua/g, 'skipped');
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
    .replace(/— \( hết frontier \)/g, '— (empty frontier)')
    .replace(/Dừng: Nhiệt độ giảm xuống T = ([\d.]+) ≤ Tmin = ([\d.]+)/g, 'Stopped: Temperature dropped to T = $1 ≤ Tmin = $2')
    .replace(/Dừng: Không có lân cận nào hợp lệ/g, 'Stopped: No valid neighbors');
}

const state = {
  algo: 'bfs',
  start: PRESETS.bfs.start.slice(),
  start2: PRESETS.sensorless.start2.slice(),
  goals: [ PRESETS.bfs.goal.slice() ],
  run: null,
  autoTimer: null,
  editMode: { start: false, goal: false },
  playback: { timer: null, idx: 0, path: null },
  labels: new Map(),   // map state to letter label
  gType: 'steps',
  hType: 'manhattan',
  k: 3,
  maxRestart: 5,
  t0: 100,
  tMin: 0.1,
  alpha: 0.9,
  sensorlessStrategy: 'bfs',
};

// Navigation tabs control
// Map each algo to its group
const ALGO_TO_GROUP = {
  bfs: 'group1', dfs: 'group1', ids: 'group1',
  ucs: 'group2', greedy: 'group2', astar: 'group2', idastar: 'group2',
  simpleHillClimbing: 'group3', steepestAscentHillClimbing: 'group3',
  localbeam: 'group3', ramdomreset: 'group3', stochastic: 'group3', simulatedAnnealing: 'group3',
  sensorless: 'group4'
};

function switchChromeTab(groupId) {
  $$('.chrome-tab').forEach(ct => ct.classList.toggle('active', ct.dataset.group === groupId));
  $$('.algo-subtabs').forEach(st => {
    st.style.display = st.id === groupId + '-subtabs' ? 'flex' : 'none';
  });
}

function bindTabs() {
  // Chrome group tab clicks
  $$('.chrome-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupId = btn.dataset.group;
      switchChromeTab(groupId);
      // auto-select first algo in the group that is not already active
      const firstAlgoBtn = $(`#${groupId}-subtabs .tab`);
      if (firstAlgoBtn && firstAlgoBtn.dataset.algo !== state.algo) {
        firstAlgoBtn.click();
      }
    });
  });

  // Algorithm sub-tab clicks
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.algo;
      if (algo === state.algo) return;
      state.algo = algo;
      // sync active on all .tab buttons
      $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.algo === algo));
      // sync chrome tab to correct group
      switchChromeTab(ALGO_TO_GROUP[algo]);
      state.start = PRESETS[algo].start.slice();
      if (algo === 'sensorless') {
        state.start2 = PRESETS[algo].start2.slice();
      }
      state.goals = [ PRESETS[algo].goal.slice() ];
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
  const board = inp.closest('#board-start') 
    ? 'start' 
    : 'start2';
  const idx = Number(inp.dataset.idx);
  const raw = inp.value.trim();
  let val;
  if (raw === '') val = 0;
  else if (/^[0-8]$/.test(raw)) val = Number(raw);
  else { inp.value = ''; val = 0; }
  state[board][idx] = val;
}

function onGoalCellInput(e) {
  const inp = e.target;
  const gIdx = Number(inp.dataset.gidx);
  const idx = Number(inp.dataset.idx);
  const raw = inp.value.trim();
  let val;
  if (raw === '') val = 0;
  else if (/^[0-8]$/.test(raw)) val = Number(raw);
  else { inp.value = ''; val = 0; }
  state.goals[gIdx][idx] = val;
}

function renderGoalBoards() {
  const container = document.getElementById('goals-container');
  if (!container) return;
  container.innerHTML = '';
  
  state.goals.forEach((goalStateArr, gIdx) => {
    const boardWrapper = document.createElement('div');
    boardWrapper.style.position = 'relative';
    boardWrapper.style.display = 'flex';
    boardWrapper.style.flexDirection = 'column';
    boardWrapper.style.gap = '4px';

    const label = document.createElement('span');
    label.style.fontSize = '11px';
    label.style.fontWeight = 'bold';
    label.style.color = 'var(--text-dim)';
    label.style.textAlign = 'center';
    label.textContent = `Goal ${gIdx + 1}`;
    boardWrapper.appendChild(label);

    const boardDiv = document.createElement('div');
    boardDiv.className = 'board';
    boardDiv.id = `board-goal-${gIdx}`;
    
    for (let i = 0; i < 9; i++) {
      const v = goalStateArr[i];
      const cell = document.createElement('div');
      cell.className = 'cell' + (v === 0 ? ' blank' : '');
      if (state.editMode.goal) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.value = v === 0 ? '' : String(v);
        input.dataset.gidx = String(gIdx);
        input.dataset.idx = String(i);
        input.addEventListener('input', onGoalCellInput);
        input.addEventListener('focus', () => input.select());
        cell.appendChild(input);
        cell.classList.add('editing');
      } else {
        cell.textContent = v === 0 ? '' : String(v);
      }
      boardDiv.appendChild(cell);
    }
    boardWrapper.appendChild(boardDiv);

    if (state.editMode.goal && state.goals.length > 1) {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-ghost';
      delBtn.style.position = 'absolute';
      delBtn.style.top = '14px';
      delBtn.style.right = '0px';
      delBtn.style.padding = '2px 6px';
      delBtn.style.fontSize = '14px';
      delBtn.style.color = 'var(--bad)';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', () => {
        state.goals.splice(gIdx, 1);
        resetRun();
        renderAll();
      });
      boardWrapper.appendChild(delBtn);
    }

    container.appendChild(boardWrapper);
  });

  if (state.goals.length > 1) {
    container.style.minWidth = '380px';
    $('#goal-title').textContent = `GOAL (${state.goals.map((_, i) => 'G' + (i+1)).join(', ')})`;
  } else {
    container.style.minWidth = '184px';
    $('#goal-title').textContent = 'GOAL';
  }
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

function randomWalk(goalState, steps) {
  let curr = goalState.slice();
  let prevAction = null;
  for (let i = 0; i < steps; i++) {
    const validActions = ACTION_ORDER.filter(act => {
      if (prevAction) {
        if (act === 'L' && prevAction === 'R') return false;
        if (act === 'R' && prevAction === 'L') return false;
        if (act === 'U' && prevAction === 'D') return false;
        if (act === 'D' && prevAction === 'U') return false;
      }
      return applyAction(curr, act) !== null;
    });
    if (validActions.length === 0) break;
    const chosen = validActions[Math.floor(Math.random() * validActions.length)];
    curr = applyAction(curr, chosen);
    prevAction = chosen;
  }
  return curr;
}

function bindBoardEditors() {
  $('#edit-start').addEventListener('click', () => toggleEdit('start'));
  $('#edit-goal').addEventListener('click', () => toggleEdit('goal'));
  $('#reset-start').addEventListener('click', () => {
    state.start = PRESETS[state.algo].start.slice();
    if (state.algo === 'sensorless') {
      state.start2 = PRESETS[state.algo].start2.slice();
    }
    state.editMode.start = false;
    resetRun();
    renderAll();
  });
  $('#reset-goal').addEventListener('click', () => {
    state.goals = [ PRESETS[state.algo].goal.slice() ];
    state.editMode.goal = false;
    resetRun();
    renderAll();
  });
  $('#random-start').addEventListener('click', () => {
    const baseGoal = state.goals[0];
    if (state.algo === 'sensorless') {
      state.start = randomWalk(baseGoal, 2 + Math.floor(Math.random() * 2));
      state.start2 = randomWalk(baseGoal, 2 + Math.floor(Math.random() * 2));
      let retries = 5;
      while (statesEqual(state.start, state.start2) && retries-- > 0) {
        state.start2 = randomWalk(baseGoal, 2 + Math.floor(Math.random() * 2));
      }
    } else {
      state.start = randomWalk(baseGoal, 10 + Math.floor(Math.random() * 10));
    }
    state.editMode.start = false;
    resetRun();
    renderAll();
  });
  const addGoalBtn = $('#add-goal-btn');
  if (addGoalBtn) {
    addGoalBtn.addEventListener('click', () => {
      if (state.algo !== 'sensorless') return;
      const currentLen = state.goals.length;
      if (currentLen < SENSORLESS_DEFAULT_GOALS.length) {
        state.goals.push(SENSORLESS_DEFAULT_GOALS[currentLen].slice());
      } else {
        state.goals.push(SENSORLESS_DEFAULT_GOALS[0].slice());
      }
      resetRun();
      renderAll();
    });
  }
}

function toggleEdit(which) {
  if (state.editMode[which]) {
    if (which === 'start') {
      if (!validatePuzzle(state.start)) {
        alert('Invalid state for Board 1. Board must contain digits 0-8 exactly once each (0 represents the blank space).');
        return;
      }
      if (state.algo === 'sensorless') {
        if (!validatePuzzle(state.start2)) {
          alert('Invalid state for Board 2. Board must contain digits 0-8 exactly once each.');
          return;
        }
      }
    } else {
      for (let i = 0; i < state.goals.length; i++) {
        if (!validatePuzzle(state.goals[i])) {
          alert(`Invalid state for Goal Board ${i + 1}. Each board must contain digits 0-8 exactly once.`);
          return;
        }
      }
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

  const paramRow = $('#info-param-row');
  const paramLabel = $('#info-param-label');
  const paramVal = $('#info-param-value');

  if (state.algo === 'sensorless') {
    formulaEl.textContent = 'Belief-State: ' + (state.sensorlessStrategy === 'astar' ? 'f(n) = g(n) + average h(n)' : (state.sensorlessStrategy === 'greedy' ? 'average h(n)' : 'None'));
    
    paramRow.style.display = 'grid';
    paramLabel.textContent = 'Search Strategy';
    paramVal.innerHTML = '';
    const select = document.createElement('select');
    select.className = 'formula-select';
    const strategies = [
      { value: 'bfs', name: 'BFS' },
      { value: 'dfs', name: 'DFS' },
      { value: 'astar', name: 'A* (Manhattan)' },
      { value: 'greedy', name: 'Greedy (Manhattan)' }
    ];
    strategies.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.name;
      if (opt.value === state.sensorlessStrategy) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener('change', (e) => {
      state.sensorlessStrategy = e.target.value;
      resetRun();
      renderAll();
    });
    paramVal.appendChild(select);
    return;
  }

  const hasG = ['ucs', 'astar', 'idastar'].includes(state.algo);
  const hasH = ['greedy', 'astar', 'idastar', 'simpleHillClimbing', 'steepestAscentHillClimbing', 'localbeam', 'ramdomreset', 'stochastic', 'simulatedAnnealing'].includes(state.algo);

  if (!hasG && !hasH) {
    formulaEl.textContent = 'None';
    paramRow.style.display = 'none';
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
  } else if (state.algo === 'simulatedAnnealing') {
    paramRow.style.display = 'grid';
    paramLabel.textContent = 'SA Parameters';
    paramVal.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '10px';
    container.style.flexWrap = 'wrap';

    // T0
    const divT0 = document.createElement('div');
    divT0.style.display = 'flex';
    divT0.style.flexDirection = 'column';
    divT0.style.gap = '2px';
    const labelT0 = document.createElement('label');
    labelT0.textContent = 'T0';
    labelT0.style.fontSize = '10px';
    labelT0.style.color = 'var(--text-dim)';
    const inputT0 = document.createElement('input');
    inputT0.type = 'number';
    inputT0.className = 'formula-select';
    inputT0.style.width = '60px';
    inputT0.min = '1';
    inputT0.max = '1000';
    inputT0.value = state.t0;
    inputT0.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0) val = 100;
      state.t0 = val;
      resetRun();
      renderAll();
    });
    divT0.appendChild(labelT0);
    divT0.appendChild(inputT0);
    container.appendChild(divT0);

    // Tmin
    const divTMin = document.createElement('div');
    divTMin.style.display = 'flex';
    divTMin.style.flexDirection = 'column';
    divTMin.style.gap = '2px';
    const labelTMin = document.createElement('label');
    labelTMin.textContent = 'Tmin';
    labelTMin.style.fontSize = '10px';
    labelTMin.style.color = 'var(--text-dim)';
    const inputTMin = document.createElement('input');
    inputTMin.type = 'number';
    inputTMin.step = '0.01';
    inputTMin.className = 'formula-select';
    inputTMin.style.width = '60px';
    inputTMin.min = '0.001';
    inputTMin.max = '10';
    inputTMin.value = state.tMin;
    inputTMin.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0) val = 0.1;
      state.tMin = val;
      resetRun();
      renderAll();
    });
    divTMin.appendChild(labelTMin);
    divTMin.appendChild(inputTMin);
    container.appendChild(divTMin);

    // Alpha (cooling rate)
    const divAlpha = document.createElement('div');
    divAlpha.style.display = 'flex';
    divAlpha.style.flexDirection = 'column';
    divAlpha.style.gap = '2px';
    const labelAlpha = document.createElement('label');
    labelAlpha.textContent = 'Alpha (α)';
    labelAlpha.style.fontSize = '10px';
    labelAlpha.style.color = 'var(--text-dim)';
    const inputAlpha = document.createElement('input');
    inputAlpha.type = 'number';
    inputAlpha.step = '0.01';
    inputAlpha.className = 'formula-select';
    inputAlpha.style.width = '60px';
    inputAlpha.min = '0.01';
    inputAlpha.max = '0.99';
    inputAlpha.value = state.alpha;
    inputAlpha.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0 || val >= 1) val = 0.9;
      state.alpha = val;
      resetRun();
      renderAll();
    });
    divAlpha.appendChild(labelAlpha);
    divAlpha.appendChild(inputAlpha);
    container.appendChild(divAlpha);

    paramVal.appendChild(container);
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
  if (!validatePuzzle(state.start)) {
    alert('Start state is invalid.');
    return false;
  }
  if (state.algo === 'sensorless') {
    if (!validatePuzzle(state.start2)) {
      alert('Start 2 state is invalid.');
      return false;
    }
  }
  for (let i = 0; i < state.goals.length; i++) {
    if (!validatePuzzle(state.goals[i])) {
      alert(`Goal state ${i + 1} is invalid.`);
      return false;
    }
  }
  let gen;
  const goalsToPass = state.goals;
  if (state.algo === 'localbeam') {
    gen = ALGORITHMS[state.algo](state.start.slice(), goalsToPass, state.gType, state.hType, state.k);
  } else if (state.algo === 'ramdomreset') {
    gen = ALGORITHMS[state.algo](state.start.slice(), goalsToPass, state.gType, state.hType, state.maxRestart);
  } else if (state.algo === 'simulatedAnnealing') {
    gen = ALGORITHMS[state.algo](state.start.slice(), goalsToPass, state.gType, state.hType, state.t0, state.tMin, state.alpha);
  } else if (state.algo === 'sensorless') {
    gen = ALGORITHMS[state.algo](state.start.slice(), state.start2.slice(), goalsToPass, state.sensorlessStrategy, state.hType);
  } else {
    gen = ALGORITHMS[state.algo](state.start.slice(), goalsToPass, state.gType, state.hType);
  }
  state.run = {
    gen, steps: [], finished: false, success: false, goalNode: null,
    finalReached: [],
  };
  state.playback = { timer: null, idx: 0, path: null };
  state.labels = new Map();
  return true;
}

function getAnyStateKey(s) {
  if (Array.isArray(s) && Array.isArray(s[0])) {
    return s.map(x => x.join('')).sort().join('|');
  }
  return s.join('');
}

function trackLabels(step) {
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
        addLabel(getAnyStateKey(pn.state), toLabel(pn.id));
      }
    });
  }
  if (step.popped && step.popped.id !== undefined && step.popped.id >= 0) {
    addLabel(getAnyStateKey(step.popped.state), toLabel(step.popped.id));
  }
  (step.children || []).forEach(c => {
    if (c.state && c.id !== undefined && c.id >= 0) {
      addLabel(getAnyStateKey(c.state), toLabel(c.id));
    }
  });
  (step.frontierBefore || []).forEach(n => {
    if (n.state && n.id !== undefined && n.id >= 0) {
      addLabel(getAnyStateKey(n.state), toLabel(n.id));
    }
  });
  (step.frontierAfter || []).forEach(n => {
    if (n.id !== undefined && n.id >= 0) {
      addLabel(getAnyStateKey(n.state), toLabel(n.id));
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
  const blankIndex = arr.indexOf(0);
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'mini-cell' + (arr[i] === 0 ? ' blank' : '');
    if (opts.movedIndex !== undefined && opts.movedIndex !== -1 && i === blankIndex) {
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

  const isBeliefState = Array.isArray(item.state) && Array.isArray(item.state[0]);

  if (isBeliefState) {
    const open = document.createElement('span'); open.className = 'brace'; open.textContent = '{';
    node.appendChild(open);

    const statesContainer = document.createElement('div');
    statesContainer.className = 'belief-states-container';
    statesContainer.style.display = 'inline-flex';
    statesContainer.style.gap = '6px';
    statesContainer.style.alignItems = 'center';
    statesContainer.style.verticalAlign = 'middle';

    item.state.forEach((s, sIdx) => {
      const gridContainer = document.createElement('div');
      gridContainer.className = 'grid-container-with-cost';
      const movedIndex = getMovedIndex(s, item.action);
      gridContainer.appendChild(miniBoard(s, { movedIndex }));
      statesContainer.appendChild(gridContainer);
      if (sIdx < item.state.length - 1) {
        const comma = document.createElement('span'); comma.className = 'sep'; comma.textContent = ',';
        statesContainer.appendChild(comma);
      }
    });
    node.appendChild(statesContainer);

    const close = document.createElement('span'); close.className = 'brace'; close.textContent = '}';
    node.appendChild(close);

  } else {
    const open = document.createElement('span'); open.className = 'brace'; open.textContent = '{';
    node.appendChild(open);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container-with-cost';
    const movedIndex = getMovedIndex(item.state, item.action);
    gridContainer.appendChild(miniBoard(item.state, { movedIndex }));

    if (state.algo === 'ucs' && item.g !== undefined) {
      const costDiv = document.createElement('div');
      costDiv.className = 'node-cost-sub';
      costDiv.textContent = `g = ${item.g}`;
      gridContainer.appendChild(costDiv);
    } else if ((state.algo === 'greedy' || state.algo === 'simpleHillClimbing' || state.algo === 'steepestAscentHillClimbing' || state.algo === 'localbeam' || state.algo === 'ramdomreset' || state.algo === 'stochastic' || state.algo === 'simulatedAnnealing') && item.h !== undefined) {
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

    const close = document.createElement('span'); close.className = 'brace'; close.textContent = '}';
    node.appendChild(close);
  }

  // Show parent node label, action, and cost (simplified for Node column popped node)
  const isSimple = state.algo === 'sensorless' && opts.kind === null;
  if (!isSimple) {
    const sep1 = document.createElement('span'); sep1.className = 'sep'; sep1.textContent = ',';
    node.appendChild(sep1);
    const parentLabel = document.createElement('span');
    parentLabel.className = 'parent-label';
    parentLabel.innerHTML = (item.parentId === null || item.parentId === undefined)
      ? '∅'
      : toLabel(item.parentId);
    node.appendChild(parentLabel);

    const sep2 = document.createElement('span'); sep2.className = 'sep'; sep2.textContent = ',';
    node.appendChild(sep2);
    const act = document.createElement('span'); act.className = 'action-letter';
    act.textContent = item.action || '—';
    node.appendChild(act);

    const sep3 = document.createElement('span'); sep3.className = 'sep'; sep3.textContent = ',';
    node.appendChild(sep3);
    const costEl = document.createElement('span'); costEl.className = 'cost-num';

    let costVal = 0;
    if (state.algo === 'sensorless') {
      if (state.sensorlessStrategy === 'astar') {
        costVal = Math.round((item.g ?? 0) + (item.h ?? 0));
      } else if (state.sensorlessStrategy === 'greedy') {
        costVal = Math.round(item.h ?? 0);
      } else {
        costVal = item.depth ?? 0;
      }
    } else if (['astar', 'idastar'].includes(state.algo)) {
      costVal = (item.g ?? 0) + (item.h ?? 0);
    } else if (state.algo === 'ucs') {
      costVal = item.g ?? 0;
    } else if (['greedy', 'simpleHillClimbing', 'steepestAscentHillClimbing', 'localbeam', 'ramdomreset', 'stochastic', 'simulatedAnnealing'].includes(state.algo)) {
      costVal = item.h ?? 0;
    } else {
      costVal = item.depth ?? 0;
    }

    costEl.textContent = String(costVal);
    node.appendChild(costEl);
  }

  if (!isSimple) {
    const close = document.createElement('span'); close.className = 'brace'; close.textContent = '}';
    node.appendChild(close);
  }

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
  if (state.algo === 'sensorless') {
    $('#board-start-2').style.display = 'grid';
    renderBoard('board-start-2', state.start2, state.editMode.start);
    $('#start-title').textContent = 'START (S1, S2)';
  } else {
    $('#board-start-2').style.display = 'none';
    $('#start-title').textContent = 'START';
  }
  renderGoalBoards();
  $('#edit-start').textContent = state.editMode.start ? 'Done' : 'Edit';
  $('#edit-goal').textContent = state.editMode.goal ? 'Done' : 'Edit';

  const addGoalBtn = $('#add-goal-btn');
  if (addGoalBtn) {
    addGoalBtn.style.display = (state.editMode.goal && state.algo === 'sensorless') ? 'inline-block' : 'none';
  }

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
}

// Trace table rendering logic
function renderTrace() {
  const tbody = $('#trace-body');
  tbody.innerHTML = '';
  if (!state.run) return;

  let prevReachedSet = new Set();

  state.run.steps.forEach((step, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'trace-row';
    if (idx === state.run.steps.length - 1) tr.classList.add('current');
    if (step.done && step.success) tr.classList.add('goal-row');

    // Compute newly added reached items (diff from previous step)
    const currentReachedSet = new Set(step.reachedAfter);
    const newReachedItems = step.reachedAfter.filter(k => !prevReachedSet.has(k));
    prevReachedSet = currentReachedSet;

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
        if (ch.status === 'added') { kind = 'added'; tag = null; tagText = null; }
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

    // Render reached states list (only newly added items)
    const tdReached = document.createElement('td');
    tdReached.className = 'col-reached';
    const reachedWrap = document.createElement('div');
    reachedWrap.className = 'reached-list';
    newReachedItems.forEach(k => {
      if (k.includes('|') || state.algo === 'sensorless') {
        const beliefBox = document.createElement('div');
        beliefBox.className = 'reached-belief-box';

        const open = document.createElement('span'); open.style.fontWeight = 'bold'; open.textContent = '{';
        beliefBox.appendChild(open);

        const stateKeys = k.split('|');
        stateKeys.forEach((sk, sIdx) => {
          const arr = sk.split('').map(Number);
          beliefBox.appendChild(miniBoard(arr));
          if (sIdx < stateKeys.length - 1) {
            const comma = document.createElement('span'); comma.textContent = ',';
            beliefBox.appendChild(comma);
          }
        });

        const close = document.createElement('span'); close.style.fontWeight = 'bold'; close.textContent = '}';
        beliefBox.appendChild(close);

        const labelsSet = state.labels.get(k);
        if (labelsSet) {
          const label = Array.from(labelsSet).join(', ');
          const lab = document.createElement('span');
          lab.className = 'reached-label';
          lab.innerHTML = `= ${label}`;
          beliefBox.appendChild(lab);
        }

        reachedWrap.appendChild(beliefBox);
      } else {
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
      }
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

    const isBeliefState = Array.isArray(node.state) && Array.isArray(node.state[0]);
    if (isBeliefState) {
      const wrapper = document.createElement('div');
      wrapper.className = 'belief-solution-wrapper';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '4px';
      wrapper.style.alignItems = 'center';
      wrapper.style.border = '1px solid var(--line)';
      wrapper.style.borderRadius = '4px';
      wrapper.style.padding = '4px';
      wrapper.style.background = '#ffffff';

      const boardsContainer = document.createElement('div');
      boardsContainer.style.display = 'flex';
      boardsContainer.style.gap = '4px';

      node.state.forEach(s => {
        const board = document.createElement('div');
        board.className = 'step-board';
        const movedIndex = getMovedIndex(s, node.action);
        const blankIndex = s.indexOf(0);
        for (let j = 0; j < 9; j++) {
          const c = document.createElement('div');
          c.className = 'step-cell' + (s[j] === 0 ? ' blank' : '');
          if (movedIndex !== -1 && j === blankIndex) {
            c.classList.add('moved-tile');
          }
          c.textContent = s[j] === 0 ? '' : String(s[j]);
          board.appendChild(c);
        }
        boardsContainer.appendChild(board);
      });
      wrapper.appendChild(boardsContainer);
      stepDiv.appendChild(wrapper);
    } else {
      const board = document.createElement('div');
      board.className = 'step-board';
      const movedIndex = getMovedIndex(node.state, node.action);
      const blankIndex = node.state.indexOf(0);
      for (let j = 0; j < 9; j++) {
        const c = document.createElement('div');
        c.className = 'step-cell' + (node.state[j] === 0 ? ' blank' : '');
        if (movedIndex !== -1 && j === blankIndex) {
          c.classList.add('moved-tile');
        }
        c.textContent = node.state[j] === 0 ? '' : String(node.state[j]);
        board.appendChild(c);
      }
      stepDiv.appendChild(board);
    }

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
  initResizer();
  $('#speed-val').textContent = $('#speed').value + 'ms';
  renderAll();
  renderPseudocode();
}

function renderPseudocode() {
  const code = PSEUDOCODE[state.algo] || 'No pseudocode available.';
  $('#pseudocode-display').textContent = code;
}

// ── Resizable Panel Divider ──
function initResizer() {
  const handle    = $('#resize-handle');
  const leftPanel = $('#left-panel');
  if (!handle || !leftPanel) return;

  const DEFAULT_WIDTH = 340;  // px — initial panel width
  const DEFAULT_CELL  = 40;   // px — initial cell size (70% of 56)
  const MIN_WIDTH = 240;      // px — left panel minimum (fits 2×board + gap)
  const MAX_WIDTH = 600;      // px — left panel maximum
  const MIN_CELL  = 26;       // px — cell minimum
  const MAX_CELL  = 60;       // px — cell maximum

  function applyWidth(newWidth) {
    // clamp panel width
    const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth));
    leftPanel.style.width = w + 'px';

    // scale board cell proportionally
    const cellSize = Math.round(DEFAULT_CELL * (w / DEFAULT_WIDTH));
    const clampedCell = Math.min(MAX_CELL, Math.max(MIN_CELL, cellSize));
    leftPanel.style.setProperty('--board-cell', clampedCell + 'px');
  }

  let dragging = false;
  let startX   = 0;
  let startW   = 0;

  handle.addEventListener('mousedown', (e) => {
    dragging = true;
    startX   = e.clientX;
    startW   = leftPanel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    applyWidth(startW + (e.clientX - startX));
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  // Touch support
  handle.addEventListener('touchstart', (e) => {
    dragging = true;
    startX   = e.touches[0].clientX;
    startW   = leftPanel.offsetWidth;
    handle.classList.add('dragging');
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    applyWidth(startW + (e.touches[0].clientX - startX));
  }, { passive: false });

  document.addEventListener('touchend', () => {
    dragging = false;
    handle.classList.remove('dragging');
  });
}

document.addEventListener('DOMContentLoaded', init);
