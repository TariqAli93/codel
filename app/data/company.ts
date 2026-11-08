// Company facts. Single source for the footer and the pages.
// Only facts given by the owner belong here; never invent anything.

export interface Service {
  title: string
  text: string
  // A page with ready-made products for this service, when there is one.
  related?: string
}

export const company = {
  name: 'Codel - كودل',
  // Website address with https:// and no trailing slash, e.g. 'https://example.com'.
  // Empty until the owner gives the domain. When it is filled in, every page gets a canonical link,
  // og:url and a full og:image address (see app/layouts/default.vue and README › دليل التسليم).
  siteUrl: '',
  founded: { idea: 2020, launch: 2024 },
  phones: {
    main: {
      label: 'هاتف وواتساب',
      display: '0782 408 2356',
      tel: 'tel:+9647824082356',
      whatsapp: 'https://wa.me/9647824082356'
    },
    secondary: {
      label: 'واتساب',
      display: '0788 484 1993',
      whatsapp: 'https://wa.me/9647884841993'
    }
  },
  email: 'business@codelapps.com',
  address: 'العراق، بغداد، الدورة، حي دجلة',
  // The same address split into parts for search engines (JSON-LD on the home page). Change both together.
  addressParts: { countryCode: 'IQ', city: 'بغداد', district: 'الدورة، حي دجلة' },
  hours: { days: 'الأحد إلى الخميس', time: 'من 10 صباحاً إلى 10 مساءً' },
  // The same hours for search engines (JSON-LD), as English day names and a 24-hour clock. Change both together.
  openingHours: { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '10:00', closes: '22:00' }
}

// The description under each service is a short draft written from the service name alone.
export const services: Service[] = [
  {
    title: 'برمجة وتصميم المواقع',
    text: 'نصمّم موقع عملك ونبرمجه، من الواجهة التي يراها الزائر إلى النظام الذي يعمل خلفها.'
  },
  {
    title: 'برمجة وتصميم تطبيقات الهواتف',
    text: 'نصمّم تطبيقات للهواتف الذكية ونبرمجها لتصل إلى عملائك على هواتفهم.'
  },
  {
    title: 'برامج الحسابات والمخازن والكاشيرات',
    text: 'برامج لتنظيم الحسابات وحركة المخازن وعمل الكاشير في محلّك أو شركتك.',
    related: '/solutions'
  },
  {
    title: 'إدارة السيرفرات',
    text: 'نتولى إعداد السيرفرات وإدارتها ومتابعتها لتبقى مواقعك وأنظمتك تعمل.'
  },
  {
    title: 'خدمات برمجية حسب الطلب',
    text: 'لديك فكرة أو احتياج غير موجود في البرامج الجاهزة؟ نبرمج لك الحل الذي يناسب عملك.'
  }
]
