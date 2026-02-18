import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  TrendingUp, TrendingDown, ShoppingCart,
  DollarSign, Package, Users, Calendar, PlugZap,
  Settings,
  FlaskConical,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { wooCommerceAPI } from '../services/api';
import type { SalesMetrics } from '../types';
import ProductRatings from './ProductRatings';
import BestSellers from './BestSellers';
import DemoModeToggle from './DemoModeToggle';
import DatePills from './DatePills';
import { useDemoMode } from '../contexts/DemoContext';
import { useConnection } from '../contexts/ConnectionContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [metrics, setMetrics]   = useState<SalesMetrics | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [activeDays, setActiveDays] = useState<number | null>(7);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  const { isDemoMode }              = useDemoMode();
  const { isConnected, isChecking } = useConnection();

  const navigate = useNavigate();
  const { toggleDemoMode } = useDemoMode();

  // ✅ Ne fetch que si demo OU connecté — jamais à vide
  const canFetch = isDemoMode || isConnected === true;

  useEffect(() => {
    if (isChecking) {
      const timer = setTimeout(() => {
        setShowLoadingSpinner(true);
      }, 1500);  // ← 1.5 secondes, ajuste selon ton goût
      
      return () => clearTimeout(timer);
    } else {
      setShowLoadingSpinner(false);
    }

    if (canFetch) {
      setMetrics(null);
      fetchMetrics();
    }
  }, [dateRange, isDemoMode, isConnected, isChecking]);

  const fetchMetrics = async () => {
    if (!canFetch) return;
    setLoading(true);
    setError(null);
    try {
      const data = await wooCommerceAPI.getSalesMetrics(
        dateRange.startDate,
        dateRange.endDate
      );
      setMetrics(data);
    } catch (err) {
      setError("Failed to load data. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveDays(null);
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleQuickDate = (days: number) => {
    setActiveDays(days);
    setDateRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    iconColor: string;
  }> = ({ title, value, change, icon, iconColor }) => (
    <div className="card metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className={`metric-icon ${iconColor}`}>{icon}</div>
      </div>
      <div className="metric-value">{value}</div>
      {change !== undefined && (
        <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
        </div>
      )}
    </div>
  );

  // ── États d'affichage ─────────────────────────────────────

  // 1. Vérification de la session en cours
  if (isChecking) {
    if (!showLoadingSpinner) {
      return null; 
    }
    
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Checking connection...</p>
      </div>
    );
  }

  // 2. Ni demo ni connecté → invite à agir
  if (!canFetch) {
    
    return (
      <div>
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Monitor your WooCommerce store performance in real-time</p>
        </div>

        <DemoModeToggle />
       
        <div className="empty-state">

          {/* Icône avec animation ripple */}
          <div className="empty-state-icon-wrapper">
            <div className="empty-state-icon-bg">
              <PlugZap size={38} strokeWidth={1.5} />
            </div>
          </div>

          <h3>No data source connected</h3>

          <p>
            Enable <strong>Demo Mode</strong> to explore with sample data,<br />
            or connect your <strong>WooCommerce store</strong> in Settings.
          </p>

          {/* Pills d'action */}
          <div className="empty-state-actions">
            <button className="empty-state-pill primary" onClick={toggleDemoMode}>
              <FlaskConical size={14} />
              Try Demo Mode
            </button>
            <button className="empty-state-pill secondary" onClick={() => navigate('/settings')}>
              <Settings size={14} />
              Go to Settings
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. Chargement initial
  if (loading && !metrics) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // ── Dashboard principal ───────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Monitor your WooCommerce store performance in real-time</p>
      </div>

      <DemoModeToggle />

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {metrics && (
        <>
          {/* Date Filter */}
          <div className="card date-filter">
            <div className="filter-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
              <button className="btn btn-primary" onClick={fetchMetrics}>
                <Calendar size={18} />
                Apply Filter
              </button>
            </div>
            <DatePills activeDays={activeDays} onChange={handleQuickDate} />
          </div>

          {/* Metrics Grid */}
          <div className="metrics-grid">
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              change={metrics.previousPeriodComparison.revenueChange}
              icon={<DollarSign size={24} />}
              iconColor="green"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders.toLocaleString()}
              change={metrics.previousPeriodComparison.ordersChange}
              icon={<ShoppingCart size={24} />}
              iconColor="blue"
            />
            <MetricCard
              title="Average Order Value"
              value={`$${metrics.averageOrderValue.toFixed(2)}`}
              icon={<Package size={24} />}
              iconColor="purple"
            />
            <MetricCard
              title="Products Sold"
              value={metrics.totalSales.toLocaleString()}
              change={metrics.previousPeriodComparison.salesChange}
              icon={<Users size={24} />}
              iconColor="orange"
            />
          </div>

          {/* Charts */}
          {metrics.totalOrders > 0 && (
            <div className="charts-grid">
              <div className="card chart-card">
                <div className="chart-header">
                  <h3>Sales Trend</h3>
                  <p>Daily revenue and order performance</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.salesByDay}>
                    <CartesianGrid vertical={false} horizontal={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card chart-card">
                <div className="chart-header">
                  <h3>Top Products</h3>
                  <p>Best performing products by revenue</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid vertical={false} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
                    <Bar dataKey="revenue" fill="#6366f1" name="Revenue ($)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <BestSellers />
          <ProductRatings />
        </>
      )}
    </div>
  );
};

export default Dashboard;
