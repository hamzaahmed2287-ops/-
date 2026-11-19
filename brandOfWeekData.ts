export interface BrandProduct {
  id: number;
  name: string;
  price: string;
  imageBg: string; // ممكن تبدلها برابط صورة لاحقاً
}

export interface BrandOfWeek {
  id: string;
  brandName: string;
  tagline: { AR: string; EN: string };
  story: { AR: string; EN: string };
  // السهم الأول: المنتجات
  products: BrandProduct[];
  // السهم الثاني: رابط أو مسار فيديو استعراضي للبراند
  brandVideoUrl: string; 
  // رابط صفحة البراند عند الضغط على زرار "اكتشف الآن"
  brandPageLink: string;
}

export const weeklyBrandsData: BrandOfWeek[] = [
  {
    id: 'different-mark',
    brandName: 'البصمة المختلفة (Different Mark)',
    tagline: {
      AR: 'اكتشف البصمة المختلفة من منتجاتنا المصنوعة محلياً',
      EN: 'Discover the Different Mark from our locally made products'
    },
    story: {
      AR: 'بدأت براند "البصمة" برؤية شبابية مصرية خالصة لدمج الجودة العالية مع التصميم المعاصر، لتقديم حقائب وإكسسوارات تعبر عن شخصيتك الفريدة.',
      EN: '"The Mark" brand started with a pure Egyptian youth vision to merge high quality with contemporary design, offering bags and accessories that express your unique personality.'
    },
    products: [
      { id: 1, name: 'حقيبة كشافة القماشية', price: '450 ج.م', imageBg: '#e6e1d8' },
      { id: 2, name: 'زمزمية حرارية مميزة', price: '320 ج.م', imageBg: '#141619' },
    ],
    brandVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // رابط فيديو استعراضي تجريبي
    brandPageLink: '/brands/different-mark'
  },
  {
    id: 'cairo-Aroma',
    brandName: 'عطور القاهرة (Cairo Aroma)',
    tagline: {
      AR: 'عطور مستوحاة من أصالة الشارع المصري',
      EN: 'Fragrances inspired by the authenticity of Egyptian streets'
    },
    story: {
      AR: 'نصنع العطور الشرقية والغربية بزيوت طبيعية 100% تدوم طويلاً وتترك أثراً لا يُنسى في كل مكان تتواجد فيه.',
      EN: 'We craft oriental and western perfumes with 100% natural oils that last long and leave an unforgettable mark.'
    },
    products: [
      { id: 1, name: 'عطر العنبر الملكي', price: '650 ج.م', imageBg: '#d4af37' },
      { id: 2, name: 'مسك الياسمين', price: '480 ج.م', imageBg: '#f3e5ab' },
    ],
    brandVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    brandPageLink: '/brands/cairo-aroma'
  }
];