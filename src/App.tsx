import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));

// #region agent log
function AppLogger({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:AppLogger',message:'App: pathname',data:{pathname:loc.pathname},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  return <>{children}</>;
}
// #endregion

// Заглушки для страниц, которых пока нет (чтобы сайт не падал)
const Login = () => <div className="text-white p-10 flex justify-center">Login Page (Coming Soon)</div>;
const Landing = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:Landing',message:'Landing: render',data:{},timestamp:Date.now(),hypothesisId:'H3,H4'})}).catch(()=>{});
  // #endregion
  return <div className="text-white p-10 flex justify-center">Landing Page <br/> <a href="/login" className="text-blue-400 underline ml-2">Go to Login</a></div>;
};
const AppGenerator = () => <div className="text-white p-10 flex justify-center">Generator Page (Coming Soon)</div>;

const App = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7993e053-faae-4709-890c-2a9ce2babfb0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:App',message:'App: render',data:{},timestamp:Date.now(),hypothesisId:'H1,H3'})}).catch(()=>{});
  // #endregion
  return (
    <BrowserRouter>
      <AppLogger>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<AppGenerator />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </AppLogger>
    </BrowserRouter>
  );
};

export default App;
