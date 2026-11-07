// Ready-made products. Single source for /solutions, /solutions/[slug], the home page and the FAQ.
// Names and prices come from the owner. Descriptions and features are taken from each product's
// repository (README, package description, API modules) and are waiting for the owner's review.

export interface SolutionImage {
  src: string
  // Arabic description of what the screenshot shows.
  alt: string
  // The file's real size in pixels. The browser uses them to reserve space before the image loads.
  width: number
  height: number
}

export interface Solution {
  slug: string
  nameAr: string
  nameEn: string
  tagline: string
  description: string
  features: string[]
  priceIqd: number
  platform: string
  // Files live in public/solutions/<slug>/. Add
  // { src: '/images/solutions/<slug>/<file>', alt: '...', width: <px>, height: <px> } to show a screenshot.
  images: SolutionImage[]
}

export const solutions: Solution[] = [
  {
    slug: 'nuqta-plus',
    nameAr: 'نقطة بلس',
    nameEn: 'Nuqta Plus',
    tagline: 'نظام إدارة نقاط البيع والمخازن',
    description: 'برنامج لإدارة نقاط البيع والمخازن، من البيع والفواتير إلى المشتريات وحركة البضائع بين المخازن.',
    features: [
      'نقاط البيع وفواتير المبيعات',
      'المنتجات والتصنيفات',
      'المخازن والتحويل بينها',
      'المشتريات والموردون',
      'العملاء والبيع بالتقسيط',
      'المصروفات والخزينة',
      'الفروع',
      'المستخدمون والصلاحيات',
      'التقارير المالية وتقارير المبيعات',
      'النسخ الاحتياطي'
    ],
    priceIqd: 175000,
    platform: 'ويندوز',
    images: [{ src: '/images/solutions/nuqta-plus/pos.webp', alt: 'شاشة نقطة البيع في نقطة بلس: بطاقات المنتجات بأسعارها، والسلة على الجانب', width: 1600, height: 900 }, { src: '/images/solutions/nuqta-plus/dashboard.webp', alt: 'الشاشة الرئيسية في نقطة بلس: مبيعات اليوم وأرباحه وفواتيره، وعمليات سريعة، ومخطط الأداء', width: 1600, height: 900 }, { src: '/images/solutions/nuqta-plus/inventory.webp', alt: 'إدارة المخزون في نقطة بلس: قائمة البضاعة بأسعارها وكمياتها وحدّها الأدنى وحالة صلاحيتها', width: 1600, height: 900 }, { src: '/images/solutions/nuqta-plus/sales-report.webp', alt: 'تقرير المبيعات في نقطة بلس بالوضع الداكن: إجمالي المبيعات والخصومات وعدد الفواتير، وجدول الفواتير', width: 1600, height: 900 }]
  },
  {
    slug: 'dalaly',
    nameAr: 'دلالي',
    nameEn: 'Dalaly',
    tagline: 'إدارة عروض مكاتب العقارات',
    description: 'برنامج مكتبي لإدارة عروض العقارات في مكاتب الوساطة العقارية في العراق. يعمل على جهاز واحد بقاعدة بيانات محلية.',
    features: [
      'الأشخاص والعقارات والإيجارات والطلبات، والمطابقة بينها',
      'الصفقات والعروض ومراحل البيع',
      'المهام والمتابعات',
      'الحسابات: دليل الحسابات والقيود والإيصالات والمدفوعات والعمولات',
      'العقود بقوالب جاهزة',
      'صور العقارات وحفظ المستندات',
      'استيراد البيانات من إكسل وتصدير قوائم العقارات بصيغة PDF',
      'التقارير المالية والتشغيلية',
      'النسخ الاحتياطي والاستعادة'
    ],
    priceIqd: 150000,
    platform: 'ويندوز',
    images: [{ src: '/images/solutions/dalaly/properties.webp', alt: 'قائمة عروض البيع في دلالي: العقارات بنوعها وموقعها ومساحتها وسعرها وحالتها', width: 1366, height: 768 }, { src: '/images/solutions/dalaly/dashboard.webp', alt: 'لوحة التحكم في دلالي: عمليات سريعة، ومهام ومتابعات، ومطابقة العروض لطلبات الزبائن', width: 1366, height: 768 }, { src: '/images/solutions/dalaly/property.webp', alt: 'تفاصيل عقار في دلالي: السعر والموقع والمساحة والمالك، وصور العقار، وبيانات الموقع والقطعة', width: 1366, height: 768 }]
  }
]
