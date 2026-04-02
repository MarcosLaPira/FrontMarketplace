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
  descripcion?: string;
  generoAudiencia?: string;
  seguidoresTotales?: number;
  esCuentaVerificada: boolean;
  idsCategorias: number[];
  fotoPerfil?: File;
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
  nombreSocial: string;
  descripcionPresentacion?: string;
  esCuentaVerificada: boolean;
  seguidoresTotales: number;
  ratingPromedio: number;
  generoAudiencia?: string;
  fotoPerfil?: string;
  fechaAlta?: string;
  categorias?: Categoria[];
  plataformas?: InfluencerPlataforma[];
}

export interface InfluencerPlataforma {
  idPlataforma: number;
  nombrePlataforma: string;
  costoMin: number;
  costoMax: number;
  canje: boolean;
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

// Detalle completo de un influencer (endpoint ObtenerInfluencerById)
export interface InfluencerDetalle {
  idInfluencer: number;
  nombreSocial: string;
  descripcionPresentacion?: string;
  esCuentaVerificada: boolean;
  seguidoresTotales: number;
  ratingPromedio: number;
  generoAudiencia?: string;
  fotoPerfil?: string;
  fechaAlta?: string;
  ultimaFechaActualizacion?: string;
  activo: boolean;
  instagramConnected: boolean;
  tikTokConnected: boolean;
  categorias?: Categoria[];
  costos?: InfluencerDetalleCosto[];
  estadisticas?: InfluencerDetalleEstadistica[];
  historialCampanas?: InfluencerHistorialCampanas;
  postulaciones?: InfluencerDetallePostulacion[];
}

export interface InfluencerDetalleCosto {
  idPlataforma: number;
  nombrePlataforma: string;
  costoMin: number;
  costoMax: number;
  canje: boolean;
  fechaAlta?: string;
  fechaActualizacion?: string;
}

export interface InfluencerDetalleEstadistica {
  idPlataforma: number;
  nombrePlataforma: string;
  seguidores: number;
  alcancePromedio: number;
  engagementRate: number;
  cantidadPosts: number;
  cantidadLikes: number;
  cantidadComentarios: number;
  cantidadCompartidos: number;
  cantidadVideos: number;
  cantidadViews: number;
  cantidadStories: number;
  cantidadGuardados: number;
  cantidadReacciones: number;
  cantidadMensajes: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

export interface InfluencerHistorialCampanas {
  totalPostulaciones: number;
  postulacionesAceptadas: number;
  postulacionesRechazadas: number;
  postulacionesPendientes: number;
  campanasTikTok: number;
  campanasInstagram: number;
  campanasOtras: number;
}

export interface InfluencerDetallePostulacion {
  idPostulacion: number;
  idCampana: number;
  tituloCampana: string;
  nombreMarca: string;
  nombrePlataforma: string;
  estadoPostulacion: string;
  fechaPostulacion: string;
  mensaje: string;
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
  fotoPerfil?: string;
}

export interface PostulacionCreateRequest {
  idCampana: number;
  mensaje: string;
}

// Filtros de búsqueda de campañas
export interface CampanaFilter {
  idMarca?: number;
  idPlataforma?: number;
  idEstadoCampana?: number;
  idCategoria?: number;
  esPresencial?: boolean;
  requiereProductoFisico?: boolean;
  requiereProductoVirtual?: boolean;
  envioProductoIncluido?: boolean;
  ciudad?: string;
  provincia?: string;
  campanaPublica?: boolean;
}

// Filtros de búsqueda de influencers
export interface InfluencerFilter {
  idsCategorias?: number[];
  plataformaId?: number;
  seguidoresMin?: number;
  seguidoresMax?: number;
  costoMin?: number;
  costoMax?: number;
  soloCanje?: boolean;
  soloVerificados?: boolean;
  generoAudiencia?: string;
  ratingMin?: number;
  search?: string;
  page?: number;
  pageSize?: number;
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
