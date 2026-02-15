import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:after-import',message:'index: imports loaded',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
// #endregion

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
// #region agent log
fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:root-found',message:'index: root found',data:{},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
// #endregion

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// #region agent log
fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:render-done',message:'index: render called',data:{},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
// #endregion