const ACTION_ORDER = ['L', 'R', 'U', 'D'];

const ACTION_DELTA = {
  L: { dr: 0, dc: -1 },
  R: { dr: 0, dc: 1 },
  U: { dr: -1, dc: 0 },
  D: { dr: 1, dc: 0 },
};

function blankIndex(state) {
  return state.indexOf(0);
}

function rcOf(idx) {
  return { r: Math.floor(idx / 3), c: idx % 3 };
}

function idxOf(r, c) {
  return r * 3 + c;
}

function cloneState(state) {
  return state.slice();
}

function stateKey(state) {
  return state.join('');
}

function statesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Apply action — return new state, or null if invalid. */
function applyAction(state, action) {
  const bi = blankIndex(state);
  const { r, c } = rcOf(bi);
  const { dr, dc } = ACTION_DELTA[action];
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr > 2 || nc < 0 || nc > 2) return null;
  const ni = idxOf(nr, nc);
  const next = cloneState(state);
  next[bi] = next[ni];
  next[ni] = 0;
  return next;
}

/** Đếm số ô (≠ blank) sai vị trí so với goal. */
function misplacedCount(state, goal) {
  let c = 0;
  for (let i = 0; i < 9; i++) {
    if (state[i] !== 0 && state[i] !== goal[i]) c++;
  }
  return c;
}

/** Tổng Manhattan distance |Δrow|+|Δcol| cho mọi ô non-blank. */
function manhattanDistance(state, goal) {
  const goalPos = new Map();
  for (let i = 0; i < 9; i++) goalPos.set(goal[i], rcOf(i));
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const v = state[i];
    if (v === 0) continue;
    const cur = rcOf(i);
    const gp = goalPos.get(v);
    sum += Math.abs(cur.r - gp.r) + Math.abs(cur.c - gp.c);
  }
  return sum;
}

/** Kiểm tra puzzle có solvable không (8-puzzle: inversion count chẵn). */
function isSolvable(state, goal) {
  // Cho phép goal tuỳ ý — so sánh permutation parity.
  const pos = new Map();
  for (let i = 0; i < 9; i++) pos.set(goal[i], i);
  // ánh xạ về dạng "goal là 1..8,0" để đếm nghịch thế
  const mapped = state.filter(v => v !== 0).map(v => pos.get(v));
  let inv = 0;
  for (let i = 0; i < mapped.length; i++) {
    for (let j = i + 1; j < mapped.length; j++) {
      if (mapped[i] > mapped[j]) inv++;
    }
  }
  return inv % 2 === 0;
}

/* ============================================================
   PRESETS — Start/Goal mặc định cho mỗi thuật toán,
            đảm bảo path ngắn nhất = 2 bước (2 actions).
============================================================ */
const GOAL_DEFAULT = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const PRESETS = {
  // Start: blank ở (1,1). Goal: blank ở (2,2). 2 bước: D, R.
  bfs: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  dfs: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  ids: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  ucs: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  greedy: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  astar: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  idastar: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  simpleHillClimbing: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
  steepestAscentHillClimbing: { start: [1, 2, 3, 4, 0, 6, 7, 5, 8], goal: [1, 2, 3, 4, 5, 6, 7, 8, 0] },
};

const ALGO_META = {
  bfs: { name: 'BFS', formula: 'Không có ( duyệt theo bề rộng, frontier = FIFO )' },
  dfs: { name: 'DFS', formula: 'Không có ( duyệt theo chiều sâu, frontier = LIFO )' },
  ids: { name: 'IDS', formula: 'Duyệt sâu dần ( DLS với limit = 0, 1, 2... )' },
  ucs: { name: 'UCS', formula: 'g( child ) = g( parent ) + số ô sai của child' },
  greedy: { name: 'Greedy', formula: 'h( n ) = Σ Manhattan |Δrow| + |Δcol|  ( trừ blank )' },
  astar: { name: 'A*', formula: 'f( n ) = g( n ) + h( n )  ( g = số ô sai cả blank, h = Manhattan )' },
  idastar: { name: 'IDA*', formula: 'f( n ) = g( n ) + h( n )  ( g = depth, h = Manhattan, giới hạn theo f )' },
  simpleHillClimbing: { name: 'Leo núi đơn giản', formula: 'h( n ) = Σ Manhattan |Δrow| + |Δcol| (chọn lân cận đầu tiên tốt hơn)' },
  steepestAscentHillClimbing: { name: 'Leo dốc nhất', formula: 'h( n ) = Σ Manhattan |Δrow| + |Δcol| (chọn lân cận tốt nhất trong tất cả)' },
};

function getStepCost(stateArr, goalArr, parentStateArr, gType) {
  if (gType === 'steps') {
    return 1;
  }
  if (gType === 'manhattan') {
    return manhattanDistance(stateArr, goalArr);
  }
  if (gType === 'misplaced') {
    return misplacedCount(stateArr, goalArr);
  }
  if (gType === 'swap') {
    if (!parentStateArr) return 0;
    const parentBi = parentStateArr.indexOf(0);
    return stateArr[parentBi];
  }
  return 1;
}

function getHValue(stateArr, goalArr, parentStateArr, hType) {
  if (hType === 'manhattan') {
    return manhattanDistance(stateArr, goalArr);
  }
  if (hType === 'misplaced') {
    return misplacedCount(stateArr, goalArr);
  }
  if (hType === 'swap') {
    if (!parentStateArr) return 0;
    const parentBi = parentStateArr.indexOf(0);
    return stateArr[parentBi];
  }
  return manhattanDistance(stateArr, goalArr);
}
