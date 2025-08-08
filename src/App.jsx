import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Options from './pages/Options';
import Portfolio from './pages/Portfolio';
import Derivatives from './pages/Derivatives';
import Crypto from './pages/Crypto';
import Forex from './pages/Forex';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/forex" element={<Forex />} />
        <Route path="/derivatives" element={<Derivatives />} />
        <Route path="/options" element={<Options />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
