import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import Google OAuth provider for login
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

// Google Cloud Client ID (development/placeholder)
const GOOGLE_CLIENT_ID = "619870841074-k52g5t1s1r41n424u9nu2lfr9bbj22fo.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* App wrapped with Google OAuth provider */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);