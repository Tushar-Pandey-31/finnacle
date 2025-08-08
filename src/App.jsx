import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Options from './pages/Options';
import Portfolio from './pages/Portfolio';
import Derivatives from './pages/Derivatives';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/options" element={<Options />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/derivatives" element={<Derivatives />} />
      </Routes>
    </Router>
  );
}

export default App;
