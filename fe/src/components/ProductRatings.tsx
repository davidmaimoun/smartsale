import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { wooCommerceAPI } from '../services/api';

interface RatedProduct {
  id: number;
  name: string;
  averageRating: number;
  ratingCount: number;
  price: string;
  image: string;
  permalink: string;
}

interface RatingsData {
  bestRated: RatedProduct[];
  worstRated: RatedProduct[];
  totalRatedProducts: number;
}

const ProductRatings: React.FC = () => {
  const [ratingsData, setRatingsData] = useState<RatingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [view, setView] = useState<'best' | 'worst'>('best');

  const fetchRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wooCommerceAPI.getProductRatings(limit);
      setRatingsData(data);
    } catch (err) {
      setError('Failed to fetch product ratings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [limit]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#f59e0b' : 'none'}
          color={i <= rating ? '#f59e0b' : '#64748b'}
        />
      );
    }
    return stars;
  };

  const ProductCard: React.FC<{ product: RatedProduct; rank: number }> = ({
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
        transition: 'background 0.5s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
    >
      {/* Rank Badge */}
      <div
        style={{
          width: '2rem',
          height: '2rem',
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
          fontSize: '0.875rem',
          flexShrink: 0,
        }}
      >
        {rank}
      </div>

      {/* Product Image */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '3rem',
            height: '3rem',
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
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '0.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {renderStars(Math.round(product.averageRating))}
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {product.averageRating.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginLeft: '0.25rem',
            }}
          >
            ({product.ratingCount} review)
          </span>
        </div>
      </div>

      {/* Price */}
      {product.price && (
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          ${product.price}
        </div>
      )}
    </div>
  );

  if (loading && !ratingsData) {
    return (
      <div className="chart-card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading ratings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <div className="error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentProducts =
    view === 'best' ? ratingsData?.bestRated : ratingsData?.worstRated;

  return (
    <div className="card chart-card">
      <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h3>Products Ratings</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {ratingsData?.totalRatedProducts || 0} products with review(s)
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: '0.5rem',
            padding: '0.25rem',
          }}
        >
          <button
            className={`btn ${view === 'best' ? 'btn-primary' : ''}`}
            onClick={() => setView('best')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              background: view === 'best' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: view === 'best' ? 'white' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Award size={16} />
            Best ratings
          </button>
          <button
            className={`btn ${view === 'worst' ? 'btn-primary' : ''}`}
            onClick={() => setView('worst')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              background: view === 'worst' ? 'var(--danger)' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: view === 'worst' ? 'white' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            To improve
          </button>
        </div>

        {/* Limit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            htmlFor="limit"
            style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
          >
            Display :
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
            <option value={5}>5 products</option>
            <option value={10}>10 products</option>
            <option value={20}>20 products</option>
            <option value={50}>50 products</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {currentProducts && currentProducts.length > 0 && (
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
              Rating mean
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
              {(
                currentProducts.reduce((sum, p) => sum + p.averageRating, 0) /
                currentProducts.length
              ).toFixed(1)}
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
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
              Total reviews
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {currentProducts.reduce((sum, p) => sum + p.ratingCount, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {currentProducts && currentProducts.length > 0 ? (
          currentProducts.map((product, index) => (
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
            <AlertTriangle size={32} style={{ marginBottom: '0.5rem' }} />
            <p>No product rated found </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRatings;
