import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameSelectionPage } from './pages/GameSelectionPage';
import { HomePage } from './pages/HomePage';
import { CreateMatchPage } from './pages/CreateMatchPage';
import { MatchPage } from './pages/MatchPage';
import { TableTennisPage } from './pages/TableTennisPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameSelectionPage />} />
        <Route path="/cricket" element={<HomePage />} />
        <Route path="/create" element={<CreateMatchPage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
        <Route path="/tt" element={<TableTennisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

