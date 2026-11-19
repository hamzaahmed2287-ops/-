export const STORE_CATEGORIES = [
  { id: 'fashion', nameEn: 'Fashion', nameAr: 'أزياء', icon: '👗' },
  { id: 'beauty-care', nameEn: 'Beauty & Care', nameAr: 'جمال وعناية', icon: '✨' },
  { id: 'accessories', nameEn: 'Accessories', nameAr: 'إكسسوارات', icon: '👜' },
  { id: 'pet-products', nameEn: 'Pet Products', nameAr: 'منتجات الحيوانات', icon: '🐾' },
  { id: 'home-living', nameEn: 'Home & Living', nameAr: 'حاجات البيت', icon: '🏠' },
  { id: 'electronics', nameEn: 'Electronics', nameAr: 'إلكترونيات', icon: '🎧' },
  { id: 'sports', nameEn: 'Sports Equipment', nameAr: 'أدوات رياضية', icon: '⚽' }
];

export interface Governorate {
  id: string;
  nameEn: string;
  nameAr: string;
  shippingFee: number;
}

export const EGYPT_GOVERNORATES: Governorate[] = [
  { id: 'cairo', nameEn: 'Cairo', nameAr: 'القاهرة', shippingFee: 50 },
  { id: 'giza', nameEn: 'Giza', nameAr: 'الجيزة', shippingFee: 50 },
  { id: 'alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', shippingFee: 65 },
  { id: 'qalyubia', nameEn: 'Qalyubia', nameAr: 'القليوبية', shippingFee: 60 },
  { id: 'sharqia', nameEn: 'Sharqia', nameAr: 'الشرقية', shippingFee: 70 },
  { id: 'dakahlia', nameEn: 'Dakahlia', nameAr: 'الدقهلية', shippingFee: 70 },
  { id: 'gharbia', nameEn: 'Gharbia', nameAr: 'الغربية', shippingFee: 70 },
  { id: 'monufia', nameEn: 'Monufia', nameAr: 'المنوفية', shippingFee: 70 },
  { id: 'beheira', nameEn: 'Beheira', nameAr: 'البحيرة', shippingFee: 75 },
  { id: 'kafr-el-sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', shippingFee: 75 },
  { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', shippingFee: 75 },
  { id: 'port-said', nameEn: 'Port Said', nameAr: 'بورسعيد', shippingFee: 75 },
  { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', shippingFee: 70 },
  { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', shippingFee: 70 },
  { id: 'fayoum', nameEn: 'Fayoum', nameAr: 'الفيوم', shippingFee: 75 },
  { id: 'beni-suef', nameEn: 'Beni Suef', nameAr: 'بني سويف', shippingFee: 80 },
  { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', shippingFee: 85 },
  { id: 'asyut', nameEn: 'Asyut', nameAr: 'أسيوط', shippingFee: 90 },
  { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', shippingFee: 95 },
  { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', shippingFee: 100 },
  { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', shippingFee: 105 },
  { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', shippingFee: 110 },
  { id: 'red-sea', nameEn: 'Red Sea', nameAr: 'البحر الأحمر', shippingFee: 110 },
  { id: 'matrouh', nameEn: 'Matrouh', nameAr: 'مطروح', shippingFee: 110 },
  { id: 'new-valley', nameEn: 'New Valley', nameAr: 'الوادي الجديد', shippingFee: 120 },
  { id: 'north-sinai', nameEn: 'North Sinai', nameAr: 'شمال سيناء', shippingFee: 115 },
  { id: 'south-sinai', nameEn: 'South Sinai', nameAr: 'جنوب سيناء', shippingFee: 115 }
];