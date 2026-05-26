// Verify all 4 algorithms on default preset.
const fs = require('fs');
const path = require('path');

// Đọc file gốc và biến đổi để export ra Node:
let src = '';
src += fs.readFileSync(path.join(__dirname, 'core.js'), 'utf8') + '\n';
src += fs.readFileSync(path.join(__dirname, 'algorithms.js'), 'utf8') + '\n';
// Chuyển const/let top-level → var để escape scope của eval
src = src.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ');
// Append export
src += '\nmodule.exports = { PRESETS, ALGORITHMS, ACTION_ORDER, misplacedCount, manhattanDistance, tracePath, bfs, dfs, ucs, greedy };\n';

fs.writeFileSync(path.join(__dirname, '.test-bundle.js'), src);
const M = require('./.test-bundle.js');

function fmt(s) {
  if (!s) return '(null)';
  return s.map((v, i) => (i % 3 === 2 ? `${v === 0 ? '_' : v}\n` : `${v === 0 ? '_' : v} `)).join('').trim();
}

function runAlgo(name, gen) {
  console.log(`\n${'='.repeat(60)}\n${name}\n${'='.repeat(60)}`);
  let goalNode = null;
  while (true) {
    const { value, done } = gen.next();
    if (done) break;
    console.log(`\n--- Step ${value.iter} ---`);
    if (value.popped) {
      const meta = [];
      if (value.popped.g !== undefined) meta.push(`g=${value.popped.g}`);
      if (value.popped.h !== undefined) meta.push(`h=${value.popped.h}`);
      meta.push(`depth=${value.popped.depth}`);
      meta.push(`action=${value.popped.action || 'root'}`);
      console.log(`POP:\n${fmt(value.popped.state)}\n[${meta.join(' ')}]`);
    }
    value.children.forEach(ch => {
      const extra = [];
      if (ch.g !== undefined) extra.push(`g=${ch.g}`);
      if (ch.h !== undefined) extra.push(`h=${ch.h}`);
      if (ch.depth !== undefined) extra.push(`d=${ch.depth}`);
      console.log(`  ${ch.action}: ${ch.status.padEnd(8)} ${ch.reason || ''} ${extra.join(' ')}`);
    });
    console.log(`  Frontier sau: ${value.frontierAfter.length} nodes`);
    console.log(`  Reached  sau: ${value.reachedAfter.length} states`);
    if (value.done) {
      if (value.success) {
        goalNode = value.goalNode;
        console.log(`  >>> GOAL TÌM THẤY ở step ${value.iter}`);
      } else {
        console.log(`  >>> THẤT BẠI`);
      }
      break;
    }
  }
  if (goalNode) {
    const p = M.tracePath(goalNode);
    const actions = p.slice(1).map(n => n.action);
    console.log(`\nSolution: ${actions.join(' → ')}  (${actions.length} bước)`);
  }
  return goalNode;
}

const start = M.PRESETS.bfs.start;
const goal = M.PRESETS.bfs.goal;
console.log('START:'); console.log(fmt(start));
console.log('GOAL: '); console.log(fmt(goal));
console.log(`misplaced(start)=${M.misplacedCount(start, goal)}`);
console.log(`manhattan(start)=${M.manhattanDistance(start, goal)}`);

runAlgo('BFS', M.bfs(start, goal));
runAlgo('DFS', M.dfs(start, goal));
runAlgo('UCS', M.ucs(start, goal));
runAlgo('GREEDY', M.greedy(start, goal));

// Cleanup
fs.unlinkSync(path.join(__dirname, '.test-bundle.js'));
