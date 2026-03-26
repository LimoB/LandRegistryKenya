import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import this
import { store } from './app/store'; 
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* The Toaster must be inside the Provider but can be anywhere */}
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'font-sans text-xs font-bold uppercase tracking-widest',
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              border: '1px solid #1e293b'
            },
          }}
        />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);