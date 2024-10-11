import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';  // Import your Dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />  {/* Dashboard route */}
      </Routes>
    </Router>
  );
}

export default App;
