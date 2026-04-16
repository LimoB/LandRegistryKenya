import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store'; 
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            // Using your project's fonts and spacing
            className: 'font-sans text-xs font-bold uppercase tracking-widest',
            duration: 4000,
            style: {
              borderRadius: '14px', // Matches your .glass-card radius
              background: 'rgb(var(--card))',
              color: 'rgb(var(--text))',
              border: '1px solid rgb(var(--border))',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            // Optional: Customizing success/error icon colors to match your theme
            success: {
              iconTheme: {
                primary: 'rgb(var(--secondary))',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // Red-500
                secondary: 'white',
              },
            },
          }}
        />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);