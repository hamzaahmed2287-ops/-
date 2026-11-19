'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/app/layout';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

interface ProductCardProps {
  id: number;
  title: { EN: string; AR: string };
  price: string;
  images: string[];
  category: { EN: string; AR: string };
  stock?: number;
  sizes?: string[];
  colors?: string[];
}

export default function ProductCard({ id, title, price, images, category, stock = 10, sizes = [], colors = [] }: ProductCardProps) {
  const lang = useLang();
  const isAr = lang === 'AR';
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [currentStock, setCurrentStock] = useState(stock);

  // مزامنة المخزون والبيانات من الـ API وقاعدة البيانات
  useEffect(() => {
    const syncProductStock = async () => {
      try {
        const dbProducts = await api.getProducts();
        if (Array.isArray(dbProducts)) {
          const foundInDb = dbProducts.find((p: any) => String(p.id) === String(id));
          if (foundInDb) {
            if (foundInDb.stock !== undefined) setCurrentStock(foundInDb.stock);
            if (foundInDb.sizes && foundInDb.sizes.length > 0 && !sizes.length) setSelectedSize(foundInDb.sizes[0]);
            if (foundInDb.colors && foundInDb.colors.length > 0 && !colors.length) setSelectedColor(foundInDb.colors[0]);
            return;
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for product stock');
      }

      // الخيار الاحتياطي من LocalStorage
      const storeProducts = JSON.parse(localStorage.getItem('kashafa_products') || localStorage.getItem('kashafa_admin_products') || '[]');
      const found = storeProducts.find((p: any) => String(p.id) === String(id));
      if (found) {
        if (found.stock !== undefined) setCurrentStock(found.stock);
        if (found.sizes && found.sizes.length > 0 && !sizes.length) setSelectedSize(found.sizes[0]);
        if (found.colors && found.colors.length > 0 && !colors.length) setSelectedColor(found.colors[0]);
      }
    };

    syncProductStock();
    window.addEventListener('storage', syncProductStock);
    return () => window.removeEventListener('storage', syncProductStock);
  }, [id, sizes, colors]);

  const isSoldOut = currentStock === 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images]);

  const handleIncreaseQty = () => {
    if (quantity < currentStock) {
      setQuantity((q) => q + 1);
    } else {
      alert(isAr ? `عذراً، المتاح في المخزون هو ${currentStock} قطعتين فقط!` : `Sorry, only ${currentStock} items left in stock!`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSoldOut || currentStock <= 0) return;

    if (quantity > currentStock) {
      alert(isAr ? 'الكمية المطلوبة أكبر من المخزون المتاح!' : 'Quantity exceeds available stock!');
      return;
    }

    const cartItemId = `${id}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`;

    const newItem = {
      id: cartItemId,
      productId: id,
      title: title[lang],
      price,
      image: images?.[0] || '',
      quantity,
      selectedSize: sizes.length > 0 ? selectedSize : null,
      selectedColor: colors.length > 0 ? selectedColor : null
    };

    try {
      // محاولة حفظ الكارت في الباك إند / API إن وجد إندبوينت مخصص
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.warn('Server cart sync fallback to local storage');
    }

    // التحديث المحلي للسلة
    const existingCart = JSON.parse(localStorage.getItem('kashafa_cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) => item.id === cartItemId);
    const existingQtyInCart = existingIndex > -1 ? existingCart[existingIndex].quantity : 0;

    if (existingQtyInCart + quantity > currentStock) {
      alert(isAr ? 'لا يمكنك إضافة هذه الكمية، لقد تجاوزت المخزون المتاح في السلة!' : 'Cannot add more, exceeds available stock!');
      return;
    }

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push(newItem);
    }

    localStorage.setItem('kashafa_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));

    alert(
      isAr 
        ? `تم إضافة ${quantity} قطعة إلى شنطة التسوق بنجاح! 🛍️` 
        : `Added ${quantity} item(s) to shopping bag successfully! 🛍️`
    );
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #DAD8D2',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && !isSoldOut ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? '0 15px 30px rgba(32, 35, 43, 0.1)' : '0 4px 12px rgba(32, 35, 43, 0.03)',
        direction: isAr ? 'rtl' : 'ltr',
        opacity: isSoldOut ? 0.85 : 1
      }}
    >
      <Link href={`/products/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ width: '100%', height: '220px', position: 'relative', backgroundColor: '#F9F8F6', overflow: 'hidden' }}>
          
          {!isSoldOut && currentStock <= 5 && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#B45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', zIndex: 3, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔥</span>
              <span>{isAr ? `متبقي ${currentStock}` : `${currentStock} left`}</span>
            </div>
          )}

          {isSoldOut && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
              <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', padding: '6px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '0.85rem' }}>
                {isAr ? 'نفذت الكمية (Sold Out)' : 'Sold Out'}
              </span>
            </div>
          )}

          <img 
            src={images?.[currentImageIndex] || images?.[0]} 
            alt={title[lang]} 
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)'
            }}
          />
          <span style={{
            position: 'absolute', top: '12px',
            [isAr ? 'right' : 'left']: '12px',
            backgroundColor: 'rgba(32, 35, 43, 0.75)',
            color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600'
          }}>
            {category?.[lang] || 'Kashafa'}
          </span>
        </div>
      </Link>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-between' }}>
        <Link href={`/products/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#20232B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
            {title[lang]}
          </h3>
        </Link>

        {sizes && sizes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555' }}>
              {isAr ? 'المقاس:' : 'Size:'}
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    backgroundColor: selectedSize === size ? '#20232B' : '#F5F2EC',
                    color: selectedSize === size ? '#F5F2EC' : '#20232B',
                    border: '1px solid #DAD8D2',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors && colors.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555' }}>
              {isAr ? 'اللون:' : 'Color:'}
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: selectedColor === color ? '#2D473B' : '#F5F2EC',
                    color: selectedColor === color ? '#FFFFFF' : '#20232B',
                    border: '1px solid #DAD8D2',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2D473B' }}>{price}</span>
          
          {!isSoldOut && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5F2EC', borderRadius: '20px', border: '1px solid #DAD8D2', padding: '2px 8px', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', color: '#20232B' }}
              >
                -
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#20232B', minWidth: '12px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button 
                type="button"
                onClick={handleIncreaseQty}
                style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', color: '#20232B' }}
              >
                +
              </button>
            </div>
          )}
        </div>

        <button 
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut || currentStock <= 0}
          style={{ 
            width: '100%',
            backgroundColor: isSoldOut || currentStock <= 0 ? '#DAD8D2' : '#A6C96A', 
            color: '#20232B', 
            border: '1px solid #DAD8D2', 
            padding: '10px', 
            borderRadius: '12px', 
            fontSize: '0.85rem', 
            fontWeight: '800', 
            cursor: isSoldOut || currentStock <= 0 ? 'not-allowed' : 'pointer',
            marginTop: '4px'
          }}
        >
          {isSoldOut || currentStock <= 0 ? (isAr ? 'نفذت الكمية (Sold Out)' : 'Sold Out') : (isAr ? 'أضف للشنطة' : 'Add to Bag')}
        </button>

      </div>
    </div>
  );
}