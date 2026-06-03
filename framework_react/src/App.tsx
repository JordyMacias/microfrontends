import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './vistas/Inicio';
import Sede from './vistas/Sede';
import AdminPanel from './vistas/AdminPanel';
import './styles/tasty.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/sede/:sedeId" element={<Sede />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
