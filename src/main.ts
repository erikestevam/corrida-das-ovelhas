import { Game3D } from './game3d/Game3D';
import { overlayUI } from './ui/OverlayUI';
import './style.css';

console.log('🐑 O Bom Pastor: O Vale das Ovelhinhas (Mundo Aberto & Stick Mobile)');

// Auto-reload immediately when a new Service Worker deployment is activated
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Inicializa o motor 3D em mundo aberto
const game3D = new Game3D('game-container');
game3D.start();

// Conecta a UI HTML/Motion ao motor 3D
overlayUI.init(
  () => game3D.startGame(),
  () => game3D.restartGame()
);
