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

// Breadth-First Search (BFS)
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
    const node = frontier.shift(); // FIFO queue pop
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

// Depth-First Search (DFS)
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
    const node = frontier.pop(); // LIFO stack pop
    const poppedIndex = frontier.length; // Pop index from top of stack
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

// Uniform Cost Search (UCS)
function* ucs(start, goal, gType = 'steps', hType = 'manhattan') {
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

    // Goal test on pop
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
      const childG = node.g + getStepCost(ns, goal, node.state, gType);
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

// Greedy Best-First Search
function* greedy(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  const startH = getHValue(start, goal, null, hType);
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
      const childH = getHValue(ns, goal, node.state, hType);
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

// Iterative Deepening Search helpers
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

// Iterative Deepening Search (IDS)
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
      const node = frontier.pop(); // LIFO stack pop
      const poppedIndex = frontier.length; // Pop index from top of stack
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
        // Expand current node
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

// A* Search
function misplacedCountWithBlank(state, goal) {
  let c = 0;
  for (let i = 0; i < 9; i++) {
    if (state[i] !== goal[i]) c++;
  }
  return c;
}

function* astar(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  const startH = getHValue(start, goal, null, hType);
  const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);
  const frontier = [startNode];
  const reached = new Map();
  let iter = 0;

  while (frontier.length) {
    iter++;
    const frontierBefore = snapshotFrontier(frontier);
    const popped = popMinFIFO(frontier, n => n.g + n.h);
    const node = popped.node;
    const poppedIndex = popped.index;
    const children = [];

    // Goal test on pop
    if (statesEqual(node.state, goal)) {
      reached.set(stateKey(node.state), node);
      yield {
        iter, popped: snapshotPopped(node), poppedIndex,
        children: [], frontierBefore,
        frontierAfter: snapshotFrontier(frontier),
        reachedAfter: Array.from(reached.keys()),
        done: true, success: true, goalNode: node,
      };
      return;
    }

    reached.set(stateKey(node.state), node);

    for (const action of ACTION_ORDER) {
      const ns = applyAction(node.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
        continue;
      }
      const k = stateKey(ns);
      const childH = getHValue(ns, goal, node.state, hType);
      const moveCost = getStepCost(ns, goal, node.state, gType);
      const childG = node.g + moveCost;

      // If child is already in reached
      if (reached.has(k)) {
        const existingNode = reached.get(k);
        if (childG >= existingNode.g) {
          children.push({
            action, state: ns, status: 'skipped',
            reason: `đã trong reached (g_new = ${childG} ≥ g_old = ${existingNode.g})`,
            g: childG, h: childH, depth: node.depth + 1, parentId: node.id,
          });
          continue;
        } else {
          // Remove from reached and add back to frontier
          reached.delete(k);
          const childNode = makeNode(ns, node, action, node.depth + 1, childG, childH, nextId++);
          frontier.push(childNode);
          children.push({
            action, state: ns, status: 'added',
            reason: `cập nhật từ reached (g_new = ${childG} < g_old = ${existingNode.g})`,
            g: childG, h: childH, depth: childNode.depth, id: childNode.id, parentId: node.id, node: childNode,
          });
          continue;
        }
      }

      // If child is already in frontier
      const frontierIndex = frontier.findIndex(f => stateKey(f.state) === k);
      if (frontierIndex !== -1) {
        const existingNode = frontier[frontierIndex];
        if (childG < existingNode.g) {
          // Update path cost and parent reference
          existingNode.g = childG;
          existingNode.h = childH;
          existingNode.parent = node;
          existingNode.parentId = node.id;
          existingNode.depth = node.depth + 1;
          children.push({
            action, state: ns, status: 'added',
            reason: `cập nhật trong frontier (g_new = ${childG} < g_old = ${existingNode.g})`,
            g: childG, h: childH, depth: existingNode.depth, id: existingNode.id, parentId: node.id, node: existingNode,
          });
        } else {
          children.push({
            action, state: ns, status: 'skipped',
            reason: `đã trong frontier (g_new = ${childG} ≥ g_old = ${existingNode.g})`,
            g: childG, h: childH, depth: node.depth + 1, parentId: node.id,
          });
        }
        continue;
      }

      // If child is not in frontier and not in reached
      const childNode = makeNode(ns, node, action, node.depth + 1, childG, childH, nextId++);
      frontier.push(childNode);
      children.push({
        action, state: ns, status: 'added',
        reason: `thêm vào frontier (g = ${node.g} + ${moveCost} = ${childG}, h = ${childH})`,
        g: childG, h: childH, depth: childNode.depth, id: childNode.id, parentId: node.id, node: childNode,
      });
    }

    yield {
      iter, popped: snapshotPopped(node), poppedIndex,
      children, frontierBefore,
      frontierAfter: snapshotFrontier(frontier),
      reachedAfter: Array.from(reached.keys()),
      done: false, success: false, goalNode: null,
    };
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: Array.from(reached.keys()),
    done: true, success: false, goalNode: null,
  };
}

// Iterative Deepening A* (IDA*)
function* idastar(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  let iter = 0;

  const startH = getHValue(start, goal, null, hType);
  let limit = startH; // Initial limit is f(start) = 0 + h(start)

  for (let cycle = 0; cycle < 100; cycle++) {
    const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);
    const frontier = [startNode];
    let nextLimit = Infinity;

    while (frontier.length > 0) {
      iter++;
      const frontierBefore = snapshotFrontier(frontier);
      const node = frontier.pop(); // LIFO stack pop
      const poppedIndex = frontier.length; // Pop index from top of stack
      const children = [];

      const reachedAfter = getPathKeys(node);

      // Goal test on pop
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

      if (isCycle(node)) {
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
        // Expand current node
        for (const action of ACTION_ORDER) {
          const ns = applyAction(node.state, action);
          if (ns === null) {
            children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: node.id });
            continue;
          }
          const k = stateKey(ns);
          const childH = getHValue(ns, goal, node.state, hType);
          const childG = node.g + getStepCost(ns, goal, node.state, gType);
          const childF = childG + childH;

          // Check if f cost exceeds limit
          if (childF > limit) {
            if (childF < nextLimit) nextLimit = childF;
            children.push({
              action, state: ns, status: 'cutoff',
              reason: `f = ${childF} > limit = ${limit}`,
              g: childG, h: childH, depth: childG, parentId: node.id,
            });
            continue;
          }

          // Check for cycle formation
          const inPath = reachedAfter.includes(k);
          const inFrontier = frontier.some(f => stateKey(f.state) === k);
          if (inPath || inFrontier) {
            children.push({
              action, state: ns, status: 'skipped',
              reason: inPath ? 'trùng với tổ tiên' : 'đã trong frontier',
              g: childG, h: childH, depth: childG, parentId: node.id,
            });
            continue;
          }

          // Add to frontier if f cost is within limit
          const childNode = makeNode(ns, node, action, node.depth + 1, childG, childH, nextId++);
          frontier.push(childNode);
          children.push({
            action, state: ns, status: 'added', reason: 'thêm vào frontier',
            node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id,
            g: childNode.g, h: childNode.h,
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

    // If DFS completed and no next limit was recorded, then goal is not reachable
    if (nextLimit === Infinity) {
      yield {
        iter: iter + 1, popped: null, poppedIndex: -1,
        children: [], frontierBefore: [], frontierAfter: [],
        reachedAfter: [],
        done: true, success: false, goalNode: null,
        limit,
      };
      return;
    }

    limit = nextLimit;
  }

  // Safety exit
  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: [],
    done: true, success: false, goalNode: null,
    limit,
  };
}

// Simple Hill Climbing
function* simpleHillClimbing(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  const startH = getHValue(start, goal, null, hType);
  const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);
  
  if (statesEqual(start, goal)) {
    yield {
      iter: 0, popped: snapshotPopped(startNode), poppedIndex: 0,
      children: [], frontierBefore: [snapshotPopped(startNode)],
      frontierAfter: [], reachedAfter: [stateKey(start)],
      done: true, success: true, goalNode: startNode,
    };
    return;
  }

  let currentNode = startNode;
  const reached = new Set([stateKey(start)]);
  let iter = 0;

  while (true) {
    iter++;
    const frontierBefore = [snapshotPopped(currentNode)];
    const children = [];
    let nextNode = null;
    let foundBetter = false;

    for (const action of ACTION_ORDER) {
      if (foundBetter) break;

      const ns = applyAction(currentNode.state, action);
      if (ns === null) {
        children.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển', parentId: currentNode.id });
        continue;
      }

      const k = stateKey(ns);
      const childH = getHValue(ns, goal, currentNode.state, hType);

      if (statesEqual(ns, goal)) {
        const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
        children.push({
          action, state: ns, status: 'goal', reason: 'TRÙNG GOAL',
          node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
        });
        nextNode = childNode;
        foundBetter = true;
        break;
      }

      if (childH < currentNode.h) {
        const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
        children.push({
          action, state: ns, status: 'added', reason: `tốt hơn (h_new = ${childH} < h_curr = ${currentNode.h})`,
          node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
        });
        nextNode = childNode;
        foundBetter = true;
      } else {
        children.push({
          action, state: ns, status: 'skipped',
          reason: `không tốt hơn (h = ${childH} ≥ ${currentNode.h})`,
          depth: currentNode.depth + 1, parentId: currentNode.id, h: childH
        });
      }
    }

    if (foundBetter && nextNode) {
      reached.add(stateKey(nextNode.state));
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [snapshotPopped(nextNode)],
        reachedAfter: snapshotReached(reached),
        done: statesEqual(nextNode.state, goal),
        success: statesEqual(nextNode.state, goal),
        goalNode: statesEqual(nextNode.state, goal) ? nextNode : null,
      };

      currentNode = nextNode;
      if (statesEqual(currentNode.state, goal)) {
        return;
      }
    } else {
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [],
        reachedAfter: snapshotReached(reached),
        done: true,
        success: false,
        goalNode: null,
        expansionMessage: `Dừng: Đạt cực đại cục bộ (không có trạng thái lân cận nào tốt hơn)`,
      };
      return;
    }
  }
}

// Steepest Ascent Hill Climbing
function* steepestAscentHillClimbing(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  const startH = getHValue(start, goal, null, hType);
  const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);

  if (statesEqual(start, goal)) {
    yield {
      iter: 0, popped: snapshotPopped(startNode), poppedIndex: 0,
      children: [], frontierBefore: [snapshotPopped(startNode)],
      frontierAfter: [], reachedAfter: [stateKey(start)],
      done: true, success: true, goalNode: startNode,
    };
    return;
  }

  let currentNode = startNode;
  const reached = new Set([stateKey(start)]);
  let iter = 0;

  while (true) {
    iter++;
    const frontierBefore = [snapshotPopped(currentNode)];
    const children = [];
    
    let bestChildNode = null;
    let bestH = Infinity;
    let bestAction = null;
    let bestState = null;

    const evaluatedNeighbors = [];

    for (const action of ACTION_ORDER) {
      const ns = applyAction(currentNode.state, action);
      if (ns === null) {
        evaluatedNeighbors.push({ action, state: null, status: 'invalid', reason: 'không thể di chuyển' });
        continue;
      }

      const childH = getHValue(ns, goal, currentNode.state, hType);
      evaluatedNeighbors.push({ action, state: ns, h: childH });

      if (childH < bestH) {
        bestH = childH;
        bestAction = action;
        bestState = ns;
      }
    }

    const isBetter = bestH < currentNode.h;

    for (const neighbor of evaluatedNeighbors) {
      if (neighbor.status === 'invalid') {
        children.push({
          action: neighbor.action, state: null, status: 'invalid',
          reason: neighbor.reason, parentId: currentNode.id
        });
        continue;
      }

      const isBest = (neighbor.action === bestAction);

      if (isBest && isBetter) {
        const childId = nextId++;
        const childNode = makeNode(neighbor.state, currentNode, neighbor.action, currentNode.depth + 1, 0, neighbor.h, childId);
        bestChildNode = childNode;

        if (statesEqual(neighbor.state, goal)) {
          children.push({
            action: neighbor.action, state: neighbor.state, status: 'goal',
            reason: `tốt nhất & TRÙNG GOAL (h = ${neighbor.h})`,
            node: childNode, depth: childNode.depth, id: childId, parentId: currentNode.id, h: neighbor.h
          });
        } else {
          children.push({
            action: neighbor.action, state: neighbor.state, status: 'added',
            reason: `tốt nhất và tốt hơn (h_new = ${neighbor.h} < h_curr = ${currentNode.h})`,
            node: childNode, depth: childNode.depth, id: childId, parentId: currentNode.id, h: neighbor.h
          });
        }
      } else {
        let reason = '';
        if (neighbor.h >= currentNode.h) {
          reason = `không tốt hơn current (h = ${neighbor.h} ≥ ${currentNode.h})`;
        } else {
          reason = `tốt hơn current nhưng không phải tốt nhất (h = ${neighbor.h} > h_best = ${bestH})`;
        }

        children.push({
          action: neighbor.action, state: neighbor.state, status: 'skipped',
          reason: reason, depth: currentNode.depth + 1, parentId: currentNode.id, h: neighbor.h
        });
      }
    }

    if (isBetter && bestChildNode) {
      reached.add(stateKey(bestChildNode.state));
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [snapshotPopped(bestChildNode)],
        reachedAfter: snapshotReached(reached),
        done: statesEqual(bestChildNode.state, goal),
        success: statesEqual(bestChildNode.state, goal),
        goalNode: statesEqual(bestChildNode.state, goal) ? bestChildNode : null,
      };

      currentNode = bestChildNode;
      if (statesEqual(currentNode.state, goal)) {
        return;
      }
    } else {
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [],
        reachedAfter: snapshotReached(reached),
        done: true,
        success: false,
        goalNode: null,
        expansionMessage: `Dừng: Đạt cực đại cục bộ (không có trạng thái lân cận nào tốt hơn current)`,
      };
      return;
    }
  }
}

// Local Beam Search
function* localbeam(start, goal, gType = 'steps', hType = 'manhattan', k = 3) {
  let nextId = 0;
  
  // Initialize startNode
  const startH = getHValue(start, goal, null, hType);
  const startNode = makeNode(start, null, null, 0, 0, startH, nextId++);
  
  // Find all valid 1-step actions from Start
  const validActions = [];
  for (const action of ACTION_ORDER) {
    const ns = applyAction(start, action);
    if (ns !== null) {
      validActions.push({ state: ns, action });
    }
  }

  // Shuffle validActions to get random unique states
  const shuffledActions = [...validActions];
  for (let i = shuffledActions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledActions[i], shuffledActions[j]] = [shuffledActions[j], shuffledActions[i]];
  }

  // Select up to k unique states from the shuffled immediate neighbors
  const initialBeam = [];
  const reached = new Set([stateKey(start)]);
  const numToSelect = Math.min(k, shuffledActions.length);
  for (let i = 0; i < numToSelect; i++) {
    const choice = shuffledActions[i];
    const childH = getHValue(choice.state, goal, start, hType);
    const node = makeNode(choice.state, startNode, choice.action, 1, 0, childH, nextId++);
    initialBeam.push(node);
    reached.add(stateKey(node.state));
  }
  
  // Step 1: Initialization
  const step1Children = [];
  for (const node of initialBeam) {
    step1Children.push({
      action: node.action, state: node.state, status: 'added',
      reason: `sinh ngẫu nhiên từ Start (h = ${node.h})`,
      node: node, depth: node.depth, id: node.id, parentId: startNode.id, h: node.h
    });
  }
  
  // Check for goal in initial beam
  let goalNode = null;
  for (const node of initialBeam) {
    if (statesEqual(node.state, goal)) {
      goalNode = node;
      break;
    }
  }
  
  if (goalNode) {
    const idx = step1Children.findIndex(ch => statesEqual(ch.state, goal));
    if (idx !== -1) {
      step1Children[idx].status = 'goal';
      step1Children[idx].reason = 'TRÙNG GOAL';
    }
    yield {
      iter: 1, popped: snapshotPopped(startNode), poppedIndex: 0,
      children: step1Children, frontierBefore: [snapshotPopped(startNode)],
      frontierAfter: initialBeam.map(snapshotPopped), reachedAfter: Array.from(reached),
      done: true, success: true, goalNode,
      expansionMessage: `Khởi tạo: Sinh ngẫu nhiên ${initialBeam.length} trạng thái từ Start`,
    };
    return;
  }
  
  yield {
    iter: 1, popped: snapshotPopped(startNode), poppedIndex: 0,
    children: step1Children, frontierBefore: [snapshotPopped(startNode)],
    frontierAfter: initialBeam.map(snapshotPopped), reachedAfter: Array.from(reached),
    done: false, success: false, goalNode: null,
    expansionMessage: `Khởi tạo: Sinh ngẫu nhiên ${initialBeam.length} trạng thái từ Start`,
  };

  let currentNodes = [...initialBeam];
  let iter = 1;
  while (true) {
    iter++;
    const frontierBefore = currentNodes.map(snapshotPopped);
    const children = [];
    const neighborNodes = [];
    
    // Generate neighbor states from all current nodes in the beam
    for (const node of currentNodes) {
      for (const action of ACTION_ORDER) {
        const ns = applyAction(node.state, action);
        if (ns === null) {
          children.push({
            action, state: null, status: 'invalid',
            reason: 'không thể di chuyển', parentId: node.id
          });
          continue;
        }
        
        const kKey = stateKey(ns);
        const childH = getHValue(ns, goal, node.state, hType);
        
        // Filter out duplicates and previously reached states
        const isDuplicateInStep = neighborNodes.some(n => stateKey(n.state) === kKey);
        if (isDuplicateInStep) {
          children.push({
            action, state: ns, status: 'skipped',
            reason: 'trùng lặp trong bước', depth: node.depth + 1, parentId: node.id, h: childH
          });
        } else if (reached.has(kKey)) {
          children.push({
            action, state: ns, status: 'skipped',
            reason: 'đã trong reached', depth: node.depth + 1, parentId: node.id, h: childH
          });
        } else {
          const childNode = makeNode(ns, node, action, node.depth + 1, 0, childH, nextId++);
          neighborNodes.push(childNode);
          children.push({
            action, state: ns, status: 'added',
            reason: `thêm vào frontier (h = ${childH})`,
            node: childNode, depth: childNode.depth, id: childNode.id, parentId: node.id, h: childH
          });
        }
      }
    }
    
    // Check for local minimum or deadlock
    if (neighborNodes.length === 0) {
      currentNodes.sort((a, b) => a.h - b.h);
      yield {
        iter, poppedNodes: frontierBefore, poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [], reachedAfter: Array.from(reached),
        done: true, success: false, goalNode: null,
        expansionMessage: 'Dừng: Không còn trạng thái lân cận nào mới để đi tiếp (bế tắc)',
      };
      return;
    }
    
    // Check for goal state
    let goalNode = null;
    for (const node of neighborNodes) {
      if (statesEqual(node.state, goal)) {
        goalNode = node;
        const idx = children.findIndex(ch => ch.node && statesEqual(ch.node.state, goal));
        if (idx !== -1) {
          children[idx].status = 'goal';
          children[idx].reason = 'TRÙNG GOAL';
        }
        break;
      }
    }
    
    if (goalNode) {
      reached.add(stateKey(goalNode.state));
      yield {
        iter, poppedNodes: frontierBefore, poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [snapshotPopped(goalNode)],
        reachedAfter: Array.from(reached),
        done: true, success: true, goalNode,
      };
      return;
    }
    
    // Select beam candidates if goal is not found
    // Sort candidates by heuristic value ascending
    neighborNodes.sort((a, b) => a.h - b.h);
    
    // Keep k best candidate states
    currentNodes = [];
    for (let i = 0; i < Math.min(k, neighborNodes.length); i++) {
      currentNodes.push(neighborNodes[i]);
      reached.add(stateKey(neighborNodes[i].state));
    }
    
    yield {
      iter, poppedNodes: frontierBefore, poppedIndex: 0,
      children, frontierBefore,
      frontierAfter: currentNodes.map(snapshotPopped), reachedAfter: Array.from(reached),
      done: false, success: false, goalNode: null,
    };
  }
}

// Random Restart Hill Climbing
function* ramdomreset(start, goal, gType = 'steps', hType = 'manhattan', maxRestart = 5) {
  const MAX_RESTART = maxRestart; // Maximum restart count
  let iter = 0;

  for (let restart = 1; restart <= MAX_RESTART; restart++) {
    let nextId = 0; // Reset node labeling sequence back to A1 for this restart run
    const startH = getHValue(start, goal, null, hType);
    let currentNode = makeNode(start, null, null, 0, 0, startH, nextId++);
    const runReached = new Set([stateKey(start)]); // Local reached set cleared for the current restart iteration
    
    if (restart > 1) {
      yield {
        iter: ++iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children: [], frontierBefore: [snapshotPopped(currentNode)],
        frontierAfter: [snapshotPopped(currentNode)],
        reachedAfter: Array.from(runReached),
        done: false, success: false, goalNode: null,
        expansionMessage: `Khởi động lại (Lượt ${restart}/${MAX_RESTART})`,
      };
    }

    if (statesEqual(start, goal)) {
      yield {
        iter: ++iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children: [], frontierBefore: [snapshotPopped(currentNode)],
        frontierAfter: [], reachedAfter: Array.from(runReached),
        done: true, success: true, goalNode: currentNode,
      };
      return;
    }

    let runStuck = false;
    while (!runStuck) {
      iter++;
      const frontierBefore = [snapshotPopped(currentNode)];
      const children = [];
      const betterNeighbors = [];

      for (const action of ACTION_ORDER) {
        const ns = applyAction(currentNode.state, action);
        if (ns === null) {
          children.push({
            action, state: null, status: 'invalid',
            reason: 'không thể di chuyển', parentId: currentNode.id
          });
          continue;
        }

        const kKey = stateKey(ns);
        const childH = getHValue(ns, goal, currentNode.state, hType);

        if (statesEqual(ns, goal)) {
          const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
          children.push({
            action, state: ns, status: 'goal', reason: 'TRÙNG GOAL',
            node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
          });
          betterNeighbors.push(childNode);
          break;
        }

        // Filter to keep better neighbors not visited in this restart run
        if (childH < currentNode.h) {
          if (runReached.has(kKey)) {
            children.push({
              action, state: ns, status: 'skipped',
              reason: 'đã đi qua trong lượt này', depth: currentNode.depth + 1, parentId: currentNode.id, h: childH
            });
          } else {
            const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
            betterNeighbors.push(childNode);
            children.push({
              action, state: ns, status: 'added',
              reason: `tốt hơn (h = ${childH} < ${currentNode.h})`,
              node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
            });
          }
        } else {
          children.push({
            action, state: ns, status: 'skipped',
            reason: `không tốt hơn (h = ${childH} ≥ ${currentNode.h})`,
            depth: currentNode.depth + 1, parentId: currentNode.id, h: childH
          });
        }
      }

      const goalNode = betterNeighbors.find(n => statesEqual(n.state, goal));
      if (goalNode) {
        runReached.add(stateKey(goalNode.state));
        yield {
          iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
          children, frontierBefore,
          frontierAfter: [snapshotPopped(goalNode)],
          reachedAfter: Array.from(runReached),
          done: true, success: true, goalNode,
        };
        return;
      }

      if (betterNeighbors.length === 0) {
        runStuck = true;
        yield {
          iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
          children, frontierBefore,
          frontierAfter: [],
          reachedAfter: Array.from(runReached),
          done: false, success: false, goalNode: null,
          expansionMessage: `Bị kẹt ở cực đại cục bộ (Lượt ${restart}/${MAX_RESTART})`,
        };
      } else {
        // Select neighbor randomly from better candidates
        const nextNode = betterNeighbors[Math.floor(Math.random() * betterNeighbors.length)];
        const nextKey = stateKey(nextNode.state);
        runReached.add(nextKey);

        yield {
          iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
          children, frontierBefore,
          frontierAfter: [snapshotPopped(nextNode)],
          reachedAfter: Array.from(runReached),
          done: false, success: false, goalNode: null,
        };

        currentNode = nextNode;
      }
    }
  }

  yield {
    iter: iter + 1, popped: null, poppedIndex: -1,
    children: [], frontierBefore: [], frontierAfter: [],
    reachedAfter: [],
    done: true, success: false, goalNode: null,
    expansionMessage: `Thất bại: Đã thử lại tối đa ${MAX_RESTART} lần nhưng không tìm thấy đích`,
  };
}

// Stochastic Hill Climbing
function* stochastic(start, goal, gType = 'steps', hType = 'manhattan') {
  let nextId = 0;
  const startH = getHValue(start, goal, null, hType);
  let currentNode = makeNode(start, null, null, 0, 0, startH, nextId++);
  
  const reached = new Set([stateKey(start)]);
  let iter = 0;

  if (statesEqual(start, goal)) {
    yield {
      iter: 0, popped: snapshotPopped(currentNode), poppedIndex: 0,
      children: [], frontierBefore: [snapshotPopped(currentNode)],
      frontierAfter: [], reachedAfter: [stateKey(start)],
      done: true, success: true, goalNode: currentNode,
    };
    return;
  }

  while (true) {
    iter++;
    const frontierBefore = [snapshotPopped(currentNode)];
    const children = [];
    const betterNeighbors = [];

    for (const action of ACTION_ORDER) {
      const ns = applyAction(currentNode.state, action);
      if (ns === null) {
        children.push({
          action, state: null, status: 'invalid',
          reason: 'không thể di chuyển', parentId: currentNode.id
        });
        continue;
      }

      const kKey = stateKey(ns);
      const childH = getHValue(ns, goal, currentNode.state, hType);

      if (statesEqual(ns, goal)) {
        const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
        children.push({
          action, state: ns, status: 'goal', reason: 'TRÙNG GOAL',
          node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
        });
        betterNeighbors.push(childNode);
        break;
      }

      // Filter to keep better neighbors not in reached
      if (childH < currentNode.h) {
        if (reached.has(kKey)) {
          children.push({
            action, state: ns, status: 'skipped',
            reason: 'đã trong reached', depth: currentNode.depth + 1, parentId: currentNode.id, h: childH
          });
        } else {
          const childNode = makeNode(ns, currentNode, action, currentNode.depth + 1, 0, childH, nextId++);
          betterNeighbors.push(childNode);
          children.push({
            action, state: ns, status: 'added',
            reason: `tốt hơn (h = ${childH} < ${currentNode.h})`,
            node: childNode, depth: childNode.depth, id: childNode.id, parentId: currentNode.id, h: childH
          });
        }
      } else {
        children.push({
          action, state: ns, status: 'skipped',
          reason: `không tốt hơn (h = ${childH} ≥ ${currentNode.h})`,
          depth: currentNode.depth + 1, parentId: currentNode.id, h: childH
        });
      }
    }

    const goalNode = betterNeighbors.find(n => statesEqual(n.state, goal));
    if (goalNode) {
      reached.add(stateKey(goalNode.state));
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [snapshotPopped(goalNode)],
        reachedAfter: Array.from(reached),
        done: true, success: true, goalNode,
      };
      return;
    }

    if (betterNeighbors.length === 0) {
      yield {
        iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
        children, frontierBefore,
        frontierAfter: [],
        reachedAfter: Array.from(reached),
        done: true,
        success: false,
        goalNode: null,
        expansionMessage: 'Dừng: Đạt cực đại cục bộ (không có lân cận nào tốt hơn)',
      };
      return;
    }

    // Select neighbor randomly from better candidates
    const nextNode = betterNeighbors[Math.floor(Math.random() * betterNeighbors.length)];
    const nextKey = stateKey(nextNode.state);
    reached.add(nextKey);

    yield {
      iter, popped: snapshotPopped(currentNode), poppedIndex: 0,
      children, frontierBefore,
      frontierAfter: [snapshotPopped(nextNode)],
      reachedAfter: Array.from(reached),
      done: false, success: false, goalNode: null,
    };

    currentNode = nextNode;
  }
}

const ALGORITHMS = { bfs, dfs, ids, ucs, greedy, astar, idastar, simpleHillClimbing, steepestAscentHillClimbing, localbeam, ramdomreset, stochastic };

