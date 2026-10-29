import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import './EventLink.css';
import { AuthProvider } from './AuthContext';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Keep local requests and session cookies on the API's configured site.
if (window.location.hostname === 'localhost') {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.hostname = '127.0.0.1';
  window.location.replace(canonicalUrl.href);
} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider><App /></AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  reportWebVitals();
}
