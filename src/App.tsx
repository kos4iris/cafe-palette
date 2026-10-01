import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SiteNav } from './components/SiteNav';
import HomePage from './pages/HomePage';
import FlavorProfilePage from './pages/FlavorProfilePage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="site-nav-strip">
        <SiteNav />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/saved" element={<SavedRecipesPage />} />
        <Route path="/flavor-profile" element={<FlavorProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
