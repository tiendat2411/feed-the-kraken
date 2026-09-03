import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import Home from './pages/Home';
import Game from './pages/Game';
import TestRoleReveal from './pages/TestRoleReveal';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="/test/role-reveal" element={<TestRoleReveal />} />
          <Route path="/test/role-reveal/:factionParam" element={<TestRoleReveal />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
