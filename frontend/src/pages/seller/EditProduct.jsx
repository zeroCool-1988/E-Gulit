import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getStoredUser } from '../../api/apiClient';
import '../../styles/SellerProductForm.css';

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4.5L6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

const MAX_IMAGES = 5;

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    quantity_in_stock: '',
    product_condition: 'new',
    is_negotiable: false,
    is_featured: false,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((data) => {
        const product = data.data || data;
        if (product.seller_id !== user.id) {
          setError('You do not own this product.');
          setLoading(false);
          return;
        }
        setForm({
          product_name: product.product_name || '',
          description: product.description || '',
          price: product.price || '',
          quantity_in_stock: product.quantity_in_stock || '',
          product_condition: product.product_condition || 'new',
          is_negotiable: product.is_negotiable || false,
          is_featured: product.is_featured || false,
        });
        setExistingImages(product.images || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load product.');
        setLoading(false);
      });
  }, [id, user.id]);

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function updateCheckbox(field) {
    return (e) => setForm({ ...form, [field]: e.target.checked });
  }

  function removeExistingImage(index) {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index) {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentTotal = existingImages.length + newImageFiles.length;
    const remainingSlots = MAX_IMAGES - currentTotal;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = '';
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const previews = filesToAdd.map(file => URL.createObjectURL(file));

    setNewImageFiles(prev => [...prev, ...filesToAdd]);
    setNewImagePreviews(prev => [...prev, ...previews]);
    e.target.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('product_name', form.product_name);
    formData.append('description', form.description || '');
    formData.append('price', form.price);
    formData.append('quantity_in_stock', form.quantity_in_stock || 0);
    formData.append('product_condition', form.product_condition);
    formData.append('is_negotiable', form.is_negotiable);
    formData.append('is_featured', form.is_featured);

    formData.append('existing_images', JSON.stringify(existingImages));

    for (const file of newImageFiles) {
      formData.append('images', file);
    }

    try {
      await api.put(`/products/${id}`, formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not update product.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container seller-product-form">
        <h1>Edit Product</h1>
        <div className="form-skeleton">
          <div className="skeleton-line" style={{ height: 40, marginBottom: 16 }} />
          <div className="skeleton-line" style={{ height: 40, marginBottom: 16 }} />
          <div className="skeleton-line" style={{ height: 100, marginBottom: 16 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container seller-product-form">
        <Link to="/dashboard" className="back-link">
          <IconArrowLeft /> Back to Dashboard
        </Link>
        <div className="form-error-banner">
          <IconAlert /> {error}
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="container seller-product-form">
      <Link to="/dashboard" className="back-link">
        <IconArrowLeft /> Back to Dashboard
      </Link>

      <h1>Edit Product</h1>

      <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
        <div className="field">
          <label>Product Name *</label>
          <input type="text" value={form.product_name} onChange={updateField('product_name')} required />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows="4" value={form.description} onChange={updateField('description')} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Price (ETB) *</label>
            <input type="number" step="0.01" min="0.01" value={form.price} onChange={updateField('price')} required />
          </div>
          <div className="field">
            <label>Stock Quantity *</label>
            <input type="number" min="0" value={form.quantity_in_stock} onChange={updateField('quantity_in_stock')} required />
          </div>
        </div>

        <div className="field">
          <label>Condition</label>
          <select value={form.product_condition} onChange={updateField('product_condition')}>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>

        <div className="checkbox-row">
          <label>
            <input type="checkbox" checked={form.is_negotiable} onChange={updateCheckbox('is_negotiable')} />
            Negotiable
          </label>
          <label>
            <input type="checkbox" checked={form.is_featured} onChange={updateCheckbox('is_featured')} />
            Featured
          </label>
        </div>

        <div className="field">
          <label>Images (max 5) — First image will be the main cover photo</label>

          {existingImages.length > 0 && (
            <div className="image-previews">
              {existingImages.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Image ${index + 1}`} />
                  <button type="button" className="remove-image" onClick={() => removeExistingImage(index)}>
                    <IconClose />
                  </button>
                </div>
              ))}
            </div>
          )}

          {newImagePreviews.length > 0 && (
            <div className="image-previews">
              {newImagePreviews.map((src, index) => (
                <div key={index} className="image-preview">
                  <img src={src} alt={`New ${index + 1}`} />
                  <button type="button" className="remove-image" onClick={() => removeNewImage(index)}>
                    <IconClose />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImages < MAX_IMAGES && (
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: '6px' }}>
            {totalImages}/{MAX_IMAGES} images
            {existingImages.length > 0 && ` (${existingImages.length} existing)`}
            {newImageFiles.length > 0 && `, ${newImageFiles.length} new`}
          </p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}