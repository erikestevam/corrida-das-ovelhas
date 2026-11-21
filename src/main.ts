import { Game3D } from './game3d/Game3D';
import { overlayUI } from './ui/OverlayUI';
import './style.css';

// Initialize the 100% 3D Game Engine (Three.js WebGL with Soft Shadows)
const game3D = new Game3D('game-container');
game3D.start();

// Connect HTML / Motion UI with the 3D Game Engine
overlayUI.init(
  () => game3D.startGame(),
  () => game3D.restartGame(),
  () => game3D.toggleCameraMode()
);
