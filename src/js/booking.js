// Sistema de Reservas con Google Calendar (Sin API Key - Sin Backend)
(function() {
    'use strict';

    // CONFIGURACIÓN: Tu email de Google Calendar
    // Este se usará para crear el enlace de Google Calendar con datos prellenados
    const CALENDAR_EMAIL = 'Johancollado44@gmail.com';
    
    // Google Apps Script URL: Después de crear y desplegar el script, pega aquí la URL
    // Formato: https://script.google.com/macros/s/TU_SCRIPT_ID/exec
    // Si no quieres usar backend, déjalo como está y el sistema abrirá Google Calendar directamente
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwG4DjdAAghkJXY9d8uqn2Cc23N1zMeLFXLAXSoD0B2bAHWOOxViXrYCyaRFQEixGMu6g/exec'; // ✅ Configurado - Envía correos automáticamente

    // Zona horaria (ajusta según tu ubicación)
    const TIMEZONE = 'America/Bogota'; // Ejemplos: 'America/Mexico_City', 'America/New_York', 'Europe/Madrid'

    const utils = {
        getElement: (selector) => document.querySelector(selector),
        getElements: (selector) => document.querySelectorAll(selector)
    };

    let availableSlots = [];
    let selectedService = null;
    let isInitialized = false; // Prevenir inicialización múltiple

    // Inicializar sistema de reservas
    function initBooking() {
        // Prevenir inicialización múltiple
        if (isInitialized) {
            console.warn('initBooking ya fue llamado, omitiendo...');
            return;
        }
        
        try {
            // Verificar que SERVICES_CONFIG esté disponible
            if (typeof SERVICES_CONFIG === 'undefined') {
                console.error('SERVICES_CONFIG no está disponible. Verifica que services-config.js se cargue antes de booking.js');
                return;
            }
            
            const bookingButtons = utils.getElements('.btn-reservar');
            const modal = utils.getElement('#bookingModal');
            const closeBtn = utils.getElement('.booking-modal-close');
            const cancelBtn = utils.getElement('#bookingCancel');
            const bookingForm = utils.getElement('#bookingForm');
            const dateInput = utils.getElement('#bookingDate');

            if (!modal) {
                console.error('Modal de reserva no encontrado en el DOM');
                return;
            }

            // Establecer fecha mínima (hoy)
            if (dateInput) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = today.toISOString().split('T')[0];
                dateInput.setAttribute('min', todayStr);
            }

            // Event listeners para botones de reservar
            // Filtrar solo los botones que están en las tarjetas de servicios (no el del modal)
            const serviceCardButtons = Array.from(bookingButtons).filter(btn => {
                // Verificar que el botón esté dentro de una tarjeta de servicio
                const isInServiceCard = btn.closest('.servicio-card') !== null;
                return isInServiceCard;
            });
            
            console.log(`Encontrados ${serviceCardButtons.length} botones de reservar en tarjetas de servicios`);
            serviceCardButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    console.log(`Botón ${index} clickeado`);
                    e.preventDefault();
                    e.stopPropagation();
                    const serviceId = btn.getAttribute('data-service');
                    console.log('Service ID:', serviceId);
                    if (serviceId) {
                        console.log('Abriendo modal para servicio:', serviceId);
                        openBookingModal(serviceId);
                    } else {
                        console.error('Botón de reservar sin atributo data-service');
                    }
                });
            });

            // Cerrar modal
            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', closeModal);
            }

            // Cerrar al hacer clic fuera del modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('booking-modal-overlay')) {
                    closeModal();
                }
            });

            // Cerrar con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                    closeModal();
                }
            });

            // Cambio de fecha
            if (dateInput) {
                dateInput.addEventListener('change', () => {
                    loadAvailableSlots();
                });
            }

            // Envío del formulario
            if (bookingForm) {
                console.log('Agregando event listener al formulario');
                bookingForm.addEventListener('submit', handleBookingSubmit);
            } else {
                console.error('Formulario de reserva no encontrado');
            }
            
            // Marcar como inicializado
            isInitialized = true;
            console.log('Sistema de reservas inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar sistema de reservas:', error);
        }
    }

    // Abrir modal de reserva
    function openBookingModal(serviceId) {
        // Verificar que SERVICES_CONFIG esté disponible
        if (typeof SERVICES_CONFIG === 'undefined') {
            console.error('SERVICES_CONFIG no está disponible. Asegúrate de que services-config.js se cargue antes de booking.js');
            alert('Error: El sistema de reservas no está completamente cargado. Por favor recarga la página.');
            return;
        }
        
        const service = SERVICES_CONFIG[serviceId];
        if (!service) {
            console.error('Servicio no encontrado:', serviceId);
            alert('Error: Servicio no encontrado. Por favor recarga la página.');
            return;
        }

        selectedService = { id: serviceId, ...service };
        const modal = utils.getElement('#bookingModal');
        const serviceNameDisplay = utils.getElement('#bookingServiceDisplay');
        const durationDisplay = utils.getElement('#bookingDurationDisplay');
        const serviceIdInput = utils.getElement('#bookingServiceId');
        const serviceNameInput = utils.getElement('#bookingServiceName');
        const durationInput = utils.getElement('#bookingDuration');

        if (serviceNameDisplay) serviceNameDisplay.textContent = service.name;
        if (durationDisplay) durationDisplay.textContent = service.duration;
        if (serviceIdInput) serviceIdInput.value = serviceId;
        if (serviceNameInput) serviceNameInput.value = service.name;
        if (durationInput) durationInput.value = service.duration;

        // Resetear formulario
        const form = utils.getElement('#bookingForm');
        if (form) {
            form.reset();
            // Resetear fecha mínima
            const dateInput = utils.getElement('#bookingDate');
            if (dateInput) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dateInput.setAttribute('min', today.toISOString().split('T')[0]);
            }
        }

        // Mostrar modal
        if (modal) {
            console.log('Mostrando modal');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            console.log('Modal aria-hidden:', modal.getAttribute('aria-hidden'));
        } else {
            console.error('Modal no encontrado al intentar mostrarlo');
        }

        // Limpiar select de horas inicialmente (se cargará cuando se seleccione una fecha)
        const timeSelect = utils.getElement('#bookingTime');
        if (timeSelect) {
            timeSelect.innerHTML = '<option value="" data-i18n="booking.selectTime">Selecciona primero una fecha</option>';
            timeSelect.disabled = true;
        }
    }

    // Cerrar modal
    function closeModal() {
        const modal = utils.getElement('#bookingModal');
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        selectedService = null;
        availableSlots = [];
        
        // Limpiar select de horas
        const timeSelect = utils.getElement('#bookingTime');
        if (timeSelect) {
            timeSelect.innerHTML = '<option value="" data-i18n="booking.selectTime">Selecciona una hora</option>';
        }
    }

    // Cargar slots disponibles (sin API Key - genera horarios estándar)
    function loadAvailableSlots() {
        try {
            const dateInput = utils.getElement('#bookingDate');
            const timeSelect = utils.getElement('#bookingTime');
            
            if (!dateInput || !timeSelect || !selectedService) {
                console.warn('Elementos necesarios no encontrados para cargar slots');
                return;
            }

            const selectedDate = dateInput.value;
            if (!selectedDate) {
                timeSelect.innerHTML = '<option value="">Selecciona primero una fecha</option>';
                timeSelect.disabled = true;
                return;
            }

            // Generar slots disponibles basados solo en horarios estándar (sin verificar ocupados)
            // Nota: Sin API Key no podemos verificar disponibilidad en tiempo real
            const slots = generateAvailableSlots(selectedDate, [], selectedService.duration);
            availableSlots = slots;

            // Llenar select con slots disponibles
            if (slots.length === 0) {
                timeSelect.innerHTML = '<option value="">No hay horarios disponibles para esta fecha</option>';
            } else {
                timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
                slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = slot.display;
                    timeSelect.appendChild(option);
                });
            }

            timeSelect.disabled = false;
        } catch (error) {
            console.error('Error al cargar slots disponibles:', error);
            const timeSelect = utils.getElement('#bookingTime');
            if (timeSelect) {
                timeSelect.innerHTML = '<option value="">Error al cargar horarios. Por favor intenta de nuevo.</option>';
                timeSelect.disabled = false;
            }
        }
    }

    // Generar slots disponibles (sin verificar ocupados - sin API Key)
    function generateAvailableSlots(date, busySlots, duration) {
        try {
            const slots = [];
            const startHour = 8; // 8:00 AM
            const endHour = 19; // 7:00 PM
            const interval = 15; // Intervalo de 15 minutos

            const now = new Date();
            
            // Crear fecha base en la zona horaria local
            const dateObj = new Date(date + 'T00:00:00');
            
            // Validar que la fecha sea válida
            if (isNaN(dateObj.getTime())) {
                console.error('Fecha inválida:', date);
                return [];
            }

            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += interval) {
                    // Crear fecha/hora en la zona horaria local
                    const slotStart = new Date(dateObj);
                    slotStart.setHours(hour, minute, 0, 0);
                    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

                    // Verificar que no sea en el pasado
                    if (slotStart <= now) continue;

                    // Verificar que no exceda el horario de cierre
                    const closeTime = new Date(dateObj);
                    closeTime.setHours(endHour, 0, 0, 0);
                    if (slotEnd > closeTime) continue;

                    // Sin API Key, no podemos verificar ocupados, así que mostramos todos los slots disponibles
                    // El barbero deberá verificar manualmente en su calendario antes de confirmar
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    const displayTime = formatTime(hour, minute);
                    slots.push({
                        time: timeString,
                        display: displayTime,
                        start: slotStart,
                        end: slotEnd
                    });
                }
            }

            return slots;
        } catch (error) {
            console.error('Error al generar slots disponibles:', error);
            return [];
        }
    }

    // Formatear hora
    function formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
    }

    // Manejar envío de reserva (abre Google Calendar con datos prellenados o usa backend)
    async function handleBookingSubmit(e) {
        try {
            console.log('handleBookingSubmit llamado');
            e.preventDefault();
            e.stopPropagation();

            const form = e.target;
            console.log('Form:', form);
            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');
            const date = formData.get('date');
            const time = formData.get('time');
            const serviceName = formData.get('serviceName');
            const duration = parseInt(formData.get('duration'));

            console.log('Datos del formulario:', { name, email, date, time, serviceName, duration, selectedService });

            if (!name || !email || !date || !time || !selectedService) {
                console.warn('Campos faltantes:', { name: !!name, email: !!email, date: !!date, time: !!time, selectedService: !!selectedService });
                alert('Por favor completa todos los campos');
                return;
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor ingresa un correo electrónico válido');
                return;
            }

            // Encontrar el slot seleccionado
            console.log('Buscando slot con time:', time);
            console.log('Available slots:', availableSlots);
            const selectedSlot = availableSlots.find(slot => slot.time === time);
            console.log('Selected slot:', selectedSlot);
            
            if (!selectedSlot) {
                console.error('Slot no encontrado para time:', time);
                alert('Por favor selecciona un horario válido');
                return;
            }

            // Preparar datos comunes para ambos métodos
            const eventTitle = `${serviceName} - ${name}`;
            const eventDescription = `Cliente: ${name}\nEmail: ${email}\nServicio: ${serviceName}\nDuración: ${duration} minutos\n\nReserva realizada desde el sitio web de JohanStyle VIP`;
            const location = 'Carrera 54 #55-53 local 1';
            const startTimeFormatted = formatDateForGoogle(selectedSlot.start);
            const endTimeFormatted = formatDateForGoogle(selectedSlot.end);
            
            // Variable para rastrear si el backend funcionó
            let backendSuccess = false;
            
            // Verificar si hay Google Apps Script configurado para enviar correos automáticamente
            if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('TU_GOOGLE_SCRIPT_URL')) {
                // Intentar usar backend primero, si falla usar método sin backend
                console.log('Intentando usar backend para crear evento y enviar correos');
                console.log('URL del script:', GOOGLE_SCRIPT_URL);
                
                // Obtener botón de envío para mostrar estado
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : 'Confirmar Reserva';
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Creando reserva...';
                }
                
                try {
                    // Preparar datos para enviar al backend
                    const bookingData = {
                        name: name,
                        email: email,
                        serviceName: serviceName,
                        duration: duration,
                        date: date,
                        time: time,
                        formattedDate: formatDateDisplay(date),
                        formattedTime: selectedSlot.display,
                        startTime: selectedSlot.start.toISOString(),
                        endTime: selectedSlot.end.toISOString(),
                        location: location
                    };
                    
                    console.log('Enviando datos al backend:', bookingData);
                    
                    // Intentar con timeout para evitar esperas largas (aumentado a 20 segundos)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout
                    
                    try {
                        console.log('Enviando petición POST a:', GOOGLE_SCRIPT_URL);
                        console.log('Datos enviados:', bookingData);
                        
                        const response = await fetch(GOOGLE_SCRIPT_URL, {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(bookingData),
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        console.log('Respuesta recibida. Status:', response.status, 'OK:', response.ok);
                        
                        if (response.ok) {
                            const text = await response.text();
                            let result;
                            try {
                                result = JSON.parse(text);
                            } catch (e) {
                                // Si no es JSON válido, asumir éxito si el status es 200
                                result = { success: true };
                            }
                            
                            if (result && result.success) {
                                backendSuccess = true;
                                alert(`¡Reserva confirmada exitosamente! 🎉\n\nServicio: ${serviceName}\nFecha: ${formatDateDisplay(date)}\nHora: ${selectedSlot.display}\n\n✅ El barbero ha sido notificado por correo.\n✅ Has recibido una invitación por email.\n✅ El evento ha sido creado en el calendario.`);
                                closeModal();
                                form.reset();
                                return; // Salir si todo fue bien
                            } else {
                                // El backend respondió pero indicó error
                                const errorMsg = result?.error || result?.message || 'Error desconocido';
                                throw new Error(`El servidor reportó un error: ${errorMsg}`);
                            }
                        } else {
                            // El servidor respondió con un código de error
                            const errorText = await response.text().catch(() => 'Error desconocido');
                            throw new Error(`Error del servidor (${response.status}): ${errorText}`);
                        }
                    } catch (fetchError) {
                        clearTimeout(timeoutId);
                        console.error('Error al conectar con el backend:', fetchError);
                        console.error('URL intentada:', GOOGLE_SCRIPT_URL);
                        console.error('Tipo de error:', fetchError.name);
                        console.error('Mensaje de error:', fetchError.message);
                        
                        // Determinar el tipo de error para mostrar mensaje apropiado
                        let errorMessage = 'Error al procesar la reserva. ';
                        let showDetails = false;
                        
                        if (fetchError.name === 'AbortError') {
                            errorMessage += 'La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.';
                        } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError') || fetchError.message.includes('Network request failed') || fetchError.message.includes('CORS')) {
                            errorMessage += 'No se pudo conectar con el servidor.\n\n';
                            errorMessage += 'Posibles causas:\n';
                            errorMessage += '• Verifica tu conexión a internet\n';
                            errorMessage += '• El script de Google Apps Script puede no estar desplegado correctamente\n';
                            errorMessage += '• Puede haber un problema de CORS (permisos)\n\n';
                            errorMessage += '💡 IMPORTANTE: Si estás en localhost (127.0.0.1), Google Apps Script puede tener problemas de CORS.\n';
                            errorMessage += 'Prueba subir el sitio a un servidor web o contacta al barbero directamente.';
                            showDetails = true;
                        } else {
                            errorMessage += fetchError.message || 'Por favor intenta de nuevo más tarde.';
                        }
                        
                        if (showDetails) {
                            console.log('💡 SUGERENCIA: Verifica que el Google Apps Script esté desplegado como "Aplicación web" con acceso público.');
                        }
                        
                        alert(errorMessage);
                        throw fetchError; // Re-lanzar para que se maneje en el catch externo
                    }
                } catch (error) {
                    console.error('Error en el backend:', error);
                    // El error ya fue manejado y mostrado en el catch interno
                    // Solo necesitamos restaurar el botón
                } finally {
                    if (submitBtn && !backendSuccess) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            } else {
                // Si no hay backend configurado, mostrar error
                alert('⚠️ El sistema de reservas no está configurado correctamente.\n\nPor favor contacta al barbero directamente para hacer tu reserva.');
            }
        } catch (error) {
            console.error('Error al procesar la reserva:', error);
            alert('Error al procesar la reserva. Por favor intenta de nuevo.');
        }
    }

    // Formatear fecha para Google Calendar (formato: YYYYMMDDTHHMMSS)
    function formatDateForGoogle(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    }

    // Formatear fecha para mostrar
    function formatDateDisplay(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBooking);
    } else {
        initBooking();
    }
})();

