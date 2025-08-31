"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroImage } from "../components/hero-image"
import {
    Droplets,
    TrendingUp,
    AlertTriangle,
    BarChart3,
    MapPin,
    Calendar,
    Download,
    Eye,
    Camera,
    FileText,
    Bell,
    Settings,
    Globe,
    Database,
    Filter,
    ArrowRight
} from "lucide-react"
import { useEffect } from "react"
import Link from "next/link"

// Componente para las tarjetas de sección
const FeatureCard = ({ icon: Icon, title, description, stats, href, buttonText, aosDelay }) => (
    <Card
        className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-gray-200 shadow-sm bg-gray-50"
        data-aos="fade-up"
        data-aos-delay={aosDelay}
    >
        <CardHeader className="pb-4">
            <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                <Icon className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="font-bold text-xl text-gray-900">{title}</CardTitle>
            <CardDescription className="text-base text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
                {stats.description}
            </p>
            <div className="space-y-2">
                {stats.items.map((item, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                        <item.icon className="w-3 h-3 mr-2 text-blue-600" />
                        <span>{item.text}</span>
                    </div>
                ))}
            </div>
            <Link href={href} passHref className="block">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors" aria-label={`Ir a la sección de ${title}`}>
                    {buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
        </CardContent>
    </Card>
)


export default function HomePage() {
    useEffect(() => {
        const initAOS = async () => {
            try {
                const AOS = (await import("aos")).default
                AOS.init({
                    duration: 800,
                    easing: "ease-out-cubic",
                    once: true,
                    offset: 100,
                })
            } catch (error) {
                console.error("Error al inicializar AOS:", error)
            }
        }
        initAOS()
    }, [])

    const sectionsData = [
        {
            icon: Calendar,
            title: "Histórico",
            description: "Datos y tendencias del pasado",
            stats: {
                description: "Explora datos históricos, líneas de tiempo, tendencias de calidad y galería fotográfica completa.",
                items: [
                    { icon: Camera, text: "1,247 imágenes" },
                    { icon: Database, text: "2.4M registros" },
                ],
            },
            href: "/historico",
            buttonText: "Explorar",
            aosDelay: "100",
        },
        {
            icon: TrendingUp,
            title: "Predicción",
            description: "Modelos y alertas tempranas",
            stats: {
                description: "Modelos predictivos con IA, escenarios futuros y sistema de alertas automatizado.",
                items: [
                    { icon: Bell, text: "Alertas activas" },
                    { icon: Settings, text: "94.2% precisión" },
                ],
            },
            href: "/prediccion",
            buttonText: "Ver Predicciones",
            aosDelay: "200",
        },
        {
            icon: BarChart3,
            title: "Análisis",
            description: "Visualización y reportes",
            stats: {
                description: "Dashboards interactivos, generador de reportes y comparativas entre cuerpos de agua.",
                items: [
                    { icon: Eye, text: "Tiempo real" },
                    { icon: Filter, text: "Comparativas" },
                ],
            },
            href: "/analisis",
            buttonText: "Iniciar Análisis",
            aosDelay: "300",
        },
        {
            icon: MapPin,
            title: "Monitoreo",
            description: "Datos en tiempo real",
            stats: {
                description: "Visualiza sensores activos, ubicaciones de monitoreo y datos actualizados cada minuto.",
                items: [
                    { icon: Globe, text: "24 estaciones" },
                    { icon: Droplets, text: "Actualización 1min" },
                ],
            },
            href: "/monitoreo",
            buttonText: "Ver Mapa",
            aosDelay: "400",
        },
    ]

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Header />

            <main>
                <HeroImage />

                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16" data-aos="fade-up">
                            <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 mb-6">
                                Principales Secciones
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Accede a herramientas especializadas para análisis histórico, predicciones y visualizaciones avanzadas.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-8">
                            {sectionsData.map((section, index) => (
                                <FeatureCard key={index} {...section} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16" data-aos="fade-up">
                            <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 mb-6">Últimas Actualizaciones</h2>
                            <p className="text-xl text-gray-600">
                                Mantente informado sobre los cambios más recientes en la calidad del agua
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Featured Update */}
                            <div data-aos="fade-right">
                                <Card className="border-0 shadow-sm h-full bg-white">
                                    <CardHeader>
                                        <div className="w-full h-64 bg-gray-100 rounded-xl mb-6 flex items-center justify-center">
                                            <AlertTriangle className="w-16 h-16 text-blue-600" />
                                        </div>
                                        <Badge className="w-fit mb-2 bg-blue-600 text-white hover:bg-blue-700">Alerta Importante</Badge>
                                        <CardTitle className="font-bold text-2xl text-gray-900">
                                            Mejora Significativa en Calidad del Agua del Lago Principal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            Los últimos análisis muestran una mejora del 15% en los niveles de oxígeno disuelto y una reducción
                                            del 20% en la turbidez durante las últimas dos semanas.
                                        </p>
                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                            <span>Hace 2 días • Análisis Completo</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                                            aria-label="Leer reporte completo sobre la mejora de la calidad del agua"
                                        >
                                            Leer Reporte Completo
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Updates List */}
                            <div className="space-y-6" data-aos="fade-left" data-aos-delay="200">
                                <Card className="border-0 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 text-gray-900">Nuevo Sistema de Alertas Implementado</h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Sistema automatizado para notificaciones en tiempo real sobre cambios críticos.
                                                </p>
                                                <div className="text-xs text-gray-500">Hace 1 semana</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Camera className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 text-gray-900">Actualización de Galería Fotográfica</h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Nuevas imágenes de alta resolución de todos los puntos de monitoreo.
                                                </p>
                                                <div className="text-xs text-gray-500">Hace 2 semanas</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 text-gray-900">Mejoras en Modelos Predictivos</h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Algoritmos de IA actualizados con precisión mejorada del 94.2%.
                                                </p>
                                                <div className="text-xs text-gray-500">Hace 3 semanas</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Button
                                    variant="outline"
                                    className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                                    aria-label="Ver todas las actualizaciones recientes"
                                >
                                    Ver Todas las Actualizaciones
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div data-aos="fade-up">
                            <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 mb-6">
                                Mantente Informado sobre la Calidad del Agua
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                Recibe reportes semanales, alertas importantes y actualizaciones del sistema directamente en tu correo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <Input 
                                    type="email" 
                                    placeholder="tu@email.com" 
                                    className="flex-1 h-12 text-base border-gray-300 bg-white text-gray-900 placeholder-gray-500" 
                                />
                                <Button
                                    size="lg"
                                    className="px-8 bg-blue-600 text-white hover:bg-blue-700"
                                    aria-label="Suscribirse al boletín informativo"
                                >
                                    Suscribirse
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">Sin spam. Cancela cuando quieras.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}