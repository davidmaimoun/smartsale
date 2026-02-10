import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, Lightbulb, ShoppingBag, SquareChartGantt } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import './App.css';
import Products from './components/Products';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/insights', label: 'AI Insights', icon: <Lightbulb size={20} /> },
    { path: '/products', label: 'Products', icon: <SquareChartGantt size={20} /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>
          <ShoppingBag size={28} />
          WooAI
        </h1>
      </div>
      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function AIInsights() {
  return (
    <div>
      <div className="page-header">
        <h2>AI Insights</h2>
        <p>Intelligent recommendations to grow your business</p>
      </div>
      <div className="chart-card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Lightbulb size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h3>AI Insights Coming Soon</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            We're working on intelligent insights to help you optimize your store performance.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
