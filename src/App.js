import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Banner from './components/Banner';
import LoginPage from './components/LoginPage';
import PicturesPage from './components/PicturesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/pictures/:folderId" element={<PicturesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
