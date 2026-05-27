function makeNode(state, parent = null, action = null, depth = 0, g = 0, h = 0, id = -1) {
  return {
    state, parent, action, depth, g, h, id,
    parentId: parent ? parent.id : null,
  };
}

function tracePath(node) {
  const path = [];
  let n = node;
  while (n) { path.unshift(n); n = n.parent; }
  return path;
}

function snapshotFrontier(frontier) {
  return frontier.map(n => ({
    state: n.state.slice(),
    action: n.action,
    depth: n.depth,
    g: n.g,
    h: n.h,
    id: n.id,
    parentId: n.parentId,
  }));
}

function snapshotPopped(node) {
  if (!node) return null;
  return {
    state: node.state.slice(),
    action: node.action,
    depth: node.depth,
    g: node.g,
    h: node.h,
    id: node.id,
    parentId: node.parentId,
  };
}

function snapshotReached(reachedSet) {
  return Array.from(reachedSet);
}

function popMinFIFO(frontier, key) {
  let minI = 0;
  for (let i = 1; i < frontier.length; i++) {
    if (key(frontier[i]) < key(frontier[minI])) minI = i;
  }
  return { node: frontier.splice(minI, 1)[0], index: minI };
}

/* ---------- BFS ---------- */
function* bfs(start, goal) {
  let nextId = 0;
  const startNode = makeNode(start, null, null, 0, 0, 0, nextId++);
  if (statesEqual(start, goal)) {
    yield {
      iter: 0, popped: snapshotPopped(startNode), poppedIndex: 0,
      children: [], frontierBefore: [snapshotPopped(startNode)],
      frontierAfter: [], reachedAfter: [stateKey(start)],
      done: true, success: true, goalNode: startNode,
    };
    return;
  }
  const frontier = [startNode];
  const reached = new Set([stateKey(start)]);
  let iter = 0;

  while (frontier.length) {
    iter++;
    const frontierBefore = snapshotFrontier(frontier);
    const node = frontier.shift();                    // FIFO
    const poppedIndex = 0;
    const children = [];
    let goalNode = null;

    for (const action of ACTION_ORDER) {
      const ns = applyAction(node.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
        continue;
      }
      const k = stateKey(ns);
      if (statesEqual(ns, goal)) {
        const childNode = makeNode(ns, node, action, node.depth + 1, 0, 0, nextId++);
        children.push({
          action, state: ns, status: 'goal', reason: 'TRÙNG GOAL',
          node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
        });
        goalNode = childNode;
        break;
      }
      if (reached.has(k)) {
        children.push({
          action, state: ns, status: 'skipped',
          reason: 'đã trong reached', depth: node.depth + 1, parentId: node.id,
        });
        continue;
      }
      const childNode = makeNode(ns, node, action, node.depth + 1, 0, 0, nextId++);
      reached.add(k);
      frontier.push(childNode);
      children.push({
        action, state: ns, status: 'added', reason: 'thêm vào frontier',
        node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
      });
    }

    yield {
      iter, popped: snapshotPopped(node), poppedIndex,
      children, frontierBefore,
      frontierAfter: snapshotFrontier(frontier),
      reachedAfter: snapshotReached(reached),
      done: !!goalNode, success: !!goalNode, goalNode,
    };

    if (goalNode) return;
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: snapshotReached(reached),
    done: true, success: false, goalNode: null,
  };
}

/* ---------- DFS ---------- */
function* dfs(start, goal) {
  let nextId = 0;
  const startNode = makeNode(start, null, null, 0, 0, 0, nextId++);
  if (statesEqual(start, goal)) {
    yield {
      iter: 0, popped: snapshotPopped(startNode), poppedIndex: 0,
      children: [], frontierBefore: [snapshotPopped(startNode)],
      frontierAfter: [], reachedAfter: [stateKey(start)],
      done: true, success: true, goalNode: startNode,
    };
    return;
  }
  const frontier = [startNode];
  const reached = new Set([stateKey(start)]);
  let iter = 0;

  while (frontier.length) {
    iter++;
    const frontierBefore = snapshotFrontier(frontier);
    const node = frontier.pop();                       // LIFO
    const poppedIndex = frontier.length;               // vị trí ban đầu = top of stack
    const children = [];
    let goalNode = null;

    for (const action of ACTION_ORDER) {
      const ns = applyAction(node.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
        continue;
      }
      const k = stateKey(ns);
      if (statesEqual(ns, goal)) {
        const childNode = makeNode(ns, node, action, node.depth + 1, 0, 0, nextId++);
        children.push({
          action, state: ns, status: 'goal', reason: 'TRÙNG GOAL',
          node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
        });
        goalNode = childNode;
        break;
      }
      const inFrontier = frontier.some(f => stateKey(f.state) === k);
      if (reached.has(k) || inFrontier) {
        children.push({
          action, state: ns, status: 'skipped',
          reason: reached.has(k) ? 'đã trong reached' : 'đã trong frontier',
          depth: node.depth + 1, parentId: node.id,
        });
        continue;
      }
      const childNode = makeNode(ns, node, action, node.depth + 1, 0, 0, nextId++);
      reached.add(k);
      frontier.push(childNode);
      children.push({
        action, state: ns, status: 'added', reason: 'thêm vào frontier',
        node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
      });
    }

    yield {
      iter, popped: snapshotPopped(node), poppedIndex,
      children, frontierBefore,
      frontierAfter: snapshotFrontier(frontier),
      reachedAfter: snapshotReached(reached),
      done: !!goalNode, success: !!goalNode, goalNode,
    };

    if (goalNode) return;
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: snapshotReached(reached),
    done: true, success: false, goalNode: null,
  };
}

/* ---------- UCS ---------- */
function* ucs(start, goal) {
  let nextId = 0;
  const startNode = makeNode(start, null, null, 0, 0, 0, nextId++);
  const frontier = [startNode];
  const reached = new Set();
  let iter = 0;

  while (frontier.length) {
    iter++;
    const frontierBefore = snapshotFrontier(frontier);
    const popped = popMinFIFO(frontier, n => n.g);
    const node = popped.node;
    const poppedIndex = popped.index;
    const children = [];

    // Goal test khi POP ( late goal test )
    if (statesEqual(node.state, goal)) {
      reached.add(stateKey(node.state));
      yield {
        iter, popped: snapshotPopped(node), poppedIndex,
        children: [], frontierBefore,
        frontierAfter: snapshotFrontier(frontier),
        reachedAfter: snapshotReached(reached),
        done: true, success: true, goalNode: node,
      };
      return;
    }

    reached.add(stateKey(node.state));

    for (const action of ACTION_ORDER) {
      const ns = applyAction(node.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
        continue;
      }
      const k = stateKey(ns);
      const childG = node.g + misplacedCount(ns, goal);
      const inFrontier = frontier.some(f => stateKey(f.state) === k);
      if (reached.has(k) || inFrontier) {
        children.push({
          action, state: ns, status: 'skipped',
          reason: reached.has(k) ? 'đã trong reached' : 'đã trong frontier',
          g: childG, depth: node.depth + 1, parentId: node.id,
        });
        continue;
      }
      const childNode = makeNode(ns, node, action, node.depth + 1, childG, 0, nextId++);
      frontier.push(childNode);
      children.push({
        action, state: ns, status: 'added',
        reason: `thêm vào frontier ( g = ${node.g} + ${childG - node.g} = ${childG} )`,
        g: childG, depth: childNode.depth, id: childNode.id, parentId: node.id, node: childNode,
      });
    }

    yield {
      iter, popped: snapshotPopped(node), poppedIndex,
      children, frontierBefore,
      frontierAfter: snapshotFrontier(frontier),
      reachedAfter: snapshotReached(reached),
      done: false, success: false, goalNode: null,
    };
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: snapshotReached(reached),
    done: true, success: false, goalNode: null,
  };
}

/* ---------- GREEDY ---------- */
function* greedy(start, goal) {
  let nextId = 0;
  const startH = manhattanDistance(start, goal);
  const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);
  const frontier = [startNode];
  const reached = new Set();
  let iter = 0;

  while (frontier.length) {
    iter++;
    const frontierBefore = snapshotFrontier(frontier);
    const popped = popMinFIFO(frontier, n => n.h);
    const node = popped.node;
    const poppedIndex = popped.index;
    const children = [];

    if (statesEqual(node.state, goal)) {
      reached.add(stateKey(node.state));
      yield {
        iter, popped: snapshotPopped(node), poppedIndex,
        children: [], frontierBefore,
        frontierAfter: snapshotFrontier(frontier),
        reachedAfter: snapshotReached(reached),
        done: true, success: true, goalNode: node,
      };
      return;
    }

    reached.add(stateKey(node.state));

    for (const action of ACTION_ORDER) {
      const ns = applyAction(node.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
        continue;
      }
      const k = stateKey(ns);
      const childH = manhattanDistance(ns, goal);
      const inFrontier = frontier.some(f => stateKey(f.state) === k);
      if (reached.has(k) || inFrontier) {
        children.push({
          action, state: ns, status: 'skipped',
          reason: reached.has(k) ? 'đã trong reached' : 'đã trong frontier',
          h: childH, depth: node.depth + 1, parentId: node.id,
        });
        continue;
      }
      const childNode = makeNode(ns, node, action, node.depth + 1, 0, childH, nextId++);
      frontier.push(childNode);
      children.push({
        action, state: ns, status: 'added',
        reason: `thêm vào frontier ( h = ${childH} )`,
        h: childH, depth: childNode.depth, id: childNode.id, parentId: node.id, node: childNode,
      });
    }

    yield {
      iter, popped: snapshotPopped(node), poppedIndex,
      children, frontierBefore,
      frontierAfter: snapshotFrontier(frontier),
      reachedAfter: snapshotReached(reached),
      done: false, success: false, goalNode: null,
    };
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: snapshotReached(reached),
    done: true, success: false, goalNode: null,
  };
}

/* ---------- IDS HELPERS ---------- */
function isCycle(node) {
  let curr = node.parent;
  while (curr) {
    if (statesEqual(curr.state, node.state)) return true;
    curr = curr.parent;
  }
  return false;
}

function getPathKeys(node) {
  const keys = [];
  let curr = node;
  while (curr) {
    keys.unshift(stateKey(curr.state));
    curr = curr.parent;
  }
  return keys;
}

/* ---------- IDS ---------- */
function* ids(start, goal) {
  let nextId = 0;
  let iter = 0;

  for (let limit = 0; limit < 100; limit++) {
    const startNode = makeNode(start, null, null, 0, 0, 0, nextId++);
    const frontier = [startNode];
    let anyCutoff = false;

    while (frontier.length > 0) {
      iter++;
      const frontierBefore = snapshotFrontier(frontier);
      const node = frontier.pop();                       // LIFO
      const poppedIndex = frontier.length;               // top of stack
      const children = [];

      const reachedAfter = getPathKeys(node);

      if (statesEqual(node.state, goal)) {
        yield {
          iter, popped: snapshotPopped(node), poppedIndex,
          children: [], frontierBefore,
          frontierAfter: snapshotFrontier(frontier),
          reachedAfter,
          done: true, success: true, goalNode: node,
          limit,
        };
        return;
      }

      if (node.depth >= limit) {
        anyCutoff = true;
        yield {
          iter, popped: snapshotPopped(node), poppedIndex,
          children: [], frontierBefore,
          frontierAfter: snapshotFrontier(frontier),
          reachedAfter,
          done: false, success: false, goalNode: null,
          limit,
          expansionMessage: `Không mở rộng: Đạt giới hạn độ sâu (depth ≥ ${limit})`,
        };
      } else if (isCycle(node)) {
        yield {
          iter, popped: snapshotPopped(node), poppedIndex,
          children: [], frontierBefore,
          frontierAfter: snapshotFrontier(frontier),
          reachedAfter,
          done: false, success: false, goalNode: null,
          limit,
          expansionMessage: `Không mở rộng: Tạo chu trình (trùng với tổ tiên)`,
        };
      } else {
        // Expand node
        for (const action of ACTION_ORDER) {
          const ns = applyAction(node.state, action);
          if (ns === null) {
            children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
            continue;
          }
          const k = stateKey(ns);
          const inPath = reachedAfter.includes(k);
          const inFrontier = frontier.some(f => stateKey(f.state) === k);
          if (inPath || inFrontier) {
            children.push({
              action, state: ns, status: 'skipped',
              reason: inPath ? 'đã trong reached' : 'đã trong frontier',
              depth: node.depth + 1, parentId: node.id,
            });
            continue;
          }
          const childNode = makeNode(ns, node, action, node.depth + 1, 0, 0, nextId++);
          frontier.push(childNode);
          children.push({
            action, state: ns, status: 'added', reason: 'thêm vào frontier',
            node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
          });
        }

        yield {
          iter, popped: snapshotPopped(node), poppedIndex,
          children, frontierBefore,
          frontierAfter: snapshotFrontier(frontier),
          reachedAfter,
          done: false, success: false, goalNode: null,
          limit,
        };
      }
    }

    // If DLS completed and no cutoff occurred, then the goal is not reachable.
    if (!anyCutoff) {
      yield {
        iter: iter + 1, popped: null, poppedIndex: -1,
        children: [], frontierBefore: [], frontierAfter: [],
        reachedAfter: [],
        done: true, success: false, goalNode: null,
        limit,
      };
      return;
    }
  }

  // Safety exit
  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: [],
    done: true, success: false, goalNode: null,
    limit: 100,
  };
}

const ALGORITHMS = { bfs, dfs, ids, ucs, greedy };
