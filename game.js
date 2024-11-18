const c = document.getElementById('gameCanvas');
const ctx = c.getContext('2d');
// postavljanje velicine platna
c.width = window.innerWidth - 50;
c.height = window.innerHeight - 20;

// definicije broja redova i stupaca cigli
const brickColumns = 10;
const brickRows = 5;

// definicije konstantnih vrijednosti (velicine objekata, brzina palice i pozicija prve cigle)
const ballRadius = 10;
const platformHeight = 25;
const platformWidth = 170;
const brickWidth = 70;
const brickHeight = 15;
const brickPadding = 10;
const platformSpeed = 5;
// pocetna cigla (gore lijevo) ima x vrijednost koja centrira skup svih cigli
const startBrickX = c.width / 2 - brickColumns * (brickPadding + brickWidth) / 2;
const startBrickY = 50;

// definicije promjenjivih vrijednosti (brzina i smjer loptice, pozicija palice i loptice, rezultati)
var ballSpeedX = 3 * (Math.random() - 0.5);
var ballSpeedY = -3;
var platformX = c.width / 2 - platformWidth / 2;
var platformY = c.height - 50;
var ballX = platformX + platformWidth / 2;
var ballY = platformY - platformHeight - 20;
var score = 0;
var highscore = localStorage.getItem('highscore') || 0;
// varijable za pomak palice
var keys = {
    left: false,
    right: false,
};

// stvaranje praznih objekata cigli
// x, y: pozicija pojedinacne cigle
// status: 0 - cigla je pogodjena, 1 - cigla nije pogodjena
var bricks = [];
for(let i = 0; i < brickColumns; i++){
    bricks[i] = [];
    for(let j = 0; j < brickRows; j++){
        bricks[i][j] = {x: 0, y: 0, status: 1};
    }
}

// crtanje cigli
// cigle se crtaju samo ako nisu pogodjene
// svakoj se dodaje pojedinacna vrijednost za x i y, i izmedju njih postoji padding
function drawBricks() {
    for(let i = 0; i < brickColumns; i++){
        for(let j = 0; j < brickRows; j++){
            if(bricks[i][j].status === 1){
                bricks[i][j].x = startBrickX + i * (brickPadding + brickWidth);
                bricks[i][j].y = startBrickY + j * (brickPadding + brickHeight);
                ctx.fillStyle = 'gray';
                ctx.fillRect(bricks[i][j].x, bricks[i][j].y, brickWidth, brickHeight);
                ctx.strokeStyle = 'yellow';
                ctx.strokeRect(bricks[i][j].x, bricks[i][j].y, brickWidth, brickHeight);
            }
        }
    }
}

// crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

// crtanje palice
function drawPlatform() {
    ctx.fillStyle = 'red';
    ctx.fillRect(platformX, platformY, platformWidth, platformHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(platformX, platformY, platformWidth, platformHeight);
}

// ispis rezultata
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText("Score: " + score, c.width - 150, 30);
    ctx.fillText("Highscore: " + highscore, c.width - 150, 50);
    ctx.fillText("Max score: " + brickRows * brickColumns, c.width - 150, 70);
}

// detekcija sudara
function detectCollision() {
    // sudar s ciglama
    // za svaku ciglu koja nije pogodjena se provjerava je li loptica dosla u kontakt sa tom ciglom
    for(let i = 0; i < brickColumns; i++){
        for(let j = 0; j < brickRows; j++){
            var brick = bricks[i][j];
            if(brick.status == 1) {
                // ako je sljedeci uvjet ispunjen, loptica je u kontaktu sa ciglom
                if (
                    ballX - ballRadius > brick.x &&
                    ballX - ballRadius < brick.x + brickWidth &&
                    ballY - ballRadius > brick.y &&
                    ballY - ballRadius < brick.y + brickHeight
                ) {
                    // obrce se smjer brzine loptice po y osi i status pogodjene cigle se mijenja u 0
                    ballSpeedY = -ballSpeedY;
                    brick.status = 0;
    
                    // povecava se score za 1 i provjerava je li to novi highscore, ako je i highscore se mijenja i sprema u localStorage
                    score++;
                    if(score > highscore) {
                        highscore = score;
                        localStorage.setItem('highscore', highscore);
                    }
                }
            }
        }
    }

    // sudar s rubovima
    // sudar s lijevim i desnim rubom
    // loptici se obrne smjer brzine loptice po x osi
    if (ballX + ballRadius > c.width || ballX - ballRadius < 0)
        ballSpeedX = -ballSpeedX;

    // sudar s gornjim rubom
    // loptici se obrne smjer brzine loptice po y osi
    if (ballY - ballRadius < 0)
        ballSpeedY = -ballSpeedY;


    // sudar s palicom
    // loptici se obrne smjer brzine po y osi
    if (
        ballY + ballRadius > platformY &&
        ballX > platformX &&
        ballX < platformX + platformWidth
    ) {
        ballSpeedY = -ballSpeedY;
        // racunanje nove brzine po x osi
        // ovaj dio dodaje nasumicnost kad loptica pogodi palicu, smjer loptice ostaje isti, ali brzina se mijenja
        // dodao sam ovo jer ako je pocetni kut loptice blizu 90 stupnjeva (loptica ide ravno gore), igra postane prespora i monotona jer loptica nikad ne promjeni pocetni kut
        ballSpeedX = Math.sign(ballSpeedX) * 2 * (Math.random() + 0.5);
    }
}

// listener za pritisak lijeve i desne strelice
// ako se trazena tipka pritisne promjeni se varijabla keys te se palica mice
document.addEventListener('keydown', (e) => {
    if (e.key == 'ArrowLeft')
        keys.left = true;
    if(e.key == 'ArrowRight')
        keys.right = true;
});

// listener za prestanak pritiska lijeve i desne strelice
// ako se trazena tipka pusti promjeni se varijabla keys te se palica prestane micati
document.addEventListener('keyup', (e) => {
    if (e.key == 'ArrowLeft')
        keys.left = false;
    if(e.key == 'ArrowRight')
        keys.right = false;
});

// palica se krece lijevo ili desno dokle god je pritisnuta lijeva ili desna strelica
function movePlatform() {
    if (keys.left && platformX > 0)
        platformX -= platformSpeed;
    if (keys.right && platformX < c.width - platformWidth)
        platformX += platformSpeed;
}

// glavna funkcija koja iscrtava sve ostale elemente
function draw() {
    // brisanje elemenata na starom platnu
    ctx.clearRect(0, 0, c.width, c.height);

    // crtanje svih elemenata igre
    drawBricks();
    drawPlatform();
    drawBall();
    drawScore();
    // provjera sudara
    detectCollision();

    // pomak palice
    movePlatform();
    // pomak loptice
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // sudar loptice sa donjim rubom
    // ako je uvjet ispunjen igra je gotova i igrac je izgubio te se ispisuje poruka na ekran
    if (ballY + ballRadius > c.height) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', c.width / 2, c.height / 2);
        return;
    }

    // postignut je maksimalni rezultat
    // ako je uvjet ispunjen igrac je pobjedio te se ispisuje poruka na ekran
    if (score == brickRows * brickColumns) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', c.width / 2, c.height / 2);
        return;
    }

    // poziv funkcije za animaciju, zove se predana funkcija (u ovom slucaju draw()) prije iscrtavanja na ekran
    requestAnimationFrame(draw);
}

// poziv glavne funkcije (start igre)
draw();
