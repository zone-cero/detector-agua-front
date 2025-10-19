"use client" // Indica que este es un componente de cliente en Next.js, esencial para hooks y eventos del navegador.

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion" // Para animaciones de interfaz de usuario fluidas y atractivas.
import Image from "next/image" // Componente optimizado para la carga y visualización eficiente de imágenes en Next.js.
import dynamic from 'next/dynamic' // Herramienta para la carga dinámica de componentes, crucial para optimizar el rendimiento y manejar el Server-Side Rendering (SSR).

// --- Importaciones de Componentes de la Interfaz de Usuario ---
import { Header } from "@/components/header" // Componente de encabezado de la página para navegación global.
import { Footer } from "@/components/footer" // Componente de pie de página.
import { Button } from "@/components/ui/button" // Componente de botón reutilizable, para acciones primarias y secundarias.
import { Card } from "@/components/ui/card" // Componente de tarjeta para agrupar contenido relacionado de manera visualmente agradable.
import { HeroImage } from "../components/hero-image" // Componente que presenta la imagen principal o banner de bienvenida.
import PhotoAnalyzer from "@/components/PhotoAnalyzer" // Componente específico para la funcionalidad de análisis de imágenes.

// Carga dinámica del componente de mapa con ssr: false.
// Esto es fundamental para componentes que dependen del entorno del navegador (como el objeto 'window'),
// evitando errores durante el proceso de Server-Side Rendering de Next.js.
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'), // Ruta al componente del mapa geoespacial.
  {
    ssr: false, // Deshabilita explícitamente el Server-Side Rendering para este componente.
    loading: () => ( // Componente de reserva que se muestra mientras el mapa se está cargando.
      <div className="w-full h-[600px] flex items-center justify-center text-slate-500 bg-slate-50 text-sm md:text-base">
        <span>Cargando módulo geoespacial...</span>
      </div>
    )
  }
)

// --- ENUMS Y TIPOS: Definen estructuras de datos para una mayor claridad y seguridad de tipos ---

/**
 * Enumeración que define las vistas principales disponibles dentro del panel de control.
 * Mejora la legibilidad del código y previene errores tipográficos en la gestión de vistas.
 */
enum DashboardView {
  Map = "map",
  PhotoAnalyzer = "photo_analyzer",
}

/**
 * Tipo que describe la estructura de una característica o módulo de la aplicación.
 * Asegura la consistencia en la definición de las propiedades de cada herramienta.
 */
type ToolFeature = {
  title: string // Título descriptivo de la herramienta.
  description: string // Breve explicación de la funcionalidad de la herramienta.
  stats: string[] // Lista de puntos clave o beneficios que ofrece la herramienta.
  section: string // Identificador de la sección a la que pertenece la herramienta (e.g., 'analisis').
}

// --- CONSTANTES: Contienen configuraciones estáticas para animaciones y datos de la interfaz ---

/**
 * Variantes de animación para elementos que aparecen con un ligero desplazamiento vertical.
 * Utiliza Framer Motion para integrar transiciones suaves en la interfaz.
 */
const fadeInUp = {
  initial: { opacity: 0, y: 15 }, // Estado inicial: completamente transparente y ligeramente desplazado hacia abajo.
  animate: { opacity: 1, y: 0 }, // Estado final: completamente visible en su posición original.
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, // Configuración de la duración y la curva de aceleración de la animación.
}

/**
 * Variantes de animación para la aparición escalonada de múltiples elementos.
 * Crea un efecto visual donde los elementos se revelan uno tras otro.
 */
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08, // Retraso secuencial entre la animación de cada elemento hijo.
    },
  },
}

/**
 * Variantes de animación para transiciones entre diferentes vistas del dashboard.
 * Proporciona una experiencia de usuario fluida al cambiar de un módulo a otro.
 */
const viewVariants = {
  initial: { opacity: 0, scale: 0.99 }, // Estado inicial: invisible y ligeramente reducido.
  in: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }, // Estado 'dentro': visible y a escala normal.
  out: { opacity: 0, scale: 0.99, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }, // Estado 'fuera': volviéndose invisible y ligeramente reducido.
}

/**
 * Datos para las opciones principales del panel de control, permitiendo al usuario navegar
 * entre el analizador de imágenes y el visualizador geoespacial.
 */
const dashboardOptions: {
  id: DashboardView // Identificador único para cada vista del dashboard.
  title: string // Título descriptivo para la opción en la interfaz.
  description: string // Descripción concisa de lo que ofrece cada vista.
  imageBaseName: "ubicacion" | "monitor" // Nombre base del archivo de imagen (PNG y GIF) para el icono de la opción.
}[] = [
    {
      id: DashboardView.PhotoAnalyzer,
      title: "Análisis de Imágenes",
      description: "Procesa y cuantifica elementos en imágenes satelitales o aéreas.",
      imageBaseName: "monitor",
    },
    {
      id: DashboardView.Map,
      title: "Visualizador Geoespacial",
      description: "Explora y gestiona tus ecosistemas acuáticos en un mapa interactivo.",
      imageBaseName: "ubicacion",
    }
  ]

/**
 * Datos que describen las capacidades detalladas de los módulos de análisis.
 * Se utilizan para poblar las tarjetas en la sección de "Módulos de Análisis".
 */
const toolsData: ToolFeature[] = [
  {
    title: 'Cuantificación de Cuerpos de Agua',
    description: 'Automatiza la medición de áreas y porcentajes de agua y vegetación en tus imágenes, proporcionando datos clave para el monitoreo.',
    section: 'analisis',
    stats: [
      'Análisis por imagen de área de agua y cobertura vegetal',
      'Resultados cuantitativos en metros cuadrados y porcentaje',
      'Información fundamental para la evaluación ambiental',
    ],
  },
  {
    title: 'Monitorización Histórica y Tendencias',
    description: 'Compara series temporales de datos para identificar patrones y evaluar la evolución de los ecosistemas a lo largo del tiempo.',
    section: 'historial',
    stats: [
      'Acceso al historial de capturas por cada ecosistema',
      'Cálculo automático de cambios respecto a capturas previas',
      'Visualización de tendencias para la toma de decisiones',
    ],
  },
  {
    title: 'Gestión de Metadatos y Ecosistemas',
    description: 'Organiza y contextualiza tus datos definiendo cuerpos de agua y asociando información relevante a cada captura.',
    section: 'configuracion',
    stats: [
      'Creación y selección de ecosistemas a monitorizar',
      'Registro y ajuste de fecha y hora de las capturas',
      'Campo para descripciones y notas adicionales por captura',
    ],
  },
];

// --- RUTA BASE PARA ACTIVOS VISUALES ---
const ICON_PATH = "/imgs-gifs/"

// --- Componente DashboardTabIcon: Representa un ícono interactivo para las pestañas del dashboard ---
interface DashboardTabIconProps {
  imageBaseName: "ubicacion" | "monitor" // Nombre base para la imagen estática (PNG) y animada (GIF).
  isSelected: boolean // Indica si la pestaña correspondiente a este ícono está activa.
}

const DashboardTabIcon: React.FC<DashboardTabIconProps> = ({ imageBaseName, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false) // Estado para detectar si el cursor está sobre el ícono.

  // El GIF animado se muestra si la pestaña está seleccionada o si el cursor está sobre el ícono.
  const showGif = isSelected || isHovered;

  return (
    <div
      className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 overflow-hidden relative bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img" // Rol ARIA para indicar que es un elemento de imagen.
      aria-label={`${imageBaseName === "ubicacion" ? "Ícono de ubicación animado" : "Ícono de monitor animado"}`}
    >
      {/* Imagen PNG estática: Visible cuando el GIF no está activo. */}
      <Image
        src={`${ICON_PATH}${imageBaseName}.png`}
        alt={`Ícono estático de ${imageBaseName}`}
        width={56} // Tamaño base, se ajustará por el contenedor via object-contain
        height={56}
        className={`transition-all duration-300 ${showGif ? "opacity-0" : "opacity-100 filter grayscale"} object-contain`}
      />
      {/* Imagen GIF animada: Visible cuando está activo (seleccionado o en hover). */}
      <Image
        src={`${ICON_PATH}${imageBaseName}.gif`}
        alt={`Ícono animado de ${imageBaseName}`}
        width={56}
        height={56}
        className={`absolute inset-0 transition-all duration-300 ${showGif ? "opacity-100" : "opacity-0"} object-contain`}
        unoptimized // Deshabilita la optimización de Next.js para GIFs, asumiendo que ya están optimizados.
      />
    </div>
  )
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA: HomePage ---
const HomePage: React.FC = () => {
  // --- Estados de la Aplicación ---
  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.PhotoAnalyzer) // Controla qué vista del dashboard está activa.
  const [isLoadingView, setIsLoadingView] = useState(false) // Indica si se está produciendo una transición de vista.
  const [isClient, setIsClient] = useState(false) // Rastrea si el componente se ha montado en el lado del cliente (para lógica dependiente del navegador).

  // --- Referencias para la Navegación por Scroll ---
  // Permiten el desplazamiento suave a secciones específicas de la página.
  const integratedDashboardRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const updatesRef = useRef<HTMLDivElement>(null) // Referencia de ejemplo, si se necesitara una sección "actualizaciones".

  // Mapeo de hashes de URL a referencias de secciones.
  // 'useMemo' optimiza el rendimiento al evitar la recreación de este objeto en cada renderizado
  // si sus dependencias no han cambiado.
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = useMemo(
    () => ({
      "#dashboard": integratedDashboardRef,
      "#tools": toolsRef,
      "#updates": updatesRef,
    }),
    [],
  )

  // --- Efecto: Detectar el entorno del cliente ---
  // Establece 'isClient' a true una vez que el componente se ha montado en el navegador,
  // permitiendo la ejecución de lógica que depende del DOM o del objeto 'window'.
  useEffect(() => {
    setIsClient(true)
  }, [])

  // --- Función de Navegación y Cambio de Vista ---
  // 'useCallback' memoriza esta función para evitar que se re-cree innecesariamente,
  // lo cual es útil para optimizaciones de rendimiento, especialmente con componentes hijos.
  const handleNavigation = useCallback(
    (section: string, view: DashboardView | null) => {
      // La lógica dependiente de 'window' solo se ejecuta en el cliente.
      if (!isClient) return;

      const targetHash = `#${section}`;
      // Actualiza el hash de la URL para permitir enlaces directos y mantener la URL sincronizada.
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }

      // Si se especifica una vista de dashboard y es diferente de la actual,
      // inicia una transición de vista con un breve estado de carga.
      if (view && section === "dashboard" && view !== currentView) {
        setIsLoadingView(true);
        setTimeout(() => {
          setCurrentView(view);
          setIsLoadingView(false);
        }, 300); // Retraso para dar tiempo a la animación de carga.
      }
    },
    [currentView, isClient], // Dependencias: 'currentView' para detectar cambios de vista, 'isClient' para seguridad.
  );

  // --- Efecto: Manejar el scroll al cambiar el hash de la URL ---
  // Escucha los cambios en el hash de la URL y desplaza la vista a la sección correspondiente.
  useEffect(() => {
    // La lógica dependiente de 'window' solo se ejecuta en el cliente.
    if (!isClient) return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      const targetRef = sectionRefs[hash];

      // Pequeño retraso para asegurar que el DOM se haya actualizado antes de realizar el scroll.
      setTimeout(() => {
        targetRef?.current?.scrollIntoView({
          behavior: "smooth", // Habilita un desplazamiento suave y visualmente agradable.
          block: "start", // Alinea el inicio de la sección objetivo con la parte superior de la ventana.
        });
      }, 100);
    };

    handleHashChange(); // Ejecuta la función una vez al montar para manejar el hash inicial.
    window.addEventListener("hashchange", handleHashChange); // Agrega un event listener para futuros cambios de hash.

    // Función de limpieza: Se ejecuta al desmontar el componente para remover el event listener.
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [sectionRefs, isClient]); // Dependencias: 'sectionRefs' y 'isClient'.

  // Busca la opción del dashboard actualmente seleccionada para mostrar su información.
  const currentOption = dashboardOptions.find((o) => o.id === currentView);

  // --- Renderizado del Componente Principal de la Página ---
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Componente de Encabezado: Proporciona la navegación principal. */}
      <Header onNavClick={(section) => handleNavigation(section, null)} />

      {/* Componente de Imagen Hero: El banner visual principal de la página. */}
      <HeroImage />

      {/* ========================================
          SECCIÓN: PANEL DE CONTROL INTEGRADO
          ======================================== */}
      <section
        id="dashboard"
        ref={integratedDashboardRef}
        className="relative py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white to-blue-50 overflow-hidden" // Ajustes de padding responsivo
        aria-labelledby="dashboard-heading" // Atributo ARIA para accesibilidad, asocia el título con la sección.
      >
        {/* Elementos decorativos de fondo (formas suaves y blur) para un estilo moderno. */}
        <div className="absolute -left-32 -top-20 w-[400px] h-[400px] rounded-full bg-blue-200/40 blur-3xl opacity-50 pointer-events-none z-0"></div>
        <div className="absolute -right-20 bottom-32 w-[450px] h-[450px] rounded-full bg-purple-200/30 blur-3xl opacity-50 pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Título y subtítulo de la sección del dashboard, con ajustes responsivos de texto y margen. */}
          <motion.div
            className="text-center mb-8 md:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 id="dashboard-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 md:mb-3 lg:mb-4 tracking-tight leading-tight">
              Plataforma de Monitoreo
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed">
              Gestione y explore sus datos geoespaciales y de análisis de imágenes desde un único lugar.
            </p>
          </motion.div>

          {/* Opciones de selección del dashboard (Tarjetas de Análisis de Imágenes o Mapa Geoespacial). */}
          <motion.fieldset
            className="w-max mx-auto mb-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <legend className="sr-only">Vista del dashboard</legend>

            <div className="inline-flex p-1 bg-slate-100 rounded-full">
              {dashboardOptions.map((o) => (
                <motion.button
                  key={o.id}
                  type="button"
                  onClick={() => handleNavigation("dashboard", o.id)}
                  className={`
          relative px-5 py-2 text-sm font-medium rounded-full
          transition-colors
          ${currentView === o.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                    }
        `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {o.title}
                </motion.button>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {dashboardOptions.find((o) => o.id === currentView)?.description}
            </p>
          </motion.fieldset>
          {/* Contenedor principal del contenido dinámico del dashboard (Módulo de Mapa o Analizador de Fotos). */}
          {/* === Sólo sombra azul-cielo difuminada (sin fondo azul) ==================== */}
          <motion.section
            className="
    
    mx-auto
    w-full
    max-w-5xl
    min-h-[500px]
    md:min-h-[550px]
    lg:min-h-[600px]
    rounded-3xl
    bg-white
      border
    border-slate-100
    
      shadow-[0_0_20px_8px_rgba(56,189,248,0.18)] /* sky-400 18 % */
      
    "
            initial="initial"
            whileInView="animate"
            variants={fadeInUp}
            viewport={{ once: true, amount: 0.1 }}
            aria-live="polite"
            aria-label="Panel principal del dashboard"
          >
            {/* ---- soft sky-blue shadow ring ----------------------------------------- */}
            <div
              className="
     "
              aria-hidden="true"
            />

           

            {/* ---- content area ------------------------------------------------------- */}
            <div className="relative min-h-[450px] md:min-h-[500px] lg:min-h-[550px]">
              <AnimatePresence mode="wait">
                {currentView === DashboardView.Map && (
                  <motion.div
                    key="map"
                    variants={viewVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    className="w-full h-full"
                    aria-label="Mapa geoespacial interactivo"
                  >
                    <DynamicMapComponent />
                  </motion.div>
                )}

                {currentView === DashboardView.PhotoAnalyzer && (
                  <motion.div
                    key="analyzer"
                    variants={viewVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    className="w-full h-full p-6 md:p-8"
                    aria-label="Analizador de imágenes"
                  >
                    <PhotoAnalyzer />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </section>

      {/* ========================================
          SECCIÓN: MÓDULOS DE ANÁLISIS
          ======================================== */}
      <section
        id="tools"
        ref={toolsRef}
        className="py-16 md:py-20 lg:py-24 bg-slate-50/70" // Padding responsivo.
        aria-labelledby="tools-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título y subtítulo de la sección de herramientas, con ajustes responsivos de texto y margen. */}
          <motion.div
            className="mb-10 md:mb-12 lg:mb-16 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 id="tools-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 md:mb-3 lg:mb-4 tracking-tight leading-tight">
              Capacidades Clave
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed">
              Herramientas fundamentales para un monitoreo eficiente y la toma de decisiones informadas.
            </p>
          </motion.div>

          {/* Grid de tarjetas que describen las herramientas, con espaciado responsivo y estructura de columnas. */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            initial="initial"
            whileInView="animate"
            variants={stagger}
            viewport={{ once: true, amount: 0.2 }}
          >
            {toolsData.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className="p-5 md:p-6 lg:p-8 h-full group transition-all duration-300 bg-white border border-slate-200 shadow-sm rounded-xl md:rounded-2xl hover:shadow-lg hover:border-blue-300" // Padding y redondeado responsivos.
                  role="region" // Rol ARIA para indicar que es una región de contenido.
                  aria-labelledby={`feature-title-${index}`}
                >
                  <h3 id={`feature-title-${index}`} className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mb-2 md:mb-3 tracking-tight leading-snug"> {/* Tamaño de texto responsivo. */}
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 md:mb-5 leading-relaxed">{feature.description}</p> {/* Tamaño de texto responsivo. */}

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
                    {feature.stats.map((stat, i) => (
                      <div key={i} className="flex items-start text-xs sm:text-sm lg:text-base text-slate-700"> {/* Tamaño de texto responsivo. */}
                        <span className="text-blue-600 mr-2 flex-shrink-0">&ndash;</span> {/* Guion simple como viñeta. */}
                        <span className="font-normal">{stat}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Componente de Pie de Página. */}
      <Footer />
    </div>
  )
}

export default HomePage