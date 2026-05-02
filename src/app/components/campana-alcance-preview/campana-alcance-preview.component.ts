import { Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface TierConfig {
  nombre: string;
  color: string;
  minSeg: number;
  maxSeg: number;
  alcanceRate: number; // % de seguidores que ve una publicación orgánicamente
  engRate: number;     // % de seguidores que interactúa
  rango: string;
}

interface AlcanceDatos {
  tier: TierConfig;
  costoPorInfluencer: number;
  seguidoresEstimados: number;
  alcanceMin: number;
  alcanceMax: number;
  engagementEstimado: number;
  cpm: number | null;
  advertenciaPresupuesto: string | null;
}

// Fuente: benchmarks de mercado latinoamericano 2024
// alcanceRate = % del total de seguidores que ve orgánicamente una publicación
// engRate     = % del total de seguidores que interactúa (likes + comentarios + shares)
const TIERS: TierConfig[] = [
  { nombre: 'Nano',  color: 'bg-emerald-100 text-emerald-700', minSeg: 0,         maxSeg: 9_999,     alcanceRate: 0.30, engRate: 0.065, rango: '1k–10k seg.' },
  { nombre: 'Micro', color: 'bg-blue-100 text-blue-700',       minSeg: 10_000,    maxSeg: 99_999,    alcanceRate: 0.23, engRate: 0.040, rango: '10k–100k seg.' },
  { nombre: 'Macro', color: 'bg-violet-100 text-violet-700',   minSeg: 100_000,   maxSeg: 499_999,   alcanceRate: 0.15, engRate: 0.025, rango: '100k–500k seg.' },
  { nombre: 'Mega',  color: 'bg-amber-100 text-amber-700',     minSeg: 500_000,   maxSeg: Infinity,  alcanceRate: 0.07, engRate: 0.012, rango: '500k+ seg.' },
];

// Regla del 30%: un influencer cobra ~30% de su cantidad de seguidores en ARS
const PRECIO_POR_SEGUIDOR = 0.30;

function tierPorSeguidores(seg: number): TierConfig {
  return TIERS.find(t => seg >= t.minSeg && seg <= t.maxSeg) ?? TIERS[0];
}

@Component({
  selector: 'app-campana-alcance-preview',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './campana-alcance-preview.component.html'
})
export class CampanaAlcancePreviewComponent {
  presupuesto         = input<number | null>(null);
  cantidadInfluencers = input<number | null>(null);
  minimoSeguidores    = input<number | null>(null);

  datos = computed<AlcanceDatos | null>(() => {
    const pres    = this.presupuesto();
    const cantidad = Math.max(1, this.cantidadInfluencers() ?? 1);
    const minSeg  = this.minimoSeguidores();

    if (!pres && !minSeg) return null;

    const costoPorInfluencer = pres ? Math.round(pres / cantidad) : 0;

    // Seguidores estimados: invertimos la regla del 30%
    // Si el usuario fijó un mínimo de seguidores, usamos ese como base
    const segPorBudget  = pres ? Math.round(costoPorInfluencer / PRECIO_POR_SEGUIDOR) : 0;
    const seguidoresEstimados = minSeg
      ? Math.max(minSeg, segPorBudget)   // respetar el mínimo si fue definido
      : segPorBudget;

    const tier = tierPorSeguidores(seguidoresEstimados);

    // Alcance: seguidores × tasa_alcance_orgánico × cantidad, con ±20% de variación
    const alcancePorInfluencer = Math.round(seguidoresEstimados * tier.alcanceRate);
    const alcanceBase          = alcancePorInfluencer * cantidad;
    const alcanceMin           = Math.round(alcanceBase * 0.80);
    const alcanceMax           = Math.round(alcanceBase * 1.20);

    const engagementEstimado = Math.round(seguidoresEstimados * tier.engRate * cantidad);
    const cpm = pres && alcanceMax > 0 ? Math.round((pres / alcanceMax) * 1000) : null;

    // Advertencia: si el presupuesto no alcanza para pagar al tier del mínimo exigido
    let advertenciaPresupuesto: string | null = null;
    if (pres && minSeg && segPorBudget < minSeg) {
      const costoNecesario = Math.round(minSeg * PRECIO_POR_SEGUIDOR * cantidad);
      advertenciaPresupuesto =
        `Con $${costoPorInfluencer.toLocaleString('es-AR')} por influencer es difícil conseguir perfiles de ${minSeg.toLocaleString('es-AR')}+ seguidores. `
        + `Necesitarías ~$${costoNecesario.toLocaleString('es-AR')} de presupuesto total.`;
    }

    return { tier, costoPorInfluencer, seguidoresEstimados, alcanceMin, alcanceMax, engagementEstimado, cpm, advertenciaPresupuesto };
  });
}
