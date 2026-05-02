import { ObjetivoCampana, NivelAlcance, CampanaSugerencias } from '../models/types';

export const WIZARD_SUGERENCIAS: Record<ObjetivoCampana, Record<NivelAlcance, CampanaSugerencias>> = {
  awareness: {
    nano: {
      presupuestoMin: 10000, presupuestoSugerido: 25000, presupuestoMax: 60000,
      minimoSeguidoresMin: 1000, minimoSeguidoresSugerido: 5000, minimoSeguidoresMax: 10000,
      cantidadInfluencersSugerida: 8,
      descripcionAlcance: 'Nano (1k-10k seg.)',
      descripcionImpacto: 'Comunidades muy activas, altisimo engagement',
      kpisSugeridos: ['engagement', 'contenido_ugc']
    },
    micro: {
      presupuestoMin: 30000, presupuestoSugerido: 80000, presupuestoMax: 200000,
      minimoSeguidoresMin: 10000, minimoSeguidoresSugerido: 30000, minimoSeguidoresMax: 100000,
      cantidadInfluencersSugerida: 5,
      descripcionAlcance: 'Micro (10k-100k seg.)',
      descripcionImpacto: 'Mejor ROI del mercado, autoridad en nicho',
      kpisSugeridos: ['alcance', 'engagement']
    },
    macro: {
      presupuestoMin: 150000, presupuestoSugerido: 400000, presupuestoMax: 900000,
      minimoSeguidoresMin: 100000, minimoSeguidoresSugerido: 300000, minimoSeguidoresMax: 1000000,
      cantidadInfluencersSugerida: 2,
      descripcionAlcance: 'Macro (100k-1M seg.)',
      descripcionImpacto: 'Alcance masivo, reconocimiento de marca',
      kpisSugeridos: ['alcance', 'engagement']
    },
    mega: {
      presupuestoMin: 600000, presupuestoSugerido: 1500000, presupuestoMax: 5000000,
      minimoSeguidoresMin: 1000000, minimoSeguidoresSugerido: 2000000, minimoSeguidoresMax: 20000000,
      cantidadInfluencersSugerida: 1,
      descripcionAlcance: 'Mega / Celebrity (1M+ seg.)',
      descripcionImpacto: 'Impacto de celebridad, alcance de millones',
      kpisSugeridos: ['alcance']
    }
  },
  ventas: {
    nano: {
      presupuestoMin: 8000, presupuestoSugerido: 20000, presupuestoMax: 50000,
      minimoSeguidoresMin: 1000, minimoSeguidoresSugerido: 4000, minimoSeguidoresMax: 10000,
      cantidadInfluencersSugerida: 10,
      descripcionAlcance: 'Nano (1k-10k seg.)',
      descripcionImpacto: 'Maxima conversion, audiencia fiel y comprometida',
      kpisSugeridos: ['ventas', 'clicks', 'engagement']
    },
    micro: {
      presupuestoMin: 25000, presupuestoSugerido: 70000, presupuestoMax: 180000,
      minimoSeguidoresMin: 10000, minimoSeguidoresSugerido: 25000, minimoSeguidoresMax: 100000,
      cantidadInfluencersSugerida: 6,
      descripcionAlcance: 'Micro (10k-100k seg.)',
      descripcionImpacto: 'Buen balance alcance-conversion',
      kpisSugeridos: ['ventas', 'clicks', 'alcance']
    },
    macro: {
      presupuestoMin: 120000, presupuestoSugerido: 350000, presupuestoMax: 800000,
      minimoSeguidoresMin: 100000, minimoSeguidoresSugerido: 250000, minimoSeguidoresMax: 1000000,
      cantidadInfluencersSugerida: 2,
      descripcionAlcance: 'Macro (100k-1M seg.)',
      descripcionImpacto: 'Volumen de ventas a escala',
      kpisSugeridos: ['ventas', 'alcance']
    },
    mega: {
      presupuestoMin: 500000, presupuestoSugerido: 1200000, presupuestoMax: 4000000,
      minimoSeguidoresMin: 1000000, minimoSeguidoresSugerido: 1500000, minimoSeguidoresMax: 15000000,
      cantidadInfluencersSugerida: 1,
      descripcionAlcance: 'Mega / Celebrity (1M+ seg.)',
      descripcionImpacto: 'Pico masivo de ventas, efecto hype',
      kpisSugeridos: ['ventas', 'alcance']
    }
  },
  lanzamiento: {
    nano: {
      presupuestoMin: 15000, presupuestoSugerido: 35000, presupuestoMax: 80000,
      minimoSeguidoresMin: 2000, minimoSeguidoresSugerido: 6000, minimoSeguidoresMax: 10000,
      cantidadInfluencersSugerida: 8,
      descripcionAlcance: 'Nano (1k-10k seg.)',
      descripcionImpacto: 'Lanzamiento autentico y organico, word-of-mouth',
      kpisSugeridos: ['engagement', 'contenido_ugc']
    },
    micro: {
      presupuestoMin: 40000, presupuestoSugerido: 120000, presupuestoMax: 280000,
      minimoSeguidoresMin: 10000, minimoSeguidoresSugerido: 30000, minimoSeguidoresMax: 100000,
      cantidadInfluencersSugerida: 5,
      descripcionAlcance: 'Micro (10k-100k seg.)',
      descripcionImpacto: 'Cobertura de nicho con credibilidad',
      kpisSugeridos: ['alcance', 'engagement', 'contenido_ugc']
    },
    macro: {
      presupuestoMin: 200000, presupuestoSugerido: 500000, presupuestoMax: 1200000,
      minimoSeguidoresMin: 100000, minimoSeguidoresSugerido: 300000, minimoSeguidoresMax: 1000000,
      cantidadInfluencersSugerida: 2,
      descripcionAlcance: 'Macro (100k-1M seg.)',
      descripcionImpacto: 'Lanzamiento con cobertura masiva',
      kpisSugeridos: ['alcance', 'ventas', 'engagement']
    },
    mega: {
      presupuestoMin: 800000, presupuestoSugerido: 2000000, presupuestoMax: 8000000,
      minimoSeguidoresMin: 1000000, minimoSeguidoresSugerido: 2000000, minimoSeguidoresMax: 20000000,
      cantidadInfluencersSugerida: 1,
      descripcionAlcance: 'Mega / Celebrity (1M+ seg.)',
      descripcionImpacto: 'Lanzamiento de alto impacto, efecto viral',
      kpisSugeridos: ['alcance', 'ventas']
    }
  },
  ugc: {
    nano: {
      presupuestoMin: 5000, presupuestoSugerido: 15000, presupuestoMax: 40000,
      minimoSeguidoresMin: 500, minimoSeguidoresSugerido: 2000, minimoSeguidoresMax: 10000,
      cantidadInfluencersSugerida: 12,
      descripcionAlcance: 'Nano (1k-10k seg.)',
      descripcionImpacto: 'Maximo volumen de contenido autentico',
      kpisSugeridos: ['contenido_ugc', 'engagement']
    },
    micro: {
      presupuestoMin: 20000, presupuestoSugerido: 60000, presupuestoMax: 150000,
      minimoSeguidoresMin: 10000, minimoSeguidoresSugerido: 20000, minimoSeguidoresMax: 100000,
      cantidadInfluencersSugerida: 7,
      descripcionAlcance: 'Micro (10k-100k seg.)',
      descripcionImpacto: 'Contenido de calidad con algo de alcance',
      kpisSugeridos: ['contenido_ugc', 'engagement', 'alcance']
    },
    macro: {
      presupuestoMin: 100000, presupuestoSugerido: 250000, presupuestoMax: 600000,
      minimoSeguidoresMin: 100000, minimoSeguidoresSugerido: 200000, minimoSeguidoresMax: 1000000,
      cantidadInfluencersSugerida: 3,
      descripcionAlcance: 'Macro (100k-1M seg.)',
      descripcionImpacto: 'Contenido premium con amplia difusion',
      kpisSugeridos: ['contenido_ugc', 'alcance', 'ventas']
    },
    mega: {
      presupuestoMin: 400000, presupuestoSugerido: 900000, presupuestoMax: 3000000,
      minimoSeguidoresMin: 1000000, minimoSeguidoresSugerido: 1500000, minimoSeguidoresMax: 10000000,
      cantidadInfluencersSugerida: 1,
      descripcionAlcance: 'Mega / Celebrity (1M+ seg.)',
      descripcionImpacto: 'UGC de celebridad, viralidad asegurada',
      kpisSugeridos: ['contenido_ugc', 'alcance']
    }
  }
};

export interface Advertencia {
  tipo: 'warning' | 'info';
  mensaje: string;
}

export const KPI_LABELS: Record<string, string> = {
  alcance: 'Alcance',
  engagement: 'Engagement',
  clicks: 'Clicks',
  ventas: 'Ventas',
  contenido_ugc: 'Contenido UGC',
  seguidores: 'Nuevos seguidores'
};

export const KPI_OPTIONS = Object.entries(KPI_LABELS).map(([value, label]) => ({ value, label }));
