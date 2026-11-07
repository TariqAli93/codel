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
  // { src: '/solutions/<slug>/<file>', alt: '...', width: <px>, height: <px> } to show a screenshot.
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
    images: []
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
    images: []
  }
]
