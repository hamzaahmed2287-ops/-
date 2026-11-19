'use client';
import { useState, useEffect } from 'react';

interface ProductsManagerProps {
  isAr: boolean;
  products: any[];
  brands: any[];
  onSaveProducts: (updated: any[]) => void;
  showToast: (msg: string) => void;
}

export default function ProductsManager({ isAr, products, brands, onSaveProducts, showToast }: ProductsManagerProps) {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('10');
  
  const [category, setCategory] = useState('fashion');
  const [subCategory, setSubCategory] = useState('women');
  
  const [sizesInput, setSizesInput] = useState('S, M, L, XL أو 38, 39, 40');
  const [colorsInput, setColorsInput] = useState('أسود, أبيض, كحلي');
  
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.nameEn || 'Kashafa Studio');
  
  const [isDiscovery, setIsDiscovery] = useState(false);
  const [isOffer, setIsOffer] = useState(false);

  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');

  // جلب المنتجات من قاعدة البيانات عند التحميل
  useEffect(() => {
    const fetchProductsFromApi = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            onSaveProducts(data);
          }
        }
      } catch (err) {
        console.warn('Using local products state fallback');
      }
    };
    fetchProductsFromApi();
  }, []);

  const subCategoriesMap: Record<string, { EN: { id: string; name: string }[]; AR: { id: string; name: string }[] }> = {
    'fashion': {
      EN: [{ id: 'women', name: 'Women Wear' }, { id: 'men', name: 'Men Wear' }, { id: 'shoes', name: 'Shoes & Bags' }],
      AR: [{ id: 'women', name: 'ملابس نسائية' }, { id: 'men', name: 'ملابس رجالية' }, { id: 'shoes', name: 'أحذية وحقائب' }]
    },
    'beauty-care': {
      EN: [{ id: 'skincare', name: 'Skincare' }, { id: 'shampoo', name: 'Shampoo & Hair' }, { id: 'perfumes', name: 'Fragrances' }],
      AR: [{ id: 'skincare', name: 'العناية بالبشرة' }, { id: 'shampoo', name: 'الشامبو والعناية بالشعر' }, { id: 'perfumes', name: 'العطور ومستحضرات التجميل' }]
    },
    'accessories': {
      EN: [{ id: 'general-acc', name: 'General Accessories' }, { id: 'bags', name: 'Bags & Wallets' }],
      AR: [{ id: 'general-acc', name: 'إكسسوارات عادية' }, { id: 'bags', name: 'حقائب ومحافظ' }]
    },
    'pet-products': {
      EN: [{ id: 'supplies', name: 'Pet Supplies' }, { id: 'food', name: 'Food & Treats' }],
      AR: [{ id: 'supplies', name: 'مستلزمات الحيوانات' }, { id: 'food', name: 'طعام ومكافآت' }]
    },
    'home-living': {
      EN: [{ id: 'candles', name: 'Candles & Scents' }, { id: 'decor', name: 'Home Decor' }],
      AR: [{ id: 'candles', name: 'الشموع المعطرة' }, { id: 'decor', name: 'ديكورات المنزل' }]
    },
    'electronics': {
      EN: [{ id: 'gaming-headsets', name: 'Gaming Headsets' }, { id: 'keyboards-mice', name: 'Keyboards & Mice' }, { id: 'storage-pc', name: 'Hard Drives & PC' }],
      AR: [{ id: 'gaming-headsets', name: 'سماعات الألعاب' }, { id: 'keyboards-mice', name: 'الكيبوردات والماوسات' }, { id: 'storage-pc', name: 'الهاردات ومستلزمات الكمبيوتر' }]
    },
    'sports': {
      EN: [
        { id: 'training-tools', name: 'Training Equipment' },
        { id: 'sports-whistles', name: 'Sports Whistles' },
        { id: 'fitness-gym', name: 'Fitness & Gym' },
        { id: 'sport-accessories', name: 'Sport Accessories' }
      ],
      AR: [
        { id: 'training-tools', name: 'أدوات التدريب الرياضية' },
        { id: 'sports-whistles', name: 'الصفارات الرياضية' },
        { id: 'fitness-gym', name: 'معدات اللياقة والجيم' },
        { id: 'sport-accessories', name: 'إكسسوارات رياضية' }
      ]
    }
  };

  const langKey = isAr ? 'AR' : 'EN';
  const currentSubCategoriesList = subCategoriesMap[category]?.[langKey] || subCategoriesMap['fashion'][langKey];

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFiles((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !price || imageFiles.length === 0) {
      alert(isAr ? 'برجاء إدخال اسم المنتج، السعر، ورفع صورة واحدة على الأقل' : 'Please fill name, price, and upload at least one image');
      return;
    }

    const parsedStock = parseInt(stock) || 10;
    const activeSubCatEn = subCategoriesMap[category]?.['EN'].find((s: { id: string; name: string }) => s.id === subCategory) || { id: subCategory, name: subCategory };
    const activeSubCatAr = subCategoriesMap[category]?.['AR'].find((s: { id: string; name: string }) => s.id === subCategory) || { id: subCategory, name: subCategory };

    const parsedSizes = sizesInput ? sizesInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const parsedColors = colorsInput ? colorsInput.split(',').map((c) => c.trim()).filter(Boolean) : [];

    const newProd = {
      id: Date.now(),
      nameAr,
      nameEn: nameEn || nameAr,
      title: { AR: nameAr, EN: nameEn || nameAr },
      price: parseFloat(price) || 0,
      oldPrice: isOffer && oldPrice ? parseFloat(oldPrice) : null,
      stock: parsedStock,
      initialStock: parsedStock,
      category,
      subCategory: activeSubCatEn.id,
      subCategoryObj: { EN: activeSubCatEn.name, AR: activeSubCatAr.name },
      sizes: parsedSizes,
      colors: parsedColors,
      brand: selectedBrand,
      images: imageFiles,
      image: imageFiles[0],
      description: { AR: descAr, EN: descEn },
      isDiscovery,
      isOffer
    };

    const updated = [newProd, ...products.filter(p => String(p.id) !== String(newProd.id))];
    onSaveProducts(updated);

    // إرسال المنتج الجديد لقاعدة البيانات عبر الـ API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    } catch (err) {
      console.warn('Server product add failed, saved locally');
    }

    try {
      localStorage.setItem('kashafa_admin_products', JSON.stringify(updated));
      localStorage.setItem('kashafa_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }

    showToast(isAr ? '✓ تمت إضافة المنتج وتخزينه بنجاح!' : '✓ Product added and saved!');
    
    setNameAr('');
    setNameEn('');
    setPrice('');
    setOldPrice('');
    setSizesInput('');
    setColorsInput('');
    setImageFiles([]);
    setDescAr('');
    setDescEn('');
    setIsDiscovery(false);
    setIsOffer(false);
  };

  const toggleSection = async (id: any, field: 'isDiscovery' | 'isOffer') => {
    const updated = products.map((p) => (String(p.id) === String(id) ? { ...p, [field]: !p[field] } : p));
    onSaveProducts(updated);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const targetProduct = updated.find(p => String(p.id) === String(id));
      if (targetProduct) {
        await fetch(`${API_BASE_URL}/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: targetProduct[field] })
        });
      }
    } catch (err) {
      console.warn('Server toggle sync failed');
    }

    try {
      localStorage.setItem('kashafa_products', JSON.stringify(updated));
      localStorage.setItem('kashafa_admin_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج نهائياً؟' : 'Are you sure you want to delete this product?')) {
      return;
    }

    const updated = products.filter((p) => String(p.id) !== String(id));
    onSaveProducts(updated);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server product delete failed');
    }

    try {
      localStorage.setItem('kashafa_admin_products', JSON.stringify(updated));
      localStorage.setItem('kashafa_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }

    showToast(isAr ? '✓ تم حذف المنتج نهائياً' : '✓ Product permanently deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
          {isAr ? 'إضافة منتج وتحديد المقاسات والألوان والأقسام' : 'Add Product, Sizes & Colors'}
        </h2>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              type="text" 
              placeholder={isAr ? 'اسم المنتج بالعربية' : 'Product Name (AR)'} 
              value={nameAr} 
              onChange={(e) => setNameAr(e.target.value)} 
              required 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
            <input 
              type="text" 
              placeholder={isAr ? 'اسم المنتج بالإنجليزية' : 'Product Name (EN)'} 
              value={nameEn} 
              onChange={(e) => setNameEn(e.target.value)} 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <input 
              type="number" 
              placeholder={isAr ? 'السعر (ج.م)' : 'Price (EGP)'} 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
            <input 
              type="number" 
              placeholder={isAr ? 'المخزون' : 'Stock Qty'} 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none' }} 
            />
            
            <select 
              value={category} 
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                const firstSubId = subCategoriesMap[newCat]?.[langKey]?.[0]?.id || '';
                setSubCategory(firstSubId);
              }} 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', backgroundColor: '#FFF', fontWeight: '700', outline: 'none' }}
            >
              <option value="fashion">{isAr ? 'أزياء (Fashion)' : 'Fashion'}</option>
              <option value="accessories">{isAr ? 'إكسسوارات (Accessories)' : 'Accessories'}</option>
              <option value="beauty-care">{isAr ? 'العناية والجمال (Beauty)' : 'Beauty & Care'}</option>
              <option value="home-living">{isAr ? 'المنزل والمعيشة (Home)' : 'Home & Living'}</option>
              <option value="electronics">{isAr ? 'إلكترونيات (Electronics)' : 'Electronics'}</option>
              <option value="pet-products">{isAr ? 'مستلزمات الحيوانات (Pets)' : 'Pet Products'}</option>
              <option value="sports">{isAr ? 'أدوات رياضية (Sports)' : 'Sports'}</option>
            </select>

            <select 
              value={subCategory} 
              onChange={(e) => setSubCategory(e.target.value)} 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #2D473B', backgroundColor: '#F0ECE1', fontWeight: '700', outline: 'none' }}
            >
              {currentSubCategoriesList.map((sub: { id: string; name: string }) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem' }}>
                {isAr ? 'المقاسات (مفصولة بفاصلة):' : 'Sizes (comma separated):'}
              </label>
              <input 
                type="text" 
                placeholder={isAr ? 'مثال: 38, 39, 40 أو S, M, L' : 'e.g. 38,39,40 or S,M,L'} 
                value={sizesInput} 
                onChange={(e) => setSizesInput(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none', fontWeight: '700', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem' }}>
                {isAr ? 'الألوان المتاحة (مفصولة بفاصلة):' : 'Colors (comma separated):'}
              </label>
              <input 
                type="text" 
                placeholder={isAr ? 'مثال: أسود, أبيض, كحلي' : 'e.g. Black, White, Navy'} 
                value={colorsInput} 
                onChange={(e) => setColorsInput(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', outline: 'none', fontWeight: '700', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#F5F2EC', padding: '16px 20px', borderRadius: '14px', border: '1px solid #DAD8D2' }}>
            <label style={{ display: 'block', fontWeight: '800', marginBottom: '12px', fontSize: '0.9rem', color: '#20232B' }}>
              {isAr ? 'أين تريد عرض هذا المنتج في المتجر؟' : 'Where should this product appear?'}
            </label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: isDiscovery ? '#2D473B' : '#FFFFFF', color: isDiscovery ? '#FFFFFF' : '#20232B', padding: '10px 18px', borderRadius: '12px', border: '1px solid #DAD8D2', fontWeight: '700' }}>
                <input type="checkbox" checked={isDiscovery} onChange={(e) => setIsDiscovery(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#A6C96A' }} />
                <span>✨ {isAr ? 'الاكتشافات (Discoveries)' : 'Discoveries'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: isOffer ? '#B45309' : '#FFFFFF', color: isOffer ? '#FFFFFF' : '#20232B', padding: '10px 18px', borderRadius: '12px', border: '1px solid #DAD8D2', fontWeight: '700' }}>
                <input type="checkbox" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#F59E0B' }} />
                <span>🔥 {isAr ? 'العروض (Offers)' : 'Offers'}</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem' }}>
              {isAr ? 'اختر البراند التابع له المنتج:' : 'Select Product Brand:'}
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', backgroundColor: '#FFF', fontWeight: '700' }}
            >
              {brands.map((b: any) => (
                <option key={b.id} value={b.nameEn}>
                  {isAr ? b.nameAr : b.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>
              {isAr ? 'ارفع صور المنتج:' : 'Upload Product Images:'}
            </label>
            <input type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #DAD8D2', backgroundColor: '#FFF' }} />
            {imageFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {imageFiles.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={img} alt="" style={{ width: '65px', height: '65px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #DAD8D2' }} />
                    <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <textarea placeholder={isAr ? 'وصف المنتج بالعربية' : 'Description (AR)'} value={descAr} onChange={(e) => setDescAr(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', minHeight: '80px', outline: 'none' }} />
            <textarea placeholder={isAr ? 'وصف المنتج بالإنجليزية' : 'Description (EN)'} value={descEn} onChange={(e) => setDescEn(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', minHeight: '80px', outline: 'none' }} />
          </div>

          <button type="submit" style={{ backgroundColor: '#A6C96A', color: '#20232B', border: 'none', padding: '14px', borderRadius: '25px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' }}>
            {isAr ? 'حفظ وإضافة المنتج 🚀' : 'Save & Add Product 🚀'}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>{isAr ? 'المنتجات المسجلة' : 'Registered Products'}</h2>
        {products.length === 0 ? (
          <p style={{ color: '#666' }}>{isAr ? 'لا توجد منتجات مسجلة حالياً.' : 'No products found.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #DAD8D2', backgroundColor: '#F9F8F6', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={p.images?.[0] || p.image} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '800', color: '#20232B' }}>{isAr ? (p.nameAr || p.title?.AR) : (p.nameEn || p.title?.EN)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {p.brand} • {p.category} • <strong>{p.price} {isAr ? 'ج.م' : 'EGP'}</strong>
                      {p.sizes && p.sizes.length > 0 && ` • ${isAr ? 'المقاسات:' : 'Sizes:'} ${p.sizes.join(', ')}`}
                      {p.colors && p.colors.length > 0 && ` • ${isAr ? 'الألوان:' : 'Colors:'} ${p.colors.join(', ')}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => toggleSection(p.id, 'isDiscovery')} style={{ backgroundColor: p.isDiscovery ? '#2D473B' : '#E5E7EB', color: p.isDiscovery ? '#FFFFFF' : '#4B5563', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                    ✨ {isAr ? 'اكتشافات' : 'Discovery'}
                  </button>
                  <button type="button" onClick={() => toggleSection(p.id, 'isOffer')} style={{ backgroundColor: p.isOffer ? '#D97706' : '#E5E7EB', color: p.isOffer ? '#FFFFFF' : '#4B5563', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                    🔥 {isAr ? 'عروض' : 'Offer'}
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id)} style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                    {isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}