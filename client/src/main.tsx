import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Simplified rendering without router configuration here
const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  root.render(
    <React.StrictMode>
      <App />
      {/* Uncomment the following line to enable React Query Devtools */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      {/* Uncomment the following line to enable React Hot Toast */}
      {/* <Toaster position="top-right" toastOptions={{ duration: 2000 }} /> */}
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering application:", error);
  
  // Fallback render in case of error
  root.render(
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
      <p className="mb-4">There was a problem loading the application. Please try again later.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Reload Application
      </button>
    </div>
  );
}
