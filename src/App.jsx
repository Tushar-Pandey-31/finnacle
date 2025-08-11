import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Options from './pages/Options';
import Derivatives from './pages/Derivatives';
import Crypto from './pages/Crypto';
import Forex from './pages/Forex';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPortfolio from './pages/MyPortfolio';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Watchlist from './pages/Watchlist';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/forex" element={<Forex />} />
              <Route path="/derivatives" element={<Derivatives />} />
              <Route path="/options" element={<Options />} />
              <Route path="/portfolio" element={<MyPortfolio />} />
              <Route path="/my-portfolio" element={<MyPortfolio />} />
              <Route path="/watchlist" element={<Watchlist/>} ></Route>
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
