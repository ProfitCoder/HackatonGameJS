// 1. Selección de elementos del DOM
const container = document.getElementById('game-container');
const player = document.getElementById('player');
const spawn = document.getElementById('spawn');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');


const idIntervalo = setInterval(crearYcaer, 2000);

// 2. Variables de Estado
let playerX = 180;
const playerSpeed = 15;
let score = 0;
let gameOver = false;
let gameInterval;
let bugSpawnInterval;

// 3. Controles del Teclado
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  if ((e.key === 'ArrowLeft' || e.key === 'a') && playerX > 0) 
  {
    playerX -= playerSpeed;
  }
  if ((e.key === 'ArrowRight' || e.key === 'd') && playerX < container.clientWidth - 40) 
  {
    playerX += playerSpeed;
  }
  
  player.style.left = `${playerX}px`;
});

// 4. Función utilitaria para detectar colisión entre 2 elementos del DOM
function checkCollision(elem1, elem2) {
  const r1 = elem1.getBoundingClientRect();
  const r2 = elem2.getBoundingClientRect();

  return !(
    r1.top > r2.bottom ||
    r1.bottom < r2.top ||
    r1.right < r2.left ||
    r1.left > r2.right
  );
}

function crearYcaer() {
  const nuevoDiv = document.createElement('div');
  nuevoDiv.classList.add('objeto');
  nuevoDiv.textContent = '🔴';

  nuevoDiv.style.left = Math.random() * (container.clientWidth - 50) + 'px';

  container.appendChild(nuevoDiv);

  let posicionY = 0;
  let velocidad = 0;
  const gravedad = 0.1;
  const suelo = container.clientHeight - 50;

  function caer() {
    velocidad += gravedad;
    posicionY += velocidad;

    if (posicionY >= suelo) {
      posicionY = suelo;
      nuevoDiv.style.display = "none";
    } else {
      requestAnimationFrame(caer);
    }

    nuevoDiv.style.top = posicionY + 'px';
  }

  function colision(){
    const colisionPlayer = player.getBoundingClientRect();
    const colisionNDiv = nuevoDiv.getBoundingClientRect();

    return !(
      colisionPlayer.bottom < colisionNDiv.top ||
      colisionPlayer.top > colisionNDiv.bottom 
    );
  }

  function bucle() {
    if(colision()){
      console.log("TOCADO");
      
    }
  }

  requestAnimationFrame(caer);
}

/*function simularGravedad(caja){

  velocidad += gravedad;
  posicionY += velocidad;

  if(posicionY >= suelo) {
    posicionY = suelo;
    velocidad = 0;
    caja.style.top = posicionY + 'px';
    return;
  }

  caja.style.top = posicionY + 'px';

  requestAnimationFrame(simularGravedad);
//}

//function createDivs()
{
  let newDiv = document.createElement("div");
  let newContent = document.createTextNode("🔴");
  newDiv.textContent = newContent;
  spawn.appendChild(newDiv);
  newDiv.classList.add('caer')
  //simularGravedad(newDiv);
//}
//createDivs();
*/

// 5. TODO por los alumnos:
// - Función para crear bugs periódicamente (`document.createElement`)
// - Mover los bugs hacia abajo en un intervalo/frame
// - Comprobar colisión con `checkCollision(player, bug)`
// - Actualizar puntuación y gestionar Game Over