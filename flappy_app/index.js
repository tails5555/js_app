const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// 게임 화면에 그려질 이미지를 호출합니다.
const bird_image = new Image();
bird_image.src = 'images/bird.png';

const bg_image = new Image();
bg_image.src = 'images/bg.png';

const pipe_north_image = new Image();
pipe_north_image.src = 'images/pipeNorth.png';

const pipe_south_image = new Image();
pipe_south_image.src = 'images/pipeSouth.png';

const fg_image = new Image();
fg_image.src = 'images/fg.png';

const fly_audio = new Audio();
fly_audio.src = 'sounds/fly.mp3';

const score_audio = new Audio();
score_audio.src = 'sounds/score.mp3';

// 게임 중 새가 지나갈 파이프의 간격을 조절합니다.
const gap = 85;
let empty;

// 새가 게임을 시작하는 좌표입니다.
let bX = 10;
let bY = 150;

// 지구 상 실제 중력 가속도인 9.8 m/s2 를 반영합니다.
const gravity = 0.98;

// 아무 키를 입력할 때, 새의 높이를 20 씩 위로 날게 합니다.
document.addEventListener("keydown", () => {
    bY -= 25;
    fly_audio.play();
});

// 게임을 진행하기 위한 파이프의 정보를 저장합니다.
let pipes = [];
pipes.push({
    x : canvas.width,
    y : 0
});

let score = 0;

function draw() {
    // 이미지 파일을 부르고 캔버스 안에 꽉 채웁니다.
    context.drawImage(bg_image, 0, 0);

    for(let k = 0; k < pipes.length; k++){
        empty = pipe_north_image.height + gap;

        // 새가 지나가기 위한 위-아래 파이프를 그립니다. pX, pY 는 임의의 값이 될 것입니다.
        context.drawImage(pipe_north_image, pipes[k].x, pipes[k].y);
        context.drawImage(pipe_south_image, pipes[k].x, pipes[k].y + empty);

        pipes[k].x -= 1; // 파이프가 왼쪽으로 움직이는 모습을 재연하기 위해 x축으로 1를 감소합니다.
        
        // 파이프가 정중앙을 거치게 되면 새로운 파이프를 추가합니다.
        if(pipes[k].x === 125) {
            pipes.push({
                x : canvas.width,
                y : Math.floor(Math.random() * pipe_north_image.height) - pipe_north_image.height
            });
        }

        // 새가 장애물에 충돌하거나 땅에 떨어졌을 때의 로직
        if(
            bX + bird_image.width >= pipes[k].x &&
            bX <= pipes[k].x + pipe_north_image.width && // 처음 조건은 새가 파이프 사이를 들어올 때
            (bY <= pipes[k].y + pipe_north_image.height || bY + bird_image.height >= pipes[k].y + empty) || // 새의 위치가 
            (bY + bird_image.height >= canvas.height - fg_image.height) || (bY - bird_image.height < 0) 
        ) {
            location.reload();
        }

        if(pipes[k].x === 5) {
            score += 10;
            score_audio.play();
        }
    }

    // 땅을 그립니다.
    context.drawImage(fg_image, 0, canvas.height - fg_image.height);

    // 게임을 진행할 새를 그립니다.
    context.drawImage(bird_image, bX, bY);

    bY += gravity; // 새가 떨어지는 중력 시뮬레이션을 적용합니다.

    context.fillStyle = '#000';
    context.font = '20px Verdana';
    context.fillText('Score : ' + score, 10, canvas.height - 20);

    // 게임 화면을 계속 그리기 위한 다음 프레임 요청을 계속 진행합니다.
    // 이는 바깥 스코프에서 draw() 함수를 실행하면 이벤트가 들어올 때까지 계속 다음 프레임을 넘깁니다.
    requestAnimationFrame(draw);
}

draw();