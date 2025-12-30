// Sistema de Internacionalización (i18n) - Optimizado

(function() {
    'use strict';

    const translations = {
        es: {
            // Navegación
            'nav.home': 'Inicio',
            'nav.services': 'Servicios',
            'nav.gallery': 'Galería',
            'nav.schedule': 'Horarios',
            'nav.contact': 'Contacto',
            
            // Hero Section
            'hero.title': 'Elegancia y Estilo en Cada Corte',
            'hero.subtitle': 'Bienvenido a Johanstyle, donde la tradición se encuentra con la modernidad',
            'hero.parking': 'Parqueo Disponible',
            'hero.address': 'Carrera 54 #55-53 local 1',
            'hero.cta': 'Descubre Nuestros Servicios',
            
            // Secciones
            'section.services.title': 'Nuestros Servicios',
            'section.services.subtitle': 'Experiencia de barbería de clase mundial',
            'section.additional.services.title': 'Servicios Adicionales',
            'section.additional.services.subtitle': 'Tratamientos especializados para el cuidado de tu cabello',
            'service.additional.keratinas': 'Keratinas',
            'service.additional.aminoacidos': 'Aminoácidos',
            'service.additional.rayos': 'Rayos',
            'service.additional.colores': 'Colores',
            'section.gallery.title': 'Nuestros Cortes',
            'section.gallery.subtitle': 'Galería de nuestros mejores trabajos',
            'section.star.cuts.title': 'Cortes Estrellas',
            'section.star.cuts.subtitle': 'Nuestros cortes más destacados',
            'section.barber.title': '¿Quién es mi barbero?',
            'section.barber.quote': '"La barbería no es solo un oficio, es un arte que transforma y define tu estilo. Cada corte es una expresión de elegancia y dedicación."',
            'section.reviews.title': 'Reseñas de Clientes',
            'section.reviews.subtitle': 'Lo que dicen nuestros clientes',
            'section.reviews.form.title': 'Deja tu reseña',
            'section.reviews.form.name': 'Nombre',
            'section.reviews.form.rating': 'Calificación',
            'section.reviews.form.comment': 'Comentario',
            'section.reviews.form.submit': 'Enviar Reseña',
            'section.reviews.loadMore': 'Ver Más Reseñas',
            'section.reviews.loadLess': 'Ver Menos',
            'section.contact.title': 'Parqueadero Disponible',
            
            // Reservas
            'booking.button': 'Reservar',
            'booking.title': 'Reservar Cita',
            'booking.name': 'Nombre completo',
            'booking.email': 'Correo electrónico',
            'booking.date': 'Fecha',
            'booking.time': 'Hora',
            'booking.selectTime': 'Selecciona una hora',
            'booking.service': 'Servicio',
            'booking.duration': 'Duración',
            'booking.minutes': 'minutos',
            'booking.cancel': 'Cancelar',
            'booking.submit': 'Confirmar Reserva',
            
            // Características del barbero
            'name': 'Nombre',
            'age': 'Edad',
            'experience': 'Experiencia',
            'languages': 'Idiomas',
            
            // Horarios
            'schedule.title': 'Horarios de Atención',
            'schedule.weekdays': 'Lunes - Viernes:',
            'schedule.weekdays.time': '8:30 AM - 7:00 PM',
            'schedule.weekends': 'Sábados, Domingos y Festivos:',
            'schedule.weekends.time': '9:00 AM - 6:00 PM',
            
            // Servicios
            'service.cut.name': 'Corte de Cabello',
            'service.cut.desc': 'Transforma tu estilo con un corte profesional que realza tu personalidad y elegancia',
            'service.beard.name': 'Afeitado de Barba',
            'service.beard.desc': 'Dale forma y definición a tu barba con técnicas tradicionales que garantizan un acabado impecable',
            'service.cutbeard.name': 'Corte y Barba',
            'service.cutbeard.desc': 'Experiencia completa que combina corte profesional y diseño de barba para un look perfecto',
            'service.cutbeardbrow.name': 'Corte, Barba y Cejas',
            'service.cutbeardbrow.desc': 'Atención integral que incluye diseño de cejas para un aspecto refinado y armonioso',
            'service.cutbeardepil.name': 'Corte, Barba y Depilación',
            'service.cutbeardepil.desc': 'Paquete premium que incluye depilación facial para una piel suave y bien cuidada',
            'service.cutbeardexf.name': 'Corte, Barba y Exfoliación',
            'service.cutbeardexf.desc': 'Tratamiento completo que renueva tu piel mientras perfecciona tu estilo capilar',
            'service.complete.name': 'Paquete Completo',
            'service.complete.desc': 'Experiencia VIP con corte, barba, depilación y exfoliación para un resultado excepcional',
            'service.exfepil.name': 'Exfoliación y Depilación',
            'service.exfepil.desc': 'Tratamiento facial que limpia, renueva y suaviza tu piel para un aspecto radiante',
            'service.led.name': 'Máscara LED Ultra Sónica',
            'service.led.desc': 'Tecnología avanzada de cuidado facial que revitaliza y rejuvenece tu piel con luz terapéutica',
            
            // Contacto
            'contact.address': 'Dirección',
            'contact.address.value': 'Carrera 54 #55-53 local 1',
            'contact.email': 'Email',
            'contact.parking': '🅿️ Parqueo Disponible',
            'contact.parking.desc': 'Estacionamiento seguro para nuestros clientes',
            
            // Footer
            'footer.tagline': 'Elegancia y estilo en cada corte',
            'footer.links': 'Enlaces',
            'footer.contact': 'Contacto',
            'footer.social': 'Síguenos',
            'footer.hours': 'Horario:',
            'footer.rights': 'Todos los derechos reservados.'
        },
        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.services': 'Services',
            'nav.gallery': 'Gallery',
            'nav.schedule': 'Schedule',
            'nav.contact': 'Contact',
            
            // Hero Section
            'hero.title': 'Elegance and Style in Every Cut',
            'hero.subtitle': 'Welcome to Johanstyle, where tradition meets modernity',
            'hero.parking': 'Parking Available',
            'hero.address': 'Carrera 54 #55-53 local 1',
            'hero.cta': 'Discover Our Services',
            
            // Sections
            'section.services.title': 'Our Services',
            'section.services.subtitle': 'World-class barbershop experience',
            'section.gallery.title': 'Our Cuts',
            'section.gallery.subtitle': 'Gallery of our best work',
            'section.barber.title': 'Who is my barber?',
            'section.barber.quote': '"Barbering is not just a trade, it\'s an art that transforms and defines your style. Every cut is an expression of elegance and dedication."',
            'section.reviews.title': 'Client Reviews',
            'section.reviews.subtitle': 'What our clients say',
            'section.reviews.form.title': 'Leave your review',
            'section.reviews.form.name': 'Name',
            'section.reviews.form.rating': 'Rating',
            'section.reviews.form.comment': 'Comment',
            'section.reviews.form.submit': 'Submit Review',
            'section.reviews.loadMore': 'Load More Reviews',
            'section.reviews.loadLess': 'Show Less',
            'section.contact.title': 'Parking Available',
            
            // Barber characteristics
            'name': 'Name',
            'age': 'Age',
            'experience': 'Experience',
            'languages': 'Languages',
            
            // Schedule
            'schedule.title': 'Business Hours',
            'schedule.weekdays': 'Monday - Friday:',
            'schedule.weekdays.time': '8:30 AM - 7:00 PM',
            'schedule.weekends': 'Saturdays, Sundays and Holidays:',
            'schedule.weekends.time': '9:00 AM - 6:00 PM',
            
            // Services
            'service.cut.name': 'Haircut',
            'service.cut.desc': 'Transform your style with a professional cut that enhances your personality and elegance',
            'service.beard.name': 'Beard Shave',
            'service.beard.desc': 'Shape and define your beard with traditional techniques that guarantee an impeccable finish',
            'service.cutbeard.name': 'Cut and Beard',
            'service.cutbeard.desc': 'Complete experience combining professional cut and beard design for a perfect look',
            'service.cutbeardbrow.name': 'Cut, Beard and Eyebrows',
            'service.cutbeardbrow.desc': 'Comprehensive service including eyebrow design for a refined and harmonious appearance',
            'service.cutbeardepil.name': 'Cut, Beard and Depilation',
            'service.cutbeardepil.desc': 'Premium package including facial depilation for smooth and well-cared skin',
            'service.cutbeardexf.name': 'Cut, Beard and Exfoliation',
            'service.cutbeardexf.desc': 'Complete treatment that renews your skin while perfecting your hair style',
            'service.complete.name': 'Complete Package',
            'service.complete.desc': 'VIP experience with cut, beard, depilation and exfoliation for an exceptional result',
            'service.exfepil.name': 'Exfoliation and Depilation',
            'service.exfepil.desc': 'Facial treatment that cleanses, renews and softens your skin for a radiant appearance',
            'service.led.name': 'Ultra Sonic LED Mask',
            'service.led.desc': 'Advanced facial care technology that revitalizes and rejuvenates your skin with therapeutic light',
            
            // Contact
            'contact.address': 'Address',
            'contact.address.value': 'Carrera 54 #55-53 local 1',
            'contact.email': 'Email',
            'contact.parking': '🅿️ Parking Available',
            'contact.parking.desc': 'Secure parking for our clients',
            
            // Footer
            'footer.tagline': 'Elegance and style in every cut',
            'footer.links': 'Links',
            'footer.contact': 'Contact',
            'footer.social': 'Follow Us',
            'footer.hours': 'Hours:',
            'footer.rights': 'All rights reserved.'
        }
    };

    let currentLanguage = 'es';

    // Función para obtener idioma guardado de forma segura
    function getStoredLanguage() {
        try {
            return localStorage.getItem('language') || 'es';
        } catch (err) {
            warn('No se pudo acceder a localStorage:', err);
            return 'es';
        }
    }

    // Función para guardar idioma de forma segura
    function setStoredLanguage(lang) {
        try {
            localStorage.setItem('language', lang);
        } catch (err) {
            warn('No se pudo guardar en localStorage:', err);
        }
    }

    // Función para cambiar el idioma
    function changeLanguage(lang) {
        try {
            if (!translations[lang]) {
                warn(`Idioma ${lang} no disponible`);
                return;
            }

            currentLanguage = lang;
            setStoredLanguage(lang);
            
            // Actualizar atributo lang del HTML
            const htmlElement = document.documentElement;
            if (htmlElement) {
                htmlElement.lang = lang;
                const htmlLangElement = document.getElementById('html-lang');
                if (htmlLangElement) {
                    htmlLangElement.setAttribute('lang', lang);
                }
            }
            
            // Actualizar todos los elementos con data-i18n
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                try {
                    const key = element.getAttribute('data-i18n');
                    if (key && translations[lang] && translations[lang][key]) {
                        element.textContent = translations[lang][key];
                    }
                } catch (err) {
                    error('Error al actualizar elemento:', err);
                }
            });
            
            // Actualizar botón de idioma
            const langToggle = document.getElementById('language-toggle');
            if (langToggle) {
                const langCode = langToggle.querySelector('.lang-code');
                if (langCode) {
                    langCode.textContent = lang.toUpperCase();
                }
                langToggle.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
            }
        } catch (err) {
            error('Error al cambiar idioma:', err);
        }
    }

    // Inicializar al cargar la página
    function init() {
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
                return;
            }

            // Aplicar idioma guardado
            currentLanguage = getStoredLanguage();
            changeLanguage(currentLanguage);
            
            // Configurar botón de cambio de idioma
            const langToggle = document.getElementById('language-toggle');
            if (langToggle) {
                langToggle.addEventListener('click', function() {
                    try {
                        const newLang = currentLanguage === 'es' ? 'en' : 'es';
                        changeLanguage(newLang);
                    } catch (err) {
                        error('Error al cambiar idioma:', err);
                    }
                });
            }
        } catch (err) {
            error('Error en la inicialización de i18n:', err);
        }
    }

    // Iniciar
    init();
})();
