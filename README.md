# Marketplace Influencers - Marcas | Frontend

Aplicacion frontend que conecta **Influencers** y **Marcas** a traves de Campanas y Postulaciones.

## Stack

- Angular 19 (standalone components, signals, reactive forms)
- Tailwind CSS
- RxJS
- JWT Authentication

## Inicio rapido

```bash
# Requisitos: Node.js 18+, backend .NET corriendo en https://localhost:7070
cd c:\Proyectos\Marketplace.Frontend
npm install
npm start
# Abrir http://localhost:4200
```

## Estructura

```
src/app/
  components/       # Componentes reutilizables
  guards/           # AuthGuard, RoleGuard
  interceptors/     # JwtInterceptor
  models/           # Interfaces (types.ts)
  pages/            # Vistas principales
    auth/           # Login, Register
    explore/        # Listado publico
    influencer/     # Dashboard Influencer
    marca/          # Dashboard Marca
    unauthorized/   # Pagina 403
  services/         # Auth, Influencer, Marca, Campana, Postulacion
  shared/           # constants.ts (API_BASE_URL)
```

## Rutas

| Ruta | Acceso | Descripcion |
|------|--------|-------------|
| `/explore` | Publico | Listado de campanas e influencers |
| `/login` | Publico | Inicio de sesion |
| `/register` | Publico | Registro (Influencer o Marca) |
| `/dashboard-influencer` | Influencer | Perfil, estadisticas, costos, postulaciones |
| `/dashboard-marca` | Marca | Perfil, campanas CRUD, gestionar postulaciones |
| `/unauthorized` | Publico | Error 403 |

## Autenticacion

- JWT almacenado en `localStorage` (clave: `jwt_token`)
- `JwtInterceptor` adjunta token automaticamente
- Claims: `nameid`, `email`, `name`, `role`
- Redireccion automatica en 401/403

## Configuracion

La URL base de la API se define en `src/app/shared/constants.ts`:
```ts
export const API_BASE_URL = 'https://localhost:7070/api/v1';
```

## Desarrollo

```bash
npm start         # Servidor de desarrollo
npm run build     # Build de produccion
npm test          # Tests unitarios
ng generate component components/mi-componente  # Nuevo componente
```
