import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 👇 NUEVO: Parche para que el Drag & Drop funcione en iPhone/Android
import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css"; // Estilos opcionales para el arrastre

// Activamos el parche táctil
polyfill({
  dragImageCenterOnTouch: true
});

// Evitamos que la pantalla haga scroll por accidente mientras arrastramos una tarjeta
window.addEventListener('touchmove', function() {}, {passive: false});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);