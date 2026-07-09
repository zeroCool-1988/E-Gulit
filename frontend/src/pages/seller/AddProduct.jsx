import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
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

const MAX_IMAGES = 5;

export default function AddProduct() {
  const navigate = useNavigate();

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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function updateCheckbox(field) {
    return (e) => setForm({ ...form, [field]: e.target.checked });
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imageFiles.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = '';
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

    setImageFiles(prev => [...prev, ...filesToAdd]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  }

  function removeImage(index) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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

    for (const file of imageFiles) {
      formData.append('images', file);
    }

    try {
      await api.post('/products', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not add product.');
      setSubmitting(false);
    }
  }

  return (
    <div className="container seller-product-form">
      <Link to="/dashboard" className="back-link">
        <IconArrowLeft /> Back to Dashboard
      </Link>

      <h1>Add New Product</h1>

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
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((src, index) => (
                <div key={index} className="image-preview">
                  <img src={src} alt={`Preview ${index + 1}`} />
                  <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                    <IconClose />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: '6px' }}>
            {imageFiles.length}/{MAX_IMAGES} images selected
          </p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Product'}
          </button>
          <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}