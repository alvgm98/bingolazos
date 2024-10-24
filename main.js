let cartones = [];
let bolas = [];

/**
 * Puede haber varios ganadores de Linea y Bingo si lo cantan en el mismo número
 * En los array se guardarán los ID de los cartones que lo canten
 */
let ganadoresLinea = [];
let ganadoresBingo = [];

/**
 * Indices de cada carton:
 * 0 -> Primera fila.
 * 1 -> Segunda fila.
 * 2 -> Tercera fila.
 * 3 -> ID del Carton.
 * 4 -> Numeros acertados en Primera fila.
 * 5 -> Numeros acertados en Segunda fila.
 * 6 -> Numeros acertados en Tercera fila.
 */

/** Esta funcion da comienzo al juego, genera 6 cartones y preguta si se quiere generar mas, despues comienza a generar numeros */
function start() {
   document.getElementById("start").style.display = 'none'
   document.getElementById("botones").style.display = 'flex';

   for (let i = 0; i < 6; i++) {
      generarCarton();
   }
}

/** Bloquea el poder comprar mas cartones y da comienzo al juego */
function startGame() {
   document.getElementById("botones").style.display = 'none';
   document.getElementById("bolas-section").style.display = 'flex';
   siguienteBola();
}

/** Saca la siguiente bola, y llama a la funcion que actualiza los numeros acertados de cada carton */
function siguienteBola() {
   let bola = Math.floor(Math.random() * 89 + 1);

   // Mientras ya haya salido esa bolam generamos una nueva
   while(bolas.includes(bola)) {
      bola = Math.floor(Math.random() * 89 + 1);
   }

   bolas.push(bola);
   document.getElementById("ultima-bola").innerText = bola;
   document.getElementById("lista-bolas").innerHTML = `<div>${bola}</div>` + document.getElementById("lista-bolas").innerHTML;

   comprobarCartones(bola); // Actualizamos los numeros acertados en cada carton

   // Mostramos visualmente los numeros acertados
   let numerosElementos = document.querySelectorAll(".n" + bola);
   numerosElementos.forEach((elemento) => {
      elemento.classList.add("acertado");
   });    
}

/** Comprueba y actualiza el numero de numeros acertados en cada fila de cada carton de toda la lista de cartones */
function comprobarCartones(numero) {
   // Comprobamos cada uno de los cartones
   cartones.forEach(carton => {
      // Comprobamos si se encuentra en alguna de las filas, el numero actual
      for (let i = 0; i < 3; i++) {
         // Compruebo unicamente en la columna de su decena y me ahorro iterar toda la fila
         if (numero === carton[i][Math.floor(numero / 10)]) {
            carton[i + 4]++;
            break;
         }
      }
   });

   // Solo compruebo si ya ha sido matematicamente posible premiada una linea
   if (ganadoresLinea.length === 0 && bolas.length >= 5) { comprobarLinea() }
   
   // Solo compruebo si ya ha sido matematicamente posible premiado un bingo
   if (ganadoresLinea.length > 0 && bolas.length >= 20) { comprobarBingo() }
}

/** 
 * Se ejecuta cada vez que sale una bola (a partir de la quinta).
 * Comprueba y añade en @param ganadoresLinea los ID de los cartones que hayan ganado linea con la bola actual
 * Una vez haya habido al menos un ganador, deja de ejecutarse 
 */
function comprobarLinea() {
   cartones.forEach(carton => {
      for (let i = 4; i <= 6; i++) {
         // Compruebo si ya estan acertados los 5 numeros de esa linea
         if (carton[i] === 5) {
            ganadoresLinea.push(carton[3]);
            break;
         }
      }
   });

   if (ganadoresLinea.length > 0) {
      showModalLinea();
   }
}

/** 
 * Se ejecuta cada vez que sale una bola (a partir de la 20 y si ya se ha cantado linea).
 * Comprueba y añade en @param ganadoresBingo los ID de los cartones que hayan cantado BINGO con la bola actual
 * Una vez haya habido al menos un ganador, reemplaza el boton de 'Siguiente Bola' por 'Volver a Jugar'
 */
function comprobarBingo() {
   cartones.forEach((carton) => {
      // Compruebo si ya estan acertadas todas las lineas
      if (carton[4] === 5 && carton[5] === 5 && carton[6] === 5) {
         ganadoresBingo.push(carton[3]);
      }
   });

   if (ganadoresBingo.length > 0) {
      showModalBingo()
      document.getElementById("recargar").style.display = 'flex';
      document.getElementById("siguiente-bola").style.display = 'none';
   }
}

/** Esta función genera un carton y lo añade a array de cartones */
function generarCarton() {
   let carton = [[], [], [], 0, 0, 0, 0];

   // Generamos 9 columnas, aunque luego se añadiran como filas
   for (let i = 0; i < 9; i++) {
      let columna = [];
      for (let j = 0; j < 3; ) {
         // Generamos numeros aleatorios dependiendo de la columna en la que estemos
         let random = Math.floor(Math.random() * 10 + i * 10);

         random = random === 0 ? 1 : random; // Evitamos generar el numero 0 ya que no esta permitido en el bingo
         
         // Evitamos añadir numeros que ya se encuentren en el carton
         if (!columna.includes(random)) {
            columna.push(random);
            j++;
         }
      }

      // Ordenamos la columna y la añadimos al carton
      columna.sort();
      carton[0][i] = columna[0];
      carton[1][i] = columna[1];
      carton[2][i] = columna[2];
   }

   generarVacios(carton);
   generarID(carton);
   console.log(carton);

   // Añado el carton al array de cartones
   cartones.push(carton);

   // Imprimimos carton
   const html = printCarton(carton);

   const cartonesElement = document.getElementById("cartones");
   cartonesElement.innerHTML += html;
}

/**
 * Recibe un carton y genera 4 huecos vacios en cada una de sus filas
 * @param {Array} carton el carton a modificar
 */
function generarVacios(carton) {
   for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; ) {
         let random = Math.floor(Math.random() * 9);

         // Para evitar que haya una columna con todo celdas vacias
         if (i === 2 && carton[0][random] === null && carton[1][random] === null) {
            continue;
         }

         // Evitamos eliminar un hueco que ya se encontraba vacio
         if (carton[i][random] !== null) {
            carton[i][random] = null;
            j++;
         }
      }
   }
}

/**
 * Recibe un carton y genera un numero identificador aleatorio para el
 * @param {Array} carton el carton a modificar
 */
function generarID(carton) {
   while (true) {
      const random = Math.floor(Math.random() * 899999 + 100000);

      // Compruebo que ningun carton tenga el ID generado
      if (cartones.filter((carton) => carton[3] === random).length > 0) {
         continue;
      }

      carton[3] = random;
      break;
   }
}

/**
 * Recibe un carton y lo imprime
 * @param {Array} carton el carton a imprimir
 */
function printCarton(carton) {
   // En esta variable cuardaremos el HTML a añadir
   let html = `
      <article class="carton id-${carton[3]}">
         <div class="numeros">
   `;
   
   for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 9; j++) {
         /* Para facilitar resaltar las lineas ganadoras y los cartones ganadores:
          añado una clase a cada celda con el formato: c-nFila-idCarton */
         // Imprimimos celda vacia si hay un null
         if (!carton[i][j]) {
            html += `<div class="vacio c-${i}-${carton[3]}"></div>`;
         }
         // Imprimimos le numero que toca y le añadimos un clase con su numero para seleccionar mas facilmente estos numeros cuando sean acertados
         else {
            html += `<div class="n${carton[i][j]} numero c-${i}-${carton[3]}">${carton[i][j]}</div>`;
         }
      }
   }
   
   html += `
            </div>
            <div class="id-carton">Carton nº: <span>${carton[3]}</span></div>
         <div class="bingolazos">BINGOLAZOS</div>
      </article>
   `;

   return html;
}

/** Abre el modal de ganadores de linea e imprime todos los cartones que hayan ganado una linea */
function showModalLinea() {
   document.getElementById("premio-linea").style.display = 'flex';
   document.getElementById("overlay").style.display = 'flex';

   const html = mostrarGanadoresLinea();
   premiadosLineaElement = document.getElementById("premio-linea-cartones");
   premiadosLineaElement.innerHTML = html;
   // Muestro las lineas ganadoras de cada carton
   resaltarLineasGanadoras();
}

/** Abre el modal de ganadores e imprime todos los cartones que hayan ganado bingo y linea */
function showModalBingo() {
   document.getElementById("premios").style.display = 'flex';
   document.getElementById("overlay").style.display = 'flex';

   // Muestro los cartones premiados por Linea
   const htmlBingo = mostrarGanadoresBingo();
   premiadosBingoElement = document.getElementById("premio-bingo-cartones");
   premiadosBingoElement.innerHTML = htmlBingo;

   // Muestro los cartones premiados por Linea
   const htmlLinea = mostrarGanadoresLinea();
   premiadosLineaElement = document.getElementById("final-linea-cartones");
   premiadosLineaElement.innerHTML = htmlLinea;

   resaltarLineasGanadoras();
   resaltarBingos();
}

function mostrarGanadoresLinea() {
   let html = '';
   for (let carton of cartones.filter(c => ganadoresLinea.includes(c[3]))) {
      // Imprimo los cartones ganadores
      html += printCarton(carton);
   }
   return html;
}

function mostrarGanadoresBingo() {
   let html = '';
   for (let carton of cartones.filter(c => ganadoresBingo.includes(c[3]))) {
      // Imprimo los cartones ganadores
      html += printCarton(carton);
   }
   return html;
}

/** Resalta en rojo las lineas ganadoras */
function resaltarLineasGanadoras() {
   for (let carton of cartones.filter(c => ganadoresLinea.includes(c[3]))) {
      for (let i = 0; i < 3; i++) {
         if (carton[i + 4] === 5) {
            const linea = document.querySelectorAll(`.c-${i}-${carton[3]}`);

            linea.forEach((celda) => {
               celda.classList.add("ganador");
            });  
         }
      }
   }
}

/** Resalta en rojo los cartones ganadores de bingo */
function resaltarBingos() {
   for (let carton of cartones.filter(c => ganadoresBingo.includes(c[3]))) {
      const ganadores = document.querySelectorAll(`.id-${carton[3]}`)

      ganadores.forEach((carton) => {
         carton.classList.add("bingo");
      }); 
   }
}

/** Funcion para cerrar los modales y el overlay */
function closeModal() {
   document.getElementById("premio-linea").style.display = 'none';
   document.getElementById("overlay").style.display = 'none';
   document.getElementById("premios").style.display = 'none';
}
