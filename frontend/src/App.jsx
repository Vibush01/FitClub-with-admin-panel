import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Home from './pages/Home';
    import './index.css';

    function App() {
      return (
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Router>
      );
    }

    export default App;