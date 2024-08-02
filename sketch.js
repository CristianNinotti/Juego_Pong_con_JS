let raquetaJugador;
let raquetaComputadora;
let pelota;
let velocidadPelotaX = 10;
let velocidadPelotaY = 10;
let puntajeJugador = 0;
let puntajeComputadora = 0;
let fondo; // Variable para la imagen de fondo
let imagenRaquetaJugador; // Variable para la imagen de la raqueta del jugador
let imagenRaquetaComputadora; // Variable para la imagen de la raqueta de la computadora
let imagenPelota; // Variable para la imagen de la pelota
let sonidoColision; // Variable para el sonido de colisión
let sonidoGol; // Variable para el sonido de gol

function preload() {
  fondo = loadImage('assets/fondo1.png');
  imagenRaquetaJugador = loadImage('assets/barra1.png');
  imagenRaquetaComputadora = loadImage('assets/barra2.png');
  imagenPelota = loadImage('assets/bola.png');
  sonidoColision = loadSound('assets/bounce.wav');
  sonidoGol = loadSound('assets/gol.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Ajusta el tamaño del canvas al tamaño de la ventana
  raquetaJugador = new Raqueta(true);
  raquetaComputadora = new Raqueta(false);
  pelota = new Pelota();
}

function draw() {
  background(fondo); // Utilizar la imagen como fondo
  
  // Mostrar y mover las raquetas y la pelota
  raquetaJugador.mostrar();
  raquetaJugador.mover();
  raquetaComputadora.mostrar();
  raquetaComputadora.mover();
  pelota.mostrar();
  pelota.mover();
  
  // Mostrar el puntaje
  mostrarPuntaje();
}

function mostrarPuntaje() {
  textSize(20);
  fill(color("salmon"));
  textStyle(BOLD);

  // Puntaje del jugador
  textAlign(RIGHT, TOP);
  text("Jugador: " + puntajeJugador, width / 4, 10);
  
  // Puntaje de la computadora
  textAlign(LEFT, TOP);
  text("Computadora: " + puntajeComputadora, 2.7 * width / 4, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Redimensiona el canvas cuando cambia el tamaño de la ventana
}

class Raqueta {
  constructor(esJugador) {
    this.ancho = 15;
    this.alto = 200;
    this.x = esJugador ? 20 : width - 30;
    this.y = height / 2 - this.alto / 2;
    this.velocidad = 10;
    this.esJugador = esJugador;  // Propiedad para diferenciar las raquetas
    this.imagen = esJugador ? imagenRaquetaJugador : imagenRaquetaComputadora;
    
    if (!esJugador) {
      this.yObjetivo = this.y; // Posición objetivo inicial para la computadora
      this.velocidadSuavizado = 0.1; // Velocidad de suavizado
    }
  }

  mostrar() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }

  mover() {
    if (this.esJugador) {
      if (keyIsDown(UP_ARROW) && this.y > 0) {
        this.y -= this.velocidad;
      } else if (keyIsDown(DOWN_ARROW) && this.y < height - this.alto) {
        this.y += this.velocidad;
      }
    } else {
      // Movimiento suave de la computadora
      this.yObjetivo = pelota.y - this.alto / 2;
      this.y += (this.yObjetivo - this.y) * this.velocidadSuavizado;
      
      // Limitar la posición de la raqueta de la computadora dentro del área de juego
      this.y = constrain(this.y, 0, height - this.alto);
    }
  }
}

class Pelota {
  constructor() {
    this.tamano = 20;
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadX = velocidadPelotaX;
    this.velocidadY = velocidadPelotaY;
    this.angulo = 0; // Ángulo de rotación
    this.velocidadAngular = 0.25; // Velocidad angular
  }

  mostrar() {
    push();
    translate(this.x, this.y); // Mover el origen de coordenadas al centro de la pelota
    rotate(this.angulo); // Rotar la pelota
    imageMode(CENTER); // Asegurarse de que la imagen se dibuje centrada
    image(imagenPelota, 0, 0, this.tamano, this.tamano); // Dibujar la imagen
    pop();
  }

  mover() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    this.angulo += this.velocidadAngular; // Actualizar el ángulo

    // Colisión con los bordes superior e inferior
    if (this.y < 0 || this.y > height) {
      this.velocidadY *= -1;
    }

    // Colisión con las raquetas
    if (this.x < raquetaJugador.x + raquetaJugador.ancho && 
        this.y > raquetaJugador.y && 
        this.y < raquetaJugador.y + raquetaJugador.alto) {
      let diff = this.y - (raquetaJugador.y + raquetaJugador.alto / 2);
      let normalizedDiff = diff / (raquetaJugador.alto / 2);
      let angle = normalizedDiff * PI / 4; // Ajustar el ángulo máximo deseado
      this.velocidadX = velocidadPelotaX * cos(angle);
      this.velocidadY = velocidadPelotaX * sin(angle);
      if (this.velocidadX < 0) {
        this.velocidadX *= -1;
      }
      // Reproducir sonido de colisión
      sonidoColision.play();
    }
    
    if (this.x > raquetaComputadora.x && 
        this.y > raquetaComputadora.y && 
        this.y < raquetaComputadora.y + raquetaComputadora.alto) {
      let diff = this.y - (raquetaComputadora.y + raquetaComputadora.alto / 2);
      let normalizedDiff = diff / (raquetaComputadora.alto / 2);
      let angle = normalizedDiff * PI / 4; // Ajustar el ángulo máximo deseado
      this.velocidadX = -velocidadPelotaX * cos(angle);
      this.velocidadY = velocidadPelotaX * sin(angle);
      if (this.velocidadX > 0) {
        this.velocidadX *= -1;
      }
      // Reproducir sonido de colisión
      sonidoColision.play();
    }

    // Punto para el jugador o la computadora
    if (this.x < 0) {
      puntajeComputadora++;
      sonidoGol.play();
      this.reiniciar(true);
      narrarMarcador(); // Mover aquí para narrar después de reiniciar
    } else if (this.x > width) {
      puntajeJugador++;
      sonidoGol.play();
      this.reiniciar(false);
      narrarMarcador(); // Mover aquí para narrar después de reiniciar
    }
  }

  reiniciar(enRaquetaJugador) {
    if (enRaquetaJugador) {
      this.x = raquetaJugador.x + raquetaJugador.ancho + this.tamano / 2;
      this.y = raquetaJugador.y + raquetaJugador.alto / 2;
      this.velocidadX = velocidadPelotaX;
    } else {
      this.x = raquetaComputadora.x - this.tamano / 2;
      this.y = raquetaComputadora.y + raquetaComputadora.alto / 2;
      this.velocidadX = -velocidadPelotaX;
    }
    this.velocidadY = velocidadPelotaY * (random() > 0.5 ? 1 : -1);
    this.angulo = 0; // Reiniciar la rotación de la pelota
  }
}

function narrarMarcador() {
  // Crear un objeto SpeechSynthesisUtterance
  const mensaje = new SpeechSynthesisUtterance();
  
  // Establecer el texto que se va a narrar
  mensaje.text = ` ${puntajeJugador} a ${puntajeComputadora}.`;
  
  // Opcional: Configurar la voz y la velocidad (según el navegador y sus opciones)
  mensaje.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google Spanish'); // Ajusta la voz según disponibilidad
  mensaje.rate = 1; // Velocidad de la narración

  // Reproducir la narración
  window.speechSynthesis.speak(mensaje);
}
