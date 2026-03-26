// import React from 'react';
import AppRoutes from './routes/AppRoutes'; // Adjust path if necessary
// import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* AppRoutes handles all the logic for:
          - Public pages (Home, Login)
          - Protected Dashboards (Admin, Officer, Citizen)
          - Layout wrapping and Role-based access
      */}
      <AppRoutes />
    </div>
  );
}

export default App;