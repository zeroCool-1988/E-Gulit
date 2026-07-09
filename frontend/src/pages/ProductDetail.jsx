import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getStoredUser } from '../api/apiClient';
import '../styles/ProductDetail.css';

function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}

function IconZoom() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35M16 11h-4M14 9v4"/>
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IconStarFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

function getConditionLabel(condition) {
  const map = {
    new: 'New',
    used: 'Used',
    refurbished: 'Refurbished',
  };
  return map[condition] || condition;
}

function getConditionColor(condition) {
  const map = {
    new: '#2e7d32',
    used: '#f57c00',
    refurbished: '#6a1b9a',
  };
  return map[condition] || '#666';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;
  const totalStars = 5;

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <IconStarFilled key={`full-${i}`} />
      ))}
      {hasHalfStar && <IconStarFilled key="half" />}
      {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <IconStar key={`empty-${i}`} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const imageContainerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`, { auth: false }),
      api.get(`/reviews/product/${id}`, { auth: false }),
    ])
      .then(([productRes, reviewsRes]) => {
        const p = productRes.data || productRes.data?.data || productRes;
        setProduct(p);

        const imgList = p.images && p.images.length > 0 ? p.images : ['/placeholder.png'];
        setImages(imgList);
        setCurrentIndex(0);

        // Parse reviews response
        const reviewsData = reviewsRes.data?.data || reviewsRes.data || reviewsRes;
        setReviews(reviewsData.reviews || []);
        setReviewStats({
          average: parseFloat(reviewsData.average) || 0,
          total: parseInt(reviewsData.total) || 0,
        });

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load product.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handleLightboxPrev(e);
      } else if (e.key === 'ArrowRight') {
        handleLightboxNext(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images]);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLightboxOpen = () => {
    setLightboxIndex(currentIndex);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleLightboxClose = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleLightboxNext = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const handleLightboxPrev = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleNegotiate = () => {
    if (!user) {
      alert('Please log in to negotiate.');
      navigate('/login');
      return;
    }
    alert('Negotiation feature coming soon.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: `Check out ${product.product_name} on E-Gulit!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-grid skeleton">
            <div className="left-col">
              <div className="main-image skeleton-block" />
              <div className="thumbnails skeleton-thumbs">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton-thumb" />)}
              </div>
            </div>
            <div className="right-col">
              <div className="skeleton-line" style={{ width: '80%', height: 32 }} />
              <div className="skeleton-line" style={{ width: '40%', height: 24 }} />
              <div className="skeleton-line" style={{ width: '60%', height: 28 }} />
              <div className="skeleton-line" style={{ width: '100%', height: 80 }} />
              <div className="skeleton-line" style={{ width: '70%', height: 40 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>{error || 'Product not found'}</h2>
            <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex] || '/placeholder.png';
  const isOutOfStock = (product.quantity_in_stock || 0) === 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.product_name}</span>
        </div>

        <div className="product-detail-grid">
          <div className="left-col">
            <div
              className={`main-image-wrapper ${isZoomed ? 'zoomed' : ''}`}
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={currentImage}
                alt={product.product_name}
                onClick={handleLightboxOpen}
                className="main-image"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(2.2)',
                      }
                    : {}
                }
              />
              <button className="zoom-icon" onClick={handleLightboxOpen}>
                <IconZoom />
              </button>
              {images.length > 1 && (
                <>
                  <button className="nav-arrow nav-left" onClick={handlePrev}>
                    <IconArrowLeft />
                  </button>
                  <button className="nav-arrow nav-right" onClick={handleNext}>
                    <IconArrowRight />
                  </button>
                  <span className="image-counter">{currentIndex + 1} / {images.length}</span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="right-col">
            <h1 className="product-name">{product.product_name}</h1>
            <div className="product-meta">
              <span className="category">{product.category_name || 'Uncategorized'}</span>
              {product.is_negotiable && (
                <span className="badge-negotiate">Negotiable</span>
              )}
            </div>

            <div className="product-price">{formatBirr(product.price)}</div>

            <div className="product-attributes">
              <span
                className="condition-badge"
                style={{ backgroundColor: getConditionColor(product.product_condition) }}
              >
                {getConditionLabel(product.product_condition)}
              </span>
              <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.quantity_in_stock})`}
              </span>
            </div>

            <div className="product-description">
              <p>{product.description || 'No description available.'}</p>
            </div>

            <div className="seller-card">
              <div className="seller-info">
                <div className="seller-avatar">
                  <span>{product.seller_name ? product.seller_name.charAt(0).toUpperCase() : '?'}</span>
                </div>
                <div className="seller-details">
                  <span className="seller-name">{product.seller_name || 'Unknown Seller'}</span>
                  <span className="seller-store">{product.store_name || ''}</span>
                </div>
              </div>
              <Link to={`/seller/${product.seller_id}`} className="btn btn-outline btn-sm">
                View Seller Profile
              </Link>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg add-to-cart"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
              >
                <IconCart /> {adding ? 'Adding…' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {product.is_negotiable && (
                <button className="btn btn-outline btn-lg" onClick={handleNegotiate}>
                  Negotiate Price
                </button>
              )}
              <button className="btn btn-outline btn-lg share-btn" onClick={handleShare}>
                <IconShare /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="product-extras">
          <div className="description-section">
            <h2>Product Description</h2>
            <p>{product.description || 'No description available.'}</p>
          </div>
          <div className="specs-section">
            <h2>Specifications</h2>
            <table>
              <tbody>
                <tr><td>Condition</td><td>{getConditionLabel(product.product_condition)}</td></tr>
                <tr><td>Category</td><td>{product.category_name || 'Uncategorized'}</td></tr>
                <tr><td>Stock</td><td>{product.quantity_in_stock || 0} units</td></tr>
                <tr><td>Views</td><td>{product.view_count || 0}</td></tr>
                <tr><td>Added</td><td>{new Date(product.created_at).toLocaleDateString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            {reviewStats.total > 0 && (
              <div className="reviews-summary">
                <div className="reviews-average">
                  <span className="avg-number">{reviewStats.average.toFixed(1)}</span>
                  <StarRating rating={reviewStats.average} />
                  <span className="review-count">({reviewStats.total} reviews)</span>
                </div>
              </div>
            )}
          </div>

          {reviewStats.total === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet for this product.</p>
              <p className="no-reviews-sub">Be the first to review!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="review-avatar">
                        {review.username ? review.username.charAt(0).toUpperCase() : '?'}
                      </span>
                      <span className="review-username">{review.username || 'Anonymous'}</span>
                    </div>
                    <div className="review-meta">
                      <StarRating rating={review.rating} />
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <div className="review-body">
                    <p>{review.comment || 'No comment provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="related-section">
          <h2>You might also like</h2>
          <div className="related-grid">
            <p style={{ color: 'var(--color-text-muted)' }}>Related products coming soon.</p>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={handleLightboxClose}>
          <button className="lightbox-close" onClick={handleLightboxClose}>
            <IconClose />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex] || '/placeholder.png'}
              alt="Product"
              className="lightbox-image"
            />
            <button className="lightbox-nav lightbox-prev" onClick={handleLightboxPrev}>
              <IconArrowLeft />
            </button>
            <button className="lightbox-nav lightbox-next" onClick={handleLightboxNext}>
              <IconArrowRight />
            </button>
            <span className="lightbox-counter">{lightboxIndex + 1} / {images.length}</span>
          </div>
          <div className="lightbox-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`lightbox-thumb ${idx === lightboxIndex ? 'active' : ''}`}
                onClick={() => setLightboxIndex(idx)}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}