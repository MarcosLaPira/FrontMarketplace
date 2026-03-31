# Marketplace Influencers - Marcas | Frontend

## Proyecto
- **Frontend**: Angular 19 + Tailwind CSS | `c:\Proyectos\Marketplace.Frontend`
- **Backend**: .NET | `C:\Proyectos\ArquetipoNet`
- **API Base URL**: `https://localhost:7070/api/v1` (definida en `src/app/shared/constants.ts`)
- **Puerto frontend**: `http://localhost:4200`

## Regla de Feedback de Prompts
Cada vez que el usuario haga una consulta que no sea performante (ambigua, muy larga, con info innecesaria, o que fuerce a gastar tokens de mas), debés:
1. Responder la consulta normalmente
2. Al final, agregar una seccion breve: **"Tip de prompt:"** con la version optimizada que hubiera sido mas eficiente

## Convenciones de Codigo Angular 19

### Componentes
- **Standalone components** siempre (no NgModules)
- Componentes reutilizables van en `src/app/components/` (crear si no existe)
- Componentes de pagina van en `src/app/pages/`
- Un formulario reutilizable = un componente propio (ej: `CampanaFormComponent`)
- Preferir composicion: componentes chicos que se combinan

### Signals
- Usar `signal()` para estado local del componente
- Usar `computed()` para valores derivados
- Usar `effect()` solo cuando sea necesario (side effects)
- NO usar signals para reemplazar RxJS en llamadas HTTP (RxJS sigue siendo correcto ahi)

### Reactive Forms
- Siempre usar `ReactiveFormsModule` con `FormGroup` / `FormBuilder`
- NO usar template-driven forms (ngModel)
- Validaciones en el FormGroup, no en el template
- Extraer formularios complejos a componentes propios

### Estructura de archivos
```
src/app/
  components/       # Componentes reutilizables (shared UI)
  guards/           # Guards de rutas
  interceptors/     # Interceptores HTTP
  models/           # Interfaces y tipos
  pages/            # Componentes de pagina (vistas)
  services/         # Servicios HTTP
  shared/           # Constantes, utilidades, pipes
```

### Estilos
- Tailwind CSS para estilos (no CSS custom salvo excepciones)
- Clases de Tailwind directo en el template
- Responsive design con prefijos de Tailwind (sm:, md:, lg:)

### Buenas practicas generales
- Tipado estricto: no usar `any` salvo que sea inevitable
- Servicios inyectados con `inject()` (no constructor injection)
- Lazy loading en rutas cuando sea posible
- Nombres en espanol para entidades de dominio (Campana, Marca, Influencer, Postulacion)
- Nombres en ingles para conceptos tecnicos (Service, Guard, Component, Interceptor)
