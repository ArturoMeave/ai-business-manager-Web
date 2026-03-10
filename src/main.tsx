import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 👇 NUEVO: Importamos el proveedor de Google para el Login
import { GoogleOAuthProvider } from '@react-oauth/google';

// Parche para que el Drag & Drop funcione en iPhone/Android
import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css"; // Estilos opcionales para el arrastre

// Activamos el parche táctil
polyfill({
  dragImageCenterOnTouch: true
});

// Evitamos que la pantalla haga scroll por accidente mientras arrastramos una tarjeta
window.addEventListener('touchmove', function() {}, {passive: false});

// ⚠️ AQUÍ IRÁ TU CLAVE REAL DE GOOGLE CLOUD LUEGO
const GOOGLE_CLIENT_ID = "619870841074-k52g5t1s1r41n424u9nu2lfr9bbj22fo.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 👇 Envolvemos toda la aplicación con el proveedor de Google 👇 */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);