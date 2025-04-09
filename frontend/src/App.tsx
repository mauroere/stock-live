import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StockAnalysis from './pages/StockAnalysis';
import MarketOverview from './pages/MarketOverview';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container component="main" sx={{ flex: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock-analysis" element={<StockAnalysis />} />
            <Route path="/market-overview" element={<MarketOverview />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;