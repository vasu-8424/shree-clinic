import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import { EditImagesPage } from './pages/EditImagesPage.tsx';
import { ImageProvider } from './context/ImageContext.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ImageProvider>
      <BrowserRouter>
        <Routes>
          {/* Dedicated /edit Route to update website images from database */}
          <Route path="/edit" element={<EditImagesPage />} />

          {/* Private Admin Panel & PMS (Mounted under /admin/*) */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Public Website (Mounted under /*) */}
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ImageProvider>
  </QueryClientProvider>
);
