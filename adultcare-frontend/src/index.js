import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import './App.css';   
import App from './App'; 
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ThemeProvider>
  </React.StrictMode>
);




