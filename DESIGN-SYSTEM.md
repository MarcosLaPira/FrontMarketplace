# Design System - Marketplace Influencers

## Paleta de colores

### Primarios
- **Gradiente principal**: `from-indigo-600 to-purple-600` (heroes, headers)
- **Gradiente cards**: `from-indigo-500 via-purple-500 to-pink-400` (headers de cards)
- **Acento**: `indigo-600` (botones, links, focus rings)
- **Acento hover**: `indigo-700`

### Superficies
- **Fondo página**: `gray-50` o transparente (lo define el layout padre)
- **Cards**: `bg-white` con `border border-gray-100 shadow-sm`
- **Cards hover**: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- **Paneles/Filtros**: `bg-white border border-gray-200 rounded-2xl shadow-sm`
- **Inputs**: `bg-gray-50 border border-gray-200` → focus: `focus:ring-2 focus:ring-indigo-500 focus:border-transparent`

### Estados
- **Activo/Seleccionado**: `bg-indigo-50 border-indigo-300 text-indigo-700`
- **Inactivo**: `bg-white border-gray-200 text-gray-500 hover:bg-gray-50`
- **Success**: `bg-green-50 text-green-600 border-green-100`
- **Warning/Amber**: `bg-amber-50 text-amber-700`
- **Info pills**: `bg-indigo-50 text-indigo-700` (métricas), `bg-amber-50 text-amber-700` (ratings)

---

## Componentes UI

### Hero Header (páginas principales)
```html
<div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
  <h2 class="text-2xl md:text-3xl font-bold mb-2">Título</h2>
  <p class="text-indigo-100 mb-5">Subtítulo descriptivo</p>
  <!-- Search bar, stats, etc -->
</div>
```

### Search Bar (dentro del hero)
```html
<div class="relative max-w-2xl">
  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300">...</svg>
  <input class="w-full pl-12 pr-28 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition" />
  <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">Buscar</button>
</div>
```

### Quick Stats (dentro del hero)
```html
<span class="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
  <span class="font-bold">{{ count }}</span> resultados
</span>
```

### Botón Filtros Toggle
```html
<button class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition font-medium text-sm"
  [class]="activo ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'">
  <!-- icono filtro --> Filtros avanzados
  <!-- badge con count si hay filtros activos -->
</button>
```

### Quick Filter Chips
```html
<button class="px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5"
  [class]="activo ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'">
  <!-- icono --> Label
</button>
```

### Panel de Filtros Avanzados
```html
<div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Filtros avanzados</h3>
    <button class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Limpiar todo</button>
  </div>
  <!-- Labels: text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 -->
  <!-- Inputs/Selects: px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm -->
  <!-- Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 -->
  <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
    <button class="px-4 py-2 text-sm text-gray-500">Limpiar</button>
    <button class="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Aplicar</button>
  </div>
</div>
```

### Card con Header Gradient (ej: influencer-card)
- Container: `rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group`
- Header: `h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400` con SVG circles decorativos en `opacity-20`
- Avatar: fuera del header (evitar clip por overflow-hidden), centrado con `-mt-14`, tamaño `w-28 h-28 rounded-2xl ring-4 ring-white shadow-lg`
- Badges en header: `bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/20`
- Content: centrado (`text-center`), métricas con `justify-center`

### Métricas Pills
```html
<div class="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold text-sm">
  <!-- icono --> valor
</div>
<div class="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-semibold text-sm">
  <!-- estrella --> rating
</div>
```

### Categoría Tags
```html
<span class="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full">Categoría</span>
<!-- Overflow: mostrar máx 3, luego +N en text-xs text-gray-400 -->
```

### Loading Spinner
```html
<div class="flex flex-col items-center justify-center py-16">
  <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  <p class="mt-4 text-gray-500 text-sm">Cargando...</p>
</div>
```

### Empty State
```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
    <!-- icono contextual w-10 h-10 text-indigo-400 -->
  </div>
  <h3 class="text-lg font-bold text-gray-800 mb-2">Título</h3>
  <p class="text-gray-500 text-sm max-w-sm mb-5">Descripción</p>
  <button class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700">CTA</button>
</div>
```

### Modal Overlay
```html
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="cerrar()"></div>
  <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
    <!-- contenido -->
  </div>
</div>
```

---

## Tipografía
- **Títulos página**: `text-2xl md:text-3xl font-bold`
- **Títulos sección**: `text-sm font-bold text-gray-900 uppercase tracking-wide`
- **Títulos card**: `text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors`
- **Subtítulos**: `text-sm text-gray-500`
- **Labels de filtro**: `text-xs font-semibold text-gray-500 uppercase tracking-wide`
- **Body text**: `text-sm text-gray-700`

## Bordes y Radios
- **Cards/Paneles**: `rounded-2xl`
- **Botones**: `rounded-lg` o `rounded-xl`
- **Inputs**: `rounded-lg`
- **Pills/Tags**: `rounded-full` o `rounded-lg`
- **Avatares**: `rounded-2xl`

## Transiciones
- **Cards**: `transition-all duration-300` con `hover:shadow-xl hover:-translate-y-1`
- **Botones**: `transition` (default 150ms)
- **Inputs focus**: `transition`
- **Color changes**: `transition-colors`

## Espaciado
- **Entre secciones**: `space-y-6` o `mb-6`
- **Padding cards**: `p-5` o `px-5 py-3`
- **Padding hero**: `p-6 md:p-8`
- **Grid gaps**: `gap-4` (filtros), `gap-5` (cards grid)
- **Grid cards**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`

## Patrones UX
- Búsqueda siempre visible en el hero, no escondida
- Filtros avanzados colapsables (no visibles por defecto)
- Quick filter chips para los filtros más comunes
- Badge numérico en botón de filtros cuando hay filtros activos
- Conteo de resultados siempre visible
- Botón "Limpiar filtros" cuando hay filtros activos
- Empty states con ícono + título + descripción + CTA
- Cards clickeables con efecto hover de elevación
- Loading con spinner centrado + texto descriptivo
