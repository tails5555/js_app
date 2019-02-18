 // HTML 에서 id 가 tetris 인 DOM 노드를 찾습니다. 
const canvas = document.getElementById('tetris');

// Canvas 에서 2D 데이터 내용을 얻기 위한 메소드를 사용합니다.
const context = canvas.getContext('2d');

// 점수 데이터가 있는 DOM 노드를 불러옵니다.
const score_node = document.getElementById('score');

// 게임의 크기는 20 X 10, 빈 블록은 하얀색으로 설정합니다.
const ROW = 20;
const COLUMN = 10;

// SQ 는 한 블록이 그려질 픽셀 크기로, 20px 로 설정합니다.
const SQ = 20;

// 테트리스의 빈 공간은 하얀색으로 지정합니다.
const VACANT = 'WHITE';

// 테트리스의 x좌표, y좌표, 색상을 통하여 사각형을 그리는 함수입니다.
function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * SQ, y * SQ, SQ, SQ);
    
    context.strokeStyle = 'BLACK';
    context.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// 첫 게임을 위하여 판을 초기화합니다.
// 블록의 종류는 색상으로 판단합니다.
let board = [];
for(let k = 0; k < ROW; k++){
    board[k] = [];
    for(let l = 0; l < COLUMN; l++){
        board[k][l] = VACANT;
    }
}

function drawBoard() {
    for(let k = 0; k < ROW; k++){
        for(let l = 0; l < COLUMN; l++){
            drawSquare(l, k, board[k][l]);
        }
    }
}

drawBoard();

// 테트노미노 조각 색상 설정.
const PIECES = [
    [Z_BLOCK, 'RED'], 
    [S_BLOCK, 'GREEN'], 
    [T_BLOCK, 'YELLOWGREEN'],
    [O_BLOCK, 'BLUE'],
    [L_BLOCK, 'PURPLE'],
    [I_BLOCK, 'CYAN'],
    [J_BLOCK, 'ORANGE']
];

// 7조각의 테트노미노 중 아무거나 하나를 뽑습니다.
function randomPiece() {
    const r = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1])
}

// 테트노미노 조각 클래스
class Piece {
    constructor(tetromino, color){
        // 테트로미노 조각 기본 정보
        this.tetromino = tetromino;
        this.color = color;
        
        // 테트로미노 회전 관련 정보
        this.rotateN = 0; // 회전 수치는 항상 0으로 초기화합니다.
        this.activeTetromino = this.tetromino[this.rotateN]; // 작동 중인 테트리스 조각을 설정합니다.

        // 테트로미노 위치 관련 정보를 초기화합니다.
        this.x = 3;
        this.y = -2;
    }

    // 현재 조각을 게임판에 그리는 함수입니다.
    _draw() {
        this._fill(this.color);
    }

    // 게임판에 있는 조각을 삭제하는 함수입니다.
    _unDraw() {
        this._fill(VACANT);
    }

    // draw, unDraw 메소드의 코드 중복을 줄이기 위한 리펙토링
    _fill(color) {
        for(let k = 0; k < this.activeTetromino.length; k++){
            for(let l = 0; l < this.activeTetromino.length; l++){
                // 테트로미노 로직에서 1에 해당되는 경우에는 그리도록 합니다.
                if(this.activeTetromino[k][l])
                    drawSquare(this.x + l, this.y + k, color);
            }
        }
    }

    // 어느 방향을 움직이든 마찬가지로 지금 블록을 삭제하고 이동하고 난 뒤에 다시 그립니다.
    // 아래로 내려가기
    _moveDown() {
        if(!this._collision(0, 1, this.activeTetromino)){
            this._unDraw();
            this.y += 1;
            this._draw();
        } else {
            // 아래에 다 내려왔으면 새로운 블록을 선정합니다. 그리고 내려온 블록에 대하여 색상을 선정합니다.
            this._lock();
            piece = randomPiece();
        }
    }

    // 왼쪽으로 이동
    _moveLeft() {
        if(!this._collision(-1, 0, this.activeTetromino)){
            this._unDraw();
            this.x -= 1;
            this._draw();
        }
    }

    // 오른쪽으로 이동
    _moveRight() {
        if(!this._collision(1, 0, this.activeTetromino)){
            this._unDraw();
            this.x += 1;
            this._draw();
        }
    }

    // 회전하기
    _rotate() {
        const nextPattern = this.tetromino[(this.rotateN + 1) % this.tetromino.length];
        
        // kick 은 회전에 따라서 각 반대 방향으로 밀어서 돌릴 때 사용하는 변수입니다.
        let kick = 0;
        if(this._collision(0, 0, nextPattern)){
            if(this.x > COLUMN / 2){
                kick = -1;
            } else {
                kick = 1;
            }
        }

        if(!this._collision(kick, 0, nextPattern)){
            this._unDraw();
            this.x += kick;
            this.rotateN = (this.rotateN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.rotateN];
            this._draw();
        }
    }

    // 테트로미노 충돌 해결하기
    _collision(x, y, piece) {
        for(let k = 0; k < piece.length; k++){
            for(let l = 0; l < piece.length; l++){
                if(!piece[k][l]) continue;
                
                // 테트로미노가 이동할 새로운 좌표를 계산합니다.
                let newX = this.x + l + x;
                let newY = this.y + k + y;
                
                // 게임판 안에 유효한지 확인합니다.
                if(newX < 0 || newX >= COLUMN || newY >= ROW)
                    return true;
                
                    // 그러나 newY 가 0이면 아직 블록이 안 내려와서 충돌이 아닙니다.
                if(newY < 0) continue;

                // 게임판에 빈칸이 없으면 충돌입니다.
                if(board[newY][newX] !== VACANT) return true;
            }
        }

        return false;
    }

    // 게임 오버 처리 및 테트리스 조각이 지면에 닿을 때 보드 내용 갱신을 위한 메소드입니다.
    _lock() {
        for(let k = 0; k < this.activeTetromino.length; k++){
            for(let l = 0; l < this.activeTetromino.length; l++){
                if(!this.activeTetromino[k][l]) continue;
                // 테트로미노 조각이 모두 쌓였을 때 게임오버 처리합니다.
                if(this.y + l < 0){
                    alert('GAME OVER! 다시하세요.');
                    gameOver = true;
                    break;
                }
                
                // 지면에 내려온 블록 색상을 저장합니다.
                board[this.y + k][this.x + l] = this.color;
            }
        }
        
        let rowCnt = 0;
        // 행이 모두 꽉 찼을 경우에 지우는 메소드입니다.
        for(let k = 0; k < ROW; k++){
            let isRowFull = true;
            for(let l = 0; l < COLUMN; l++){
                isRowFull = isRowFull && (board[k][l] !== VACANT);
            }
            if(isRowFull) {
                // 우선 꽉 찬 행을 없애고 아래로 밀어버립니다.
                for(let j = k; j > 1; j--){
                    for(let l = 0; l < COLUMN; l++){
                        board[j][l] = board[j - 1][l];
                    }
                }
                
                // 실질적으로 영향이 없는 맨 위칸도 빈 공간으로 밀어버립니다.
                for(let l = 0; l < COLUMN; l++){
                    board[0][l] = VACANT;
                }

                rowCnt += 1;
            }
        }

        // 점수는 푸짐하게. 1줄에 100점, 2줄에 300점, 3줄에 600점, 4줄에 1000점.
        score += (rowCnt * 100 * (rowCnt + 1) / 2);

        // 보드를 다시 렌더링합니다.
        drawBoard();

        score_node.innerHTML = score;
    }
}

// 테트노미노 조각 초기화
let piece = randomPiece();

// 방향키로 테트로미노를 움직이는 이벤트를 추가합니다.
document.addEventListener('keydown', CONTROL);
function CONTROL(event){
    const { keyCode } = event;
    if(keyCode === 37) { // 37는 왼쪽키. 왼쪽 이동.
        piece._moveLeft();
    } else if(keyCode === 38) { // 38는 위쪽키. 모양 회전.
        piece._rotate();
    } else if(keyCode === 39) { // 39는 오른쪽키. 오른쪽 이동.
        piece._moveRight();
    } else if(keyCode === 40) { // 40은 아래키. 아래쪽 이동.
        piece._moveDown();
    }
}

// drop 함수를 그냥 이대로 작성하면 빠르게 내려가서 시간 차이마다 내려갈 수 있게 설정해야 합니다.
let dropStart = Date.now();
let gameOver = false;
let score = 0;

function drop() {
    let now = Date.now();
    const delta = now - dropStart; // 날짜끼리 빼면 long 값의 타임스탬프가 튀나올 것입니다.
    if(delta > 1000) {
        piece._moveDown();
        dropStart = Date.now();
    }
    if(!gameOver)
        requestAnimationFrame(drop);
}

drop();