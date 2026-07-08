import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/ProductDetail.css';

function IconDevice() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <rect x="14" y="12" width="36" height="34" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M24 52h16M32 46v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 24l7 7 13-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    </svg>
  );
}

function IconTicketSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v2l-1.4 1.4L17 10.3v2A1.5 1.5 0 0115.5 14h-11A1.5 1.5 0 013 12.5v-2l1.4-1.4L3 7.5v-2z" fill="currentColor" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4.5L6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v4.2M10 13.3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 6.5v7L10 17l7-3.5v-7M10 10v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M9.5 3H5a2 2 0 00-2 2v4.5c0 .53.21 1.04.59 1.41l7 7a2 2 0 002.82 0l3.68-3.68a2 2 0 000-2.82l-7-7A2 2 0 009.5 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="6.5" cy="6.5" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 8l1-4h12l1 4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 8a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 8.5V17h12V8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 17v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    api
      .get(`/products/${id}`, { auth: false })
      .then((data) => {
        if (!ignore) setProduct(data.data || data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Could not load this product.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  function handleNegotiate() {
    alert('Negotiation opens here soon — for now, reach out to the seller directly.');
  }

  if (loading) {
    return (
      <div className="container product-detail">
        <div className="skeleton-line back-skeleton" />
        <div className="detail-grid">
          <div className="detail-image skeleton-block" />
          <div className="detail-info">
            <div className="skeleton-line skeleton-width-30" />
            <div className="skeleton-line skeleton-width-70 skeleton-height-30 mt-12" />
            <div className="skeleton-line skeleton-width-40 skeleton-height-26 mt-16" />
            <div className="skeleton-line skeleton-width-100 skeleton-height-90 mt-24" />
            <div className="skeleton-line skeleton-width-35 skeleton-height-46 mt-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container product-detail">
        <div className="detail-error">
          <IconAlert />
          <h2>{error || 'Product not found'}</h2>
          <p>The listing may have sold out or moved. Head back and take another look.</p>
          <Link to="/shop" className="btn btn-primary">Back to shop</Link>
        </div>
      </div>
    );
  }

  const stock = product.quantity_in_stock ?? 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="container product-detail">
      <Link to="/shop" className="back-link">
        <IconArrowLeft /> Back to shop
      </Link>

      <div className="detail-grid">
        <div className="detail-image">
          <IconDevice />
          {product.is_negotiable && (
            <span className="badge-negotiate detail-badge">
              <IconTicketSmall /> Negotiable
            </span>
          )}
        </div>

        <div className="detail-info">
          <span className="product-condition">{product.product_condition || 'New'}</span>
          <h1 className="detail-title">{product.product_name}</h1>
          <p className="price detail-price">{formatBirr(product.price)}</p>

          <div className="detail-meta">
            <span>
              <IconBox />
              {isOutOfStock ? 'Out of stock' : `${stock} available`}
            </span>
            <span>
              <IconTag />
              {product.category_name || 'Uncategorized'}
            </span>
            <span>
              <IconEye />
              {product.view_count || 0} views
            </span>
          </div>

          <p className="detail-description">{product.description || 'No description available.'}</p>

          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
            >
              {adding ? 'Adding…' : (isOutOfStock ? 'Out of stock' : 'Add to cart')}
            </button>
            {product.is_negotiable && (
              <button className="btn btn-outline" onClick={handleNegotiate}>
                <IconTicketSmall /> Make an offer
              </button>
            )}
          </div>

          <div className="detail-seller">
            <div className="eyebrow">Seller</div>
            <div className="seller-row">
              <span className="seller-icon">
                <IconStore />
              </span>
              <div>
                <p className="seller-name">{product.seller_name || 'Unknown seller'}</p>
                <p className="seller-store">{product.store_name || 'Store name not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}