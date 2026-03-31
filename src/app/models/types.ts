// Autenticación
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export interface LoginResponse {
  token: string;
}

export interface InfluencerRegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  nombreSocial: string;
  idsCategorias: number[];
  descripcion: string;
  esCuentaVerificada: boolean;
}

export interface MarcaRegisterRequest {
  email: string;
  password: string;
  nombreComercial: string;
  descripcion?: string;
  idsCategorias: number[];
  ubicacionPais: string;
  ubicacionCiudad: string;
  webUrl?: string;
}

// Perfil del usuario
export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: 'Marca' | 'Influencer' | 'Admin';
}

// Influencers
export interface Influencer {
  idInfluencer: number;
  idUsuario: string;
  nombreSocial: string;
  descripcionPresentacion?: string;
  categorias?: Categoria[];
  seguidoresTotales: number;
  esCuentaVerificada: boolean;
  ratingPromedio?: number;
  activo: boolean;
  costos?: InfluencerCosto[];
  estadisticas?: InfluencerEstadistica[];
}

export interface InfluencerCosto {
  idPlataforma: number;
  costoMin: number;
  costoMax: number;
  canje: boolean;
}

export interface InfluencerEstadistica {
  idPlataforma: number;
  seguidores: number;
  alcancePromedio: number;
  engagementRate: number;
}

// Marcas
export interface Marca {
  idMarca: number;
  idUsuario: string;
  nombreComercial: string;
  descripcion?: string;
  categorias?: Categoria[];
  ubicacionPais: string;
  ubicacionCiudad: string;
  webUrl?: string;
  esActivo: boolean;
}

// Campañas
export interface Campana {
  idCampana: number;
  idMarca?: number;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  fechaInicio: Date;
  fechaFin: Date;
  marca?: string;
  plataforma?: Plataforma;
  estadoCampana?: EstadoCampana;
  esPresencial?: boolean;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  requiereProductoFisico?: boolean;
  requiereProductoVirtual?: boolean;
  envioProductoIncluido?: boolean;
  notasLogisticas?: string;
  campanaPublica?: boolean;
  cantidadInfluencers?: number;
  cantidadInfluencersAceptados?: number;
  categorias?: Categoria[];
  postulaciones?: Postulacion[];
  imagenesProducto?: ImagenCampana[];
}

export interface ImagenCampana {
  idImagenCampana: number;
  url: string;
  nombreArchivo: string;
}

export interface CampanaCreateRequest {
  titulo: string;
  descripcion: string;
  idPlataforma: number;
  idsCategorias: number[];
  presupuesto: number;
  fechaInicio: Date;
  fechaFin: Date;
  esPresencial?: boolean;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  requiereProductoFisico?: boolean;
  requiereProductoVirtual?: boolean;
  envioProductoIncluido?: boolean;
  notasLogisticas?: string;
  campanaPublica?: boolean;
  cantidadInfluencers?: number;
}

// Postulaciones
export interface Postulacion {
  idPostulacion: number;
  idCampana?: number;
  idInfluencer?: number;
  fechaPostulacion: Date;
  estadoPostulacion?: string;
  idEstadoPostulacion?: number;
  mensaje: string;
  campana?: Campana;
  influencer?: InfluencerResumen;
  estado?: EstadoPostulacion;
}

// Resumen de influencer (embebido en postulaciones)
export interface InfluencerResumen {
  idInfluencer: number;
  nombreSocial: string;
  descripcionPresentacion?: string;
  seguidoresTotales: number;
  esCuentaVerificada: boolean;
  ratingPromedio?: number;
}

export interface PostulacionCreateRequest {
  idCampana: number;
  mensaje: string;
}

// Catálogos
export interface Categoria {
  idCategoria: number;
  nombre: string;
}

export interface Plataforma {
  idPlataforma: number;
  nombrePlataforma: string;
}

export interface EstadoCampana {
  idEstadoCampana: number;
  nombre: string;
  descripcion: string;
}

export interface EstadoPostulacion {
  idEstadoPostulacion: number;
  nombre: string;
  descripcion: string;
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
