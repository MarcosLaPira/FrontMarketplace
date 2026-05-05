import { Component, output, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ObjetivoCampana, NivelAlcance, WizardResult } from '../../models/types';
import { WIZARD_SUGERENCIAS } from '../../shared/campana-benchmarks';
import { CAMPAIGN_TEMPLATES, CampanaTemplate } from '../../shared/campana-templates';
import { CampanaAlcancePreviewComponent } from '../campana-alcance-preview/campana-alcance-preview.component';

interface ObjetivoCard {
  id: ObjetivoCampana;
  titulo: string;
  descripcion: string;
  icono: string;
  colorIcono: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

interface NivelCard {
  id: NivelAlcance;
  titulo: string;
  descripcion: string;
  icono: string;
  rangoSeguidores: string;
  seguidoresMin: number;
  seguidoresMax: number | null; // null = sin techo (Mega)
  precioPorInfluencerMin: number; // 30% × seguidores mínimos del tier
  precioPorInfluencerMax: number | null; // null = sin techo (Mega)
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
}

@Component({
  selector: 'app-campana-wizard',
  standalone: true,
  imports: [DecimalPipe, CampanaAlcancePreviewComponent],
  templateUrl: './campana-wizard.component.html'
})
export class CampanaWizardComponent {
  completado = output<WizardResult>();
  omitido = output<void>();

  paso = signal<1 | 2>(1);
  objetivoSeleccionado = signal<ObjetivoCampana | null>(null);
  nivelSeleccionado = signal<NivelAlcance | null>(null);
  presupuestoTweak = signal<number | null>(null);
  cantidadInfluencersTweak = signal<number | null>(null);
  templateSeleccionado = signal<CampanaTemplate | null>(null);

  readonly templates = CAMPAIGN_TEMPLATES;

  // Mapa objetivo → id de la plantilla que le corresponde por defecto
  private readonly OBJETIVO_TEMPLATE_MAP: Record<ObjetivoCampana, string> = {
    lanzamiento: 'lanzamiento',
    awareness:   'awareness',
    ugc:         'review',
    ventas:      'estacional'
  };

  // Mapa inverso: template.id → objetivo (para calcular sugerencias al cambiar plantilla)
  private readonly TEMPLATE_OBJETIVO_MAP: Record<string, ObjetivoCampana> = {
    lanzamiento: 'lanzamiento',
    awareness:   'awareness',
    review:      'ugc',
    estacional:  'ventas'
  };

  // Plantilla que corresponde al objetivo seleccionado (auto-aplicada)
  templateDeObjetivo = computed<CampanaTemplate | null>(() => {
    const obj = this.objetivoSeleccionado();
    if (!obj) return null;
    const id = this.OBJETIVO_TEMPLATE_MAP[obj];
    return this.templates.find(t => t.id === id) ?? null;
  });

  // Plantillas alternativas (las que no corresponden al objetivo actual)
  templatesAlternativos = computed<CampanaTemplate[]>(() => {
    const obj = this.objetivoSeleccionado();
    if (!obj) return this.templates;
    const idActual = this.OBJETIVO_TEMPLATE_MAP[obj];
    return this.templates.filter(t => t.id !== idActual);
  });

  sugerenciasActivas = computed(() => {
    const obj = this.objetivoSeleccionado();
    const nivel = this.nivelSeleccionado();
    if (!obj || !nivel) return null;
    return WIZARD_SUGERENCIAS[obj][nivel];
  });

  minimoSeguidoresPreview = computed(() => this.sugerenciasActivas()?.minimoSeguidoresSugerido ?? null);

  minimoSeguidoresTweak = signal<number | null>(null);
  minimoSeguidoresEfectivo = computed(() => this.minimoSeguidoresTweak() ?? this.minimoSeguidoresPreview());

  // Chips de seguidores adaptados al tier activo
  chipsSeguidoresTier = computed<{ label: string; val: number; color: string }[]>(() => {
    const card = this.nivelCard();
    if (!card) return [];
    const fmtK = (n: number) => n >= 1000000 ? (n / 1000000) + 'M' : (n / 1000) + 'k';
    const chip = (val: number, color: string) => ({ label: fmtK(val), val, color });
    if (card.id === 'nano') return [
      chip(1000,  'bg-emerald-50 text-emerald-600 border-emerald-200'),
      chip(5000,  'bg-emerald-50 text-emerald-600 border-emerald-200'),
      chip(10000, 'bg-emerald-50 text-emerald-600 border-emerald-200')
    ];
    if (card.id === 'micro') return [
      chip(10000, 'bg-blue-50 text-blue-600 border-blue-200'),
      chip(25000, 'bg-blue-50 text-blue-600 border-blue-200'),
      chip(50000, 'bg-blue-50 text-blue-600 border-blue-200')
    ];
    if (card.id === 'macro') return [
      chip(100000, 'bg-violet-50 text-violet-600 border-violet-200'),
      chip(250000, 'bg-violet-50 text-violet-600 border-violet-200'),
      chip(500000, 'bg-violet-50 text-violet-600 border-violet-200')
    ];
    // mega
    return [
      chip(500000,  'bg-amber-50 text-amber-600 border-amber-200'),
      chip(1000000, 'bg-amber-50 text-amber-600 border-amber-200'),
      chip(2000000, 'bg-amber-50 text-amber-600 border-amber-200')
    ];
  });

  // Advertencia cuando el mínimo de seguidores está fuera del rango del tier seleccionado
  advertenciaMinimoSeguidores = computed<string | null>(() => {
    const card = this.nivelCard();
    const minSeg = this.minimoSeguidoresEfectivo();
    if (!card || !minSeg || minSeg <= 0) return null;
    if (minSeg < card.seguidoresMin) {
      return `${(minSeg / 1000).toFixed(0)}k seguidores está por debajo del mínimo del tier ${card.titulo} (${card.rangoSeguidores}). Ajustá el filtro o cambiá el nivel de alcance.`;
    }
    if (card.seguidoresMax !== null && minSeg > card.seguidoresMax) {
      return `${minSeg >= 1000000 ? (minSeg/1000000)+'M' : (minSeg/1000)+'k'} seguidores supera el rango ${card.titulo} (${card.rangoSeguidores}). Ajustá el filtro o cambiá el nivel de alcance.`;
    }
    return null;
  });

  // true = el usuario puede avanzar; false = hay errores bloqueantes
  puedeAvanzar = computed<boolean>(() => {
    if (this.advertenciaMinimoSeguidores() !== null) return false;
    if (this.advertenciaRango()?.tipo === 'bajo') return false;
    return true;
  });

  // Card del objetivo seleccionado (para reusar su título/descripción/ícono en paso 2)
  objetivoCard = computed(() => {
    const obj = this.objetivoSeleccionado();
    return obj ? (this.objetivos.find(o => o.id === obj) ?? null) : null;
  });

  // Card del nivel seleccionado
  nivelCard = computed(() => {
    const n = this.nivelSeleccionado();
    return n ? (this.niveles.find(c => c.id === n) ?? null) : null;
  });

  // Advertencia cuando el presupuesto/influencer se sale del rango del tier elegido
  advertenciaRango = computed<{ tipo: 'bajo' | 'alto'; mensaje: string } | null>(() => {
    const card  = this.nivelCard();
    const pres  = this.presupuestoTweak();
    const cant  = this.cantidadInfluencersTweak() ?? this.cantidadInfluencersEfectiva();
    if (!card || !pres || !cant) return null;
    const ppi = pres / cant;
    if (ppi < card.precioPorInfluencerMin) {
      const falta = Math.ceil((card.precioPorInfluencerMin * cant) - pres);
      return { tipo: 'bajo', mensaje: `$${Math.round(ppi).toLocaleString('es-AR')} por influencer está por debajo del rango ${card.titulo} ($${card.precioPorInfluencerMin.toLocaleString('es-AR')}+). Faltan ~$${falta.toLocaleString('es-AR')} para alcanzar el mínimo.` };
    }
    if (card.precioPorInfluencerMax !== null && ppi > card.precioPorInfluencerMax) {
      return { tipo: 'alto', mensaje: `$${Math.round(ppi).toLocaleString('es-AR')} por influencer supera el rango ${card.titulo}. Con ese presupuesto podés apuntar al tier siguiente.` };
    }
    return null;
  });

  // Rango de presupuesto de referencia: tier × cantidad de influencers efectiva
  presupuestoRefRango = computed<{ min: number; max: number | null } | null>(() => {
    const card = this.nivelCard();
    const cant = this.cantidadInfluencersTweak() ?? this.cantidadInfluencersEfectiva();
    if (!card || !cant) return null;
    return {
      min: card.precioPorInfluencerMin * cant,
      max: card.precioPorInfluencerMax !== null ? card.precioPorInfluencerMax * cant : null
    };
  });

  // Cantidad de influencers efectiva: el tweak manual tiene prioridad; fallback a sugerencias del tier activo
  cantidadInfluencersEfectiva = computed(() => {
    return this.cantidadInfluencersTweak() ?? this.sugerenciasActivas()?.cantidadInfluencersSugerida ?? null;
  });

  readonly objetivos: ObjetivoCard[] = [
    {
      id: 'awareness',
      titulo: 'Notoriedad de marca',
      descripcion: 'Que más gente te conozca y recuerde',
      icono: '📢',
      colorIcono: 'text-purple-600',
      colorBg: 'bg-purple-50',
      colorBorder: 'border-purple-300',
      colorText: 'text-purple-700'
    },
    {
      id: 'ventas',
      titulo: 'Generar ventas',
      descripcion: 'Convertir seguidores en compradores',
      icono: '🛒',
      colorIcono: 'text-green-600',
      colorBg: 'bg-green-50',
      colorBorder: 'border-green-300',
      colorText: 'text-green-700'
    },
    {
      id: 'lanzamiento',
      titulo: 'Lanzar un producto',
      descripcion: 'Presentar algo nuevo al mercado',
      icono: '🚀',
      colorIcono: 'text-indigo-600',
      colorBg: 'bg-indigo-50',
      colorBorder: 'border-indigo-300',
      colorText: 'text-indigo-700'
    },
    {
      id: 'ugc',
      titulo: 'Contenido UGC',
      descripcion: 'Obtener fotos y videos auténticos de tu producto',
      icono: '📸',
      colorIcono: 'text-amber-600',
      colorBg: 'bg-amber-50',
      colorBorder: 'border-amber-300',
      colorText: 'text-amber-700'
    }
  ];

  readonly niveles: NivelCard[] = [
    {
      id: 'nano',
      titulo: 'Nano',
      descripcion: 'Comunidades pequeñas y súper comprometidas. El mejor engagement del mercado.',
      icono: '🎯',
      rangoSeguidores: '1k – 10k seguidores',
      seguidoresMin: 1000,
      seguidoresMax: 10000,
      precioPorInfluencerMin: 300,
      precioPorInfluencerMax: 3000,
      colorBg: 'bg-emerald-50',
      colorBorder: 'border-emerald-300',
      colorText: 'text-emerald-700',
      colorBadge: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'micro',
      titulo: 'Micro',
      descripcion: 'Autoridad en su nicho, alta credibilidad. El mejor ROI del mercado.',
      icono: '⚡',
      rangoSeguidores: '10k – 100k seguidores',
      seguidoresMin: 10000,
      seguidoresMax: 100000,
      precioPorInfluencerMin: 3000,
      precioPorInfluencerMax: 30000,
      colorBg: 'bg-blue-50',
      colorBorder: 'border-blue-300',
      colorText: 'text-blue-700',
      colorBadge: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'macro',
      titulo: 'Macro',
      descripcion: 'Gran alcance y reconocimiento. Ideal para awareness y lanzamientos.',
      icono: '📊',
      rangoSeguidores: '100k – 500k seguidores',
      seguidoresMin: 100000,
      seguidoresMax: 500000,
      precioPorInfluencerMin: 30000,
      precioPorInfluencerMax: 150000,
      colorBg: 'bg-violet-50',
      colorBorder: 'border-violet-300',
      colorText: 'text-violet-700',
      colorBadge: 'bg-violet-100 text-violet-800'
    },
    {
      id: 'mega',
      titulo: 'Mega',
      descripcion: 'Celebridades e influencers de élite. Impacto masivo e inmediato.',
      icono: '🌐',
      rangoSeguidores: '500k+ seguidores',
      seguidoresMin: 500000,
      seguidoresMax: null,
      precioPorInfluencerMin: 150000,
      precioPorInfluencerMax: null,
      colorBg: 'bg-amber-50',
      colorBorder: 'border-amber-300',
      colorText: 'text-amber-700',
      colorBadge: 'bg-amber-100 text-amber-800'
    }
  ];

  seleccionarObjetivo(id: ObjetivoCampana): void {
    this.objetivoSeleccionado.set(id);
    this.paso.set(2);
  }

  seleccionarNivel(id: NivelAlcance): void {
    this.nivelSeleccionado.set(id);
    const objetivo = this.objetivoSeleccionado();
    if (!objetivo) return;
    // Auto-aplicar la plantilla del objetivo si no había ninguna seleccionada
    const templateAuto = this.templateDeObjetivo();
    if (templateAuto && !this.templateSeleccionado()) {
      this.templateSeleccionado.set(templateAuto);
    }
    // Siempre calcular sugerencias desde la combinación tier × objetivo del template activo
    const tplActiva = this.templateSeleccionado();
    const objetivoEfectivo = tplActiva
      ? (this.TEMPLATE_OBJETIVO_MAP[tplActiva.id] ?? objetivo)
      : objetivo;
    const sug = WIZARD_SUGERENCIAS[objetivoEfectivo][id];
    this.presupuestoTweak.set(sug.presupuestoSugerido);
    this.cantidadInfluencersTweak.set(sug.cantidadInfluencersSugerida);
    this.minimoSeguidoresTweak.set(sug.minimoSeguidoresSugerido ?? null);
  }

  aplicarTemplateWizard(template: CampanaTemplate): void {
    // Toggle: deseleccionar si ya está activa
    if (this.templateSeleccionado()?.id === template.id) {
      this.templateSeleccionado.set(null);
      const sug = this.sugerenciasActivas();
      if (sug) {
        this.presupuestoTweak.set(sug.presupuestoSugerido);
        this.cantidadInfluencersTweak.set(sug.cantidadInfluencersSugerida);
        this.minimoSeguidoresTweak.set(sug.minimoSeguidoresSugerido ?? null);
      }
      return;
    }
    this.templateSeleccionado.set(template);
    // Usar sugerencias de la combinación tier actual × objetivo del template seleccionado
    const nivel = this.nivelSeleccionado();
    const objetivoTemplate = this.TEMPLATE_OBJETIVO_MAP[template.id];
    if (nivel && objetivoTemplate) {
      const sug = WIZARD_SUGERENCIAS[objetivoTemplate][nivel];
      this.presupuestoTweak.set(sug.presupuestoSugerido);
      this.cantidadInfluencersTweak.set(sug.cantidadInfluencersSugerida);
      this.minimoSeguidoresTweak.set(sug.minimoSeguidoresSugerido ?? null);
    }
  }

  confirmarYContinuar(): void {
    const objetivo = this.objetivoSeleccionado();
    const nivel = this.nivelSeleccionado();
    if (!objetivo || !nivel) return;
    const sugerencias = WIZARD_SUGERENCIAS[objetivo][nivel];
    this.completado.emit({
      objetivoCampana: objetivo,
      nivelAlcance: nivel,
      sugerencias,
      presupuesto: this.presupuestoTweak() ?? sugerencias.presupuestoSugerido,
      cantidadInfluencers: this.cantidadInfluencersEfectiva() ?? sugerencias.cantidadInfluencersSugerida,
      minimoSeguidores: this.minimoSeguidoresEfectivo()
    });
  }

  volver(): void {
    this.paso.set(1);
    this.nivelSeleccionado.set(null);
    this.templateSeleccionado.set(null);
  }

  omitir(): void {
    this.omitido.emit();
  }

  getObjetivoLabel(id: ObjetivoCampana | null): string {
    return this.objetivos.find(o => o.id === id)?.titulo ?? '';
  }

  getSugerenciasParaNivel(objetivo: ObjetivoCampana, nivel: NivelAlcance) {
    return WIZARD_SUGERENCIAS[objetivo][nivel];
  }
}
