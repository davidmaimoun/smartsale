import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, ShoppingBag, Award } from 'lucide-react';
import { wooCommerceAPI } from '../services/api';

interface BestSellerProduct {
  id: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  image: string;
  price: string;
}

interface BestSellersData {
  products: BestSellerProduct[];
  totalProducts: number;
}

const BestSellers: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<BestSellersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  const fetchBestSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wooCommerceAPI.getBestSellers(limit);
      setBestSellers(data);
    } catch (err) {
      setError('Failed to fetch best sellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, [limit]);

  const ProductCard: React.FC<{ product: BestSellerProduct; rank: number }> = ({
    product,
    rank,
  }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        transition: 'transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
    >
      {/* Rank Badge */}
      <div
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background:
            rank === 1
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : rank === 2
              ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
              : rank === 3
              ? 'linear-gradient(135deg, #d97706, #92400e)'
              : 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1rem',
          flexShrink: 0,
        }}
      >
        {rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
      </div>

      {/* Product Image */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '0.375rem',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}

      {/* Product Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Package size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {product.totalQuantity.toLocaleString()} sold
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <DollarSign size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
              ${product.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      {product.price && (
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--primary)',
            flexShrink: 0,
          }}
        >
          ${product.price}
        </div>
      )}
    </div>
  );

  if (loading && !bestSellers) {
    return (
      <div className="card chart-card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading best sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card chart-card">
        <div className="error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={24} color="#6366f1" />
            Best Sellers All Time
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Top performing products since store opening
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            htmlFor="limit"
            style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
          >
            Show:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {bestSellers && bestSellers.products.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.25rem',
              }}
            >
              Total Units Sold
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {bestSellers.products
                .reduce((sum, p) => sum + p.totalQuantity, 0)
                .toLocaleString()}
              <Package size={20} color="#6366f1" />
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.25rem',
              }}
            >
              Total Revenue
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              ${bestSellers.products
                .reduce((sum, p) => sum + p.totalRevenue, 0)
                .toLocaleString()}
              <DollarSign size={20} color="#10b981" />
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {bestSellers && bestSellers.products.length > 0 ? (
          bestSellers.products.map((product, index) => (
            <ProductCard key={product.id} product={product} rank={index + 1} />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-muted)',
            }}
          >
            <ShoppingBag size={32} style={{ marginBottom: '0.5rem' }} />
            <p>No sales data found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellers;
