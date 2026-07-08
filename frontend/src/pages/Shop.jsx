import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/Shop.css';

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
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
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v2l-1.4 1.4L17 10.3v2A1.5 1.5 0 0115.5 14h-11A1.5 1.5 0 013 12.5v-2l1.4-1.4L3 7.5v-2z" fill="currentColor" />
    </svg>
  );
}
function IconEmpty() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path d="M14 27h44l-4.8 30.6a5 5 0 01-5 4.2H23.8a5 5 0 01-5-4.2L14 27z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M22 27v-6a10 10 0 0120 0v6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M27 40l18 12M45 40l-18 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
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

const CONDITIONS = ['Any condition', 'New', 'Like new', 'Used'];
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function formatBirr(amount) {
  return `${Number(amount || 0).toLocaleString('en-US')} birr`;
}

function normalizeProduct(product) {
  const conditionValue = String(product.product_condition || product.condition || 'new').toLowerCase();
  const conditionLabel =
    conditionValue === 'used' ? 'Used' :
    conditionValue === 'refurbished' ? 'Refurbished' :
    conditionValue === 'like new' ? 'Like new' : 'New';

  return {
    id: product.id,
    name: product.product_name || product.name || 'Untitled product',
    category: product.category_name || product.category || 'Uncategorized',
    condition: conditionLabel,
    price: Number(product.price ?? 0),
    stock: Number(product.quantity_in_stock ?? product.stock ?? 0),
    negotiable: Boolean(product.is_negotiable ?? product.negotiable),
    image: Array.isArray(product.images) ? product.images[0] : product.image || null,
  };
}

function ProductCard({ product }) {
  const item = normalizeProduct(product);

  return (
    <Link to={`/shop/${item.id}`} className="product-card">
      <div className="product-thumb">
        {item.image ? <img src={item.image} alt={item.name} className="product-image" /> : <IconDevice />}
        {item.negotiable && (
          <span className="badge-negotiate product-badge">
            <IconTicketSmall /> Negotiable
          </span>
        )}
      </div>
      <div className="product-body">
        <span className="product-condition">{item.condition}</span>
        <h3 className="product-name">{item.name}</h3>
        <div className="product-foot">
          <span className="price product-price">{formatBirr(item.price)}</span>
          <span className={`stock-dot ${item.stock > 0 ? 'stock-in' : 'stock-out'}`}>
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-card product-skeleton">
      <div className="product-thumb skeleton-block" />
      <div className="product-body">
        <div className="skeleton-line skeleton-width-40" />
        <div className="skeleton-line skeleton-width-80 skeleton-height-18" />
        <div className="skeleton-line skeleton-width-55" />
      </div>
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('Any condition');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    Promise.all([
      api.get('/products', { auth: false }),
      api.get('/categories', { auth: false }),
    ])
      .then(([productsResponse, categoriesResponse]) => {
        if (ignore) return;

        const productsPayload = Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || productsResponse?.products || [];
        const categoriesPayload = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse?.data || [];

        const normalizedProducts = (productsPayload || []).map(normalizeProduct);
        const categoryNames = categoriesPayload
          .map((entry) => entry.category_name || entry.name || entry.category)
          .filter(Boolean);
        const derivedCategories = Array.from(new Set([...categoryNames, ...normalizedProducts.map((product) => product.category).filter(Boolean)]));

        setProducts(normalizedProducts);
        setCategories(['All', ...derivedCategories]);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Could not load products right now.');
          setProducts([]);
          setCategories(['All']);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products].filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      const matchesCondition = condition === 'Any condition' || p.condition === condition;
      return matchesSearch && matchesCategory && matchesCondition;
    });

    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, search, category, condition, sort]);

  return (
    <div className="shop-page container">
      <div className="shop-head">
        <div>
          <div className="eyebrow">Marketplace</div>
          <h1>Shop everything</h1>
        </div>
        <div className="search-box">
          <IconSearch />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </div>

      {error && (
        <div className="form-error-banner shop-error">
          <IconAlert /> {error}
        </div>
      )}

      <div className="shop-layout">
        <aside className="filters">
          <div className="filter-group">
            <div className="eyebrow">Category</div>
            <div className="filter-list">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`filter-chip ${category === c ? 'filter-chip-active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="eyebrow">Condition</div>
            <div className="filter-list">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={`filter-chip ${condition === c ? 'filter-chip-active' : ''}`}
                  onClick={() => setCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="eyebrow" htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
              {SORTS.map((s) => (
                <option value={s.value} key={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </aside>

        <section className="product-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <IconEmpty />
              <h3>No listings match those filters</h3>
              <p>Try a different category or clear your search to see everything in stock.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setCondition('Any condition');
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && filtered.map((p) => <ProductCard product={p} key={p.id} />)}
        </section>
      </div>

    </div>
  );
}
