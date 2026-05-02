export interface CampanaTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  colorClase: string;
  valores: {
    titulo?: string;
    descripcion?: string;
    presupuesto?: number;
    cantidadInfluencers?: number;
    minimoSeguidores?: number;
    tipoPago?: string;
    tonoComunicacion?: string;
    kpisEsperados?: string[];
    publicoObjetivo?: string;
    hashtags?: string[];
  };
}

export const CAMPAIGN_TEMPLATES: CampanaTemplate[] = [
  {
    id: 'lanzamiento',
    nombre: 'Lanzamiento de producto',
    descripcion: 'Presentá tu nuevo producto con impacto',
    icono: '🚀',
    colorClase: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    valores: {
      titulo: 'Lanzamiento [Producto] — [Mes] 2026',
      descripcion: 'Estamos lanzando [producto] y buscamos influencers que quieran ser los primeros en mostrarlo a su audiencia. Buscamos contenido auténtico que refleje la experiencia real con el producto.',
      presupuesto: 300000,
      cantidadInfluencers: 4,
      minimoSeguidores: 20000,
      tipoPago: 'mixto',
      tonoComunicacion: 'inspiracional',
      kpisEsperados: ['alcance', 'engagement', 'ventas'],
      publicoObjetivo: 'Adultos 18-35 interesados en [categoría del producto]'
    }
  },
  {
    id: 'awareness',
    nombre: 'Awareness de marca',
    descripcion: 'Aumentá el reconocimiento de tu marca',
    icono: '📢',
    colorClase: 'bg-purple-50 border-purple-200 text-purple-700',
    valores: {
      titulo: 'Campaña de Marca — [Nombre Marca]',
      descripcion: 'Queremos que más personas conozcan nuestra marca y propuesta de valor. Buscamos influencers que compartan nuestros valores y puedan transmitirlos de forma auténtica.',
      presupuesto: 150000,
      cantidadInfluencers: 6,
      minimoSeguidores: 8000,
      tipoPago: 'monetario',
      tonoComunicacion: 'informal',
      kpisEsperados: ['alcance', 'engagement'],
      publicoObjetivo: 'Audiencia amplia, enfocada en [nicho de la marca]'
    }
  },
  {
    id: 'review',
    nombre: 'Review de producto',
    descripcion: 'Conseguí reseñas auténticas y contenido UGC',
    icono: '⭐',
    colorClase: 'bg-amber-50 border-amber-200 text-amber-700',
    valores: {
      titulo: 'Reviews y UGC — [Producto]',
      descripcion: 'Enviamos el producto al influencer para que lo pruebe y comparta su experiencia honesta. Buscamos contenido de calidad que podamos reutilizar en nuestras redes.',
      presupuesto: 60000,
      cantidadInfluencers: 8,
      minimoSeguidores: 5000,
      tipoPago: 'canje',
      tonoComunicacion: 'informal',
      kpisEsperados: ['contenido_ugc', 'engagement'],
      publicoObjetivo: 'Comunidades especializadas en [categoría]',
      hashtags: ['#Review', '#UGC']
    }
  },
  {
    id: 'estacional',
    nombre: 'Campaña estacional',
    descripcion: 'Aprovechá una fecha clave del calendario',
    icono: '🎯',
    colorClase: 'bg-rose-50 border-rose-200 text-rose-700',
    valores: {
      titulo: 'Campaña [Fecha/Evento] — [Marca]',
      descripcion: 'Campaña especial para [evento/fecha]. Buscamos influencers que generen contenido temático y promuevan nuestra oferta especial de forma creativa y urgente.',
      presupuesto: 200000,
      cantidadInfluencers: 5,
      minimoSeguidores: 15000,
      tipoPago: 'monetario',
      tonoComunicacion: 'humoristico',
      kpisEsperados: ['ventas', 'alcance', 'clicks'],
      publicoObjetivo: 'Compradores activos en [categoría] durante la fecha'
    }
  }
];
