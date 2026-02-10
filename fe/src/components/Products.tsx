import React, { useEffect, useState } from 'react'
import { wooCommerceAPI } from '../services/api'
import { Package, ShoppingCart, Star, Calendar, TrendingUp, BarChart3 } from 'lucide-react'

interface ProductData {
  totalOrders: number
  totalQuantitySold: number
  totalRevenue: number
  averageRating: number
  ratingCount: number
  dateCreated: string
  dateModified: string
  stockStatus: string
  stockQuantity: number
  categories: string[]
}

const Products = () => {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'data'>('data')

  useEffect(() => {
    getProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      getProductData(selectedProduct.id)
    }
  }, [selectedProduct])

  const getProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await wooCommerceAPI.getProducts()
      setProducts(data.products)
    } catch (err) {
      setError('Failed to fetch products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getProductData = async (productId: number) => {
    setLoadingData(true)
    try {
      const data = await wooCommerceAPI.getProductData(productId)
      setProductData(data)
    } catch (err) {
      console.error('Failed to fetch product data:', err)
      setProductData(null)
    } finally {
      setLoadingData(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your stock here</p>
      </div>

      {/* GRID PRODUITS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
          paddingRight: selectedProduct ? '380px' : '0',
          transition: 'padding 0.25s ease',
        }}
      >
        {products.map((product) => {
          const image = product.images?.[0]?.src

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => setSelectedProduct(product)}
            >
              {image ? (
                <img src={image} alt={product.name} />
              ) : (
                <div
                  style={{
                    height: '180px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  📦
                </div>
              )}

              <div className="product-card-body">
                <div className="product-card-title">{product.name}</div>

                <div
                  className="product-card-desc"
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* SIDEBAR DROITE */}
      {selectedProduct && (
        <div className="product-sidebar">
          <button
            className="sidebar-close"
            onClick={() => setSelectedProduct(null)}
          >
            ✕
          </button>

          {selectedProduct.images?.[0]?.src && (
            <img
              src={selectedProduct.images[0].src}
              alt={selectedProduct.name}
            />
          )}

          <h2>{selectedProduct.name}</h2>

          <div className="price">{selectedProduct.price} ₪</div>

          {/* TABS */}
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </button>
            <button
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="tab-content">
            {activeTab === 'data' ? (
              <div className="product-data">
                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p>Loading data...</p>
                  </div>
                ) : productData ? (
                  <>
                    {/* Sales Stats */}
                    <div className="data-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} color="#10b981" />
                        Sales Statistics
                      </h3>
                      <div className="data-grid">
                        <div className="data-item">
                          <div className="data-label">
                            <ShoppingCart size={16} />
                            Orders
                          </div>
                          <div className="data-value">{productData.totalOrders}</div>
                        </div>
                        <div className="data-item">
                          <div className="data-label">
                            <Package size={16} />
                            Quantity Sold
                          </div>
                          <div className="data-value">{productData.totalQuantitySold}</div>
                        </div>
                        <div className="data-item">
                          <div className="data-label">
                            <BarChart3 size={16} />
                            Total Revenue
                          </div>
                          <div className="data-value">{productData.totalRevenue.toFixed(2)} ₪</div>
                        </div>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="data-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} color="#f59e0b" />
                        Ratings
                      </h3>
                      <div className="data-grid">
                        <div className="data-item">
                          <div className="data-label">Average Rating</div>
                          <div className="data-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {productData.averageRating.toFixed(1)}
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                          </div>
                        </div>
                        <div className="data-item">
                          <div className="data-label">Reviews Count</div>
                          <div className="data-value">{productData.ratingCount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="data-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={20} color="#6366f1" />
                        Inventory
                      </h3>
                      <div className="data-grid">
                        <div className="data-item">
                          <div className="data-label">Status</div>
                          <div className="data-value">
                            <span
                              className="status-badge"
                              style={{
                                background:
                                  productData.stockStatus === 'instock'
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                color:
                                  productData.stockStatus === 'instock'
                                    ? '#10b981'
                                    : '#ef4444',
                              }}
                            >
                              {productData.stockStatus === 'instock' ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                        {productData.stockQuantity !== null && (
                          <div className="data-item">
                            <div className="data-label">Quantity</div>
                            <div className="data-value">{productData.stockQuantity}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="data-section">
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="#8b5cf6" />
                        Dates
                      </h3>
                      <div className="data-grid">
                        <div className="data-item">
                          <div className="data-label">Created Date</div>
                          <div className="data-value" style={{ fontSize: '0.875rem' }}>
                            {formatDate(productData.dateCreated)}
                          </div>
                        </div>
                        <div className="data-item">
                          <div className="data-label">Last Modified</div>
                          <div className="data-value" style={{ fontSize: '0.875rem' }}>
                            {formatDate(productData.dateModified)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    {productData.categories.length > 0 && (
                      <div className="data-section">
                        <h3>Categories</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {productData.categories.map((cat, idx) => (
                            <span key={idx} className="category-badge">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>No data available</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedProduct.description,
                }}
              />
            )}
          </div>

          <a
            href={selectedProduct.permalink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '1rem', display: 'inline-block' }}
          >
            View Product
          </a>
        </div>
      )}
    </>
  )
}

export default Products