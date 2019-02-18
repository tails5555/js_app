// HTML 에서 id 가 canvas 인 DOM 노드를 찾습니다. 
const canvas = document.getElementById('canvas');

// Canvas 에서 2D 데이터 내용을 얻기 위한 메소드를 사용합니다.
const context = canvas.getContext('2d');

// 뱀의 크기는 32 로 지정하고, 한 칸의 단위입니다.
const box = 32;

// 게임 진행판 이미지를 가져옵니다.
const ground_img = new Image();
ground_img.src = 'img/ground.png';

// 게임 아이템 이미지를 가져옵니다.
const apple_img = new Image();
apple_img.src = 'img/food.png';

// 오디오 파일을 불러옵니다.
const dead_bgm = new Audio();
dead_bgm.src = 'audio/dead.mp3';

const eat_bgm = new Audio();
eat_bgm.src = 'audio/eat.mp3';

const up_bgm = new Audio();
up_bgm.src = 'audio/up.mp3';

const left_bgm = new Audio();
left_bgm.src = 'audio/left.mp3';

const right_bgm = new Audio();
right_bgm.src = 'audio/right.mp3';

const down_bgm = new Audio();
down_bgm.src = 'audio/down.mp3';

// 뱀은 배열로 표현하되, 몸의 한 단위를 좌표로 표현합니다.
let snake = [];
snake[0] = { x : 9 * box, y : 10 * box };

// 사과가 나타날 좌표를 임의로 지정합니다.
// x는 1부터 17까지 임의의 수, y는 3부터 17까지 임의의 수가 나옵니다.
// x, y 를 각각 1, 3으로 띄운 이유는 캔버스 이미지의 테두리 때문입니다.
let apple = {
    x : Math.floor(Math.random() * 17 + 1) * box,
    y : Math.floor(Math.random() * 15 + 3) * box
};

// 스네이크 게임 점수
let score = 0;
let highScore = 0;

// 게임 진행에 대한 키보드 이벤트 등록
document.addEventListener('keydown', direction);

// dir 는 뱀이 움직이고 있는 방향입니다.
let dir = '';
let game_over = false;

// HTML Canvas 에 그리는 함수를 주기적으로 실행합니다.
let game = setInterval(draw, 100);

// 37 는 왼쪽, 38 는 위쪽, 39는 오른쪽, 40은 아래쪽입니다.
// 왼쪽 - 오른쪽, 위쪽 - 아래쪽 버튼을 각각 누르면 의미가 없어 상호 관계가 안 이루어진 버튼에만 방향 전환을 가능하게 합니다.
// 게임 오버 시, R 키를 누르면 다시 실행할 수 있도록 픽션합니다.
function direction(event){
    const { keyCode } = event;
    if(keyCode === 37 && dir !== 'RIGHT') {
        if(!game_over && dir !== 'LEFT')
            left_bgm.play();
        dir = 'LEFT';
    }
    else if(keyCode === 38 && dir !== 'DOWN') {
        if(!game_over && dir !== 'UP')
            up_bgm.play();
        dir = 'UP';
    }
    else if(keyCode === 39 && dir !== 'LEFT') {
        if(!game_over && dir !== 'RIGHT')
            right_bgm.play();
        dir = 'RIGHT';
    }
    else if(keyCode === 40 && dir !== 'UP') {
        if(!game_over && dir !== 'DOWN')
            down_bgm.play();
        dir = 'DOWN';
    } else if(keyCode === 82 && game_over) {
        score = 0;
        snake = [];
        snake[0] = { x : 9 * box, y : 10 * box };
        game_over = false;
        dir = '';
        apple = {
            x : Math.floor(Math.random() * 17 + 1) * box,
            y : Math.floor(Math.random() * 15 + 3) * box
        };
        game = setInterval(draw, 100);
    }
}

// 뱀의 충돌 여부를 확인하는 함수.
function collision(head, array){
    for(let k = 0; k < array.length; k++){
        if(head.x === array[k].x && head.y === array[k].y) {
            return true;
        }
    }
    return false;
}

// HTML Canvas 에 매번 그릴 함수.
function draw() {
    context.drawImage(ground_img, 0, 0);

    // 뱀을 그립니다.
    for(let k = 0; k < snake.length; k++){
        // 1단계. 뱀의 몸통 표현
        // 1-(1) 뱀의 얼굴은 초록색, 이외엔 하얀색으로 그립니다.
        context.fillStyle = (k == 0) ? 'green' : 'aquamarine';
        // 1-(2) 직사각형을 그리는 메소드로, 왼쪽 x, y 는 이격 거리, 오른쪽 x, y 는 그릴 거리입니다. 
        context.fillRect(snake[k].x, snake[k].y, box, box);
        
        // 2단계. 뱀의 몸통 구분선 표현
        // 2-(1) 구분선 색상은 빨간색으로 지정합니다.
        context.strokeStyle = 'red'; 
        // 2-(2) 구분선을 아까 그린 뱀의 몸통에 표현합니다.
        context.strokeRect(snake[k].x, snake[k].y, box, box); 
    }
    
    // 사과를 그립니다.
    context.drawImage(apple_img, apple.x, apple.y);
    
    // 방향에 따라 뱀의 진로를 렌더링합니다.
    
    // 뱀의 얼굴를 가져옵니다.
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // 만약 뱀이 음식 먹은 경우에는 길이를 늘려주고, 재배치합니다.
    if(snakeX === apple.x && snakeY === apple.y){
        score += 10;
        eat_bgm.play();
        apple = {
            x : Math.floor(Math.random() * 17 + 1) * box,
            y : Math.floor(Math.random() * 15 + 3) * box
        }
        // 뱀이 음식을 먹으면 굳이 꼬리를 자를 필요가 없습니다. 
    } else {
        // 뱀이 음식을 안 먹으면 꼬리를 없앱니다.
        snake.pop();
    }

    // 방향에 따라 새로 넣을 뱀의 얼굴 좌표를 설정합니다.
    if(dir === "LEFT") snakeX -= box;
    if(dir === "RIGHT") snakeX += box;
    if(dir === "UP") snakeY -= box;
    if(dir === "DOWN") snakeY += box;

    // 새로 그릴 얼굴 좌표 객체를 생성합니다.
    const newHead = {
        x : snakeX, y : snakeY
    };
    
    // 게임판을 넘어가면 게임 오버 처리를 합니다.
    if(snakeX < box || snakeX > 17 * box || snakeY < 3 * box || snakeY > 17 * box || collision(newHead, snake)) {
        context.fillStyle = 'red';
        context.font = '45px 맑은 고딕';
        context.fillText('GAME OVER', 5*box, 11*box);
        
        game_over = true;
        
        clearInterval(game);
        dead_bgm.play();
    }

    // 맨 앞에 새로운 얼굴 좌표를 저장합니다.
    snake.unshift(newHead);

    // 점수를 그립니다.
    context.fillStyle = 'white';
    context.font = '45px 맑은 고딕';
    context.fillText(score, 2*box, 1.6*box);

    highScore = Math.max(score, highScore);
    context.fillStyle = 'yellow';
    context.font = '45px 맑은 고딕';
    context.fillText(`HIGH : ${highScore}`, 10*box, 1.6*box);
}