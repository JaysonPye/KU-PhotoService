import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import PicturesPage from './components/PicturesPage';
import SeasonalPage from './components/SeasonalPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/pictures/:folderId" element={<PicturesPage />} />
        <Route path="/seasonal-pictures" element={<SeasonalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
