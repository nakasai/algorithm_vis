import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ArtifactList from './components/ArtifactList';
import ArtifactViewer from './components/ArtifactViewer';
import NotFound from './components/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ArtifactList />} />
        <Route path="/:artifactId" element={<ArtifactViewer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
