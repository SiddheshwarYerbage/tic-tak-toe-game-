const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const currentPlayerEl = document.getElementById('currentPlayer');
const restartBtn = document.getElementById('restartBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const vsCpuCheckbox = document.getElementById('vsCpu');

const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let isActive = true;
let scores = { X: 0, O: 0, D: 0 };

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function updateStatus(text){
  statusEl.innerText = text;
}

function render(){
  cells.forEach((cell, idx) => {
    cell.textContent = board[idx] || '';
    cell.classList.toggle('taken', !!board[idx]);
    cell.classList.remove('win');
  });
  currentPlayerEl.textContent = currentPlayer;
}

function checkWin(){
  for(const combo of winCombos){
    const [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      return { winner: board[a], combo };
    }
  }
  if(board.every(x => x)) return { winner: null };
  return null;
}

function endRound(result){
  isActive = false;
  if(result && result.winner){
    scores[result.winner]++;
    highlightWin(result.combo);
    updateStatus(`Player ${result.winner} wins!`);
  } else if(result && result.winner === null){
    scores.D++;
    updateStatus('Draw!');
  }
  updateScoresUI();
}

function highlightWin(combo){
  combo.forEach(i => cells[i].classList.add('win'));
}

function updateScoresUI(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

function makeMove(idx){
  if(!isActive) return;
  if(board[idx]) return;
  board[idx] = currentPlayer;
  const res = checkWin();
  render();
  if(res){
    endRound(res);
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  currentPlayerEl.textContent = currentPlayer;
  if(vsCpuCheckbox.checked && currentPlayer === 'O'){
    // let the CPU move slightly after human
    setTimeout(cpuMove, 350);
  }
}

function cpuMove(){
  if(!isActive) return;
  // Try to win, then block, else random
  const move = findBestMove('O') || findBestMove('X') || randomMove();
  if(move != null) makeMove(move);
}

function findBestMove(player){
  for(let i=0;i<9;i++){
    if(!board[i]){
      board[i] = player;
      const res = checkWin();
      board[i] = null;
      if(res && res.winner === player) return i;
    }
  }
  return null;
}

function randomMove(){
  const empties = board.map((v,i)=>v?null:i).filter(i=>i!==null);
  if(empties.length===0) return null;
  return empties[Math.floor(Math.random()*empties.length)];
}

// Handlers
cells.forEach(cell => {
  cell.addEventListener('click', e => {
    const idx = Number(cell.dataset.index);
    if(vsCpuCheckbox.checked && currentPlayer === 'O') return; // wait for CPU
    makeMove(idx);
  });
});

restartBtn.addEventListener('click', () => {
  resetBoard();
});

resetScoresBtn.addEventListener('click', () => {
  scores = { X:0, O:0, D:0 };
  updateScoresUI();
  resetBoard();
});

vsCpuCheckbox.addEventListener('change', () => {
  resetBoard();
});

function resetBoard(){
  board = Array(9).fill(null);
  currentPlayer = 'X';
  isActive = true;
  cells.forEach(c => c.classList.remove('win'));
  updateStatus(`Current: ${currentPlayer}`);
  render();
  // If vs CPU and CPU should start, let CPU play
  if(vsCpuCheckbox.checked && currentPlayer === 'O'){
    setTimeout(cpuMove, 300);
  }
}

// init
updateStatus(`Current: ${currentPlayer}`);
updateScoresUI();
render();

// Expose for debugging (optional)
window.__tic = {board, scores, resetBoard};