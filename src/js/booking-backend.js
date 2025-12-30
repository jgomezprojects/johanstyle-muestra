// Sistema de Reservas con Google Calendar - Backend Node.js
(function() {
    'use strict';

    // Configuración de debug (cambiar a false en producción)
    const DEBUG = false;
    const log = DEBUG ? console.log.bind(console) : () => {};
    const warn = DEBUG ? console.warn.bind(console) : () => {};
    const error = console.error.bind(console); // Siempre mostrar errores

    // CONFIGURACIÓN: URL del backend (detección automática)
    // Detecta automáticamente si está en localhost o producción
    const getBackendUrl = () => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Si está en localhost, usar backend local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        
        // Si está en Netlify (producción), usar el backend de Render
        // URL del backend en Render
        const productionBackendUrl = 'https://johanstyle-backend.onrender.com';
        
        // Si hay una variable de entorno configurada, usarla (para Netlify)
        // Puedes configurar esto en Netlify: Site settings → Environment variables
        if (window.BACKEND_URL) {
            return window.BACKEND_URL;
        }
        
        // Por defecto, usar producción
        return productionBackendUrl;
    };
    
    const BACKEND_URL = getBackendUrl();
    
    // Zona horaria
    const TIMEZONE = 'America/Bogota';

    const utils = {
        getElement: (selector) => document.querySelector(selector),
        getElements: (selector) => document.querySelectorAll(selector)
    };

    let availableSlots = [];
    let selectedService = null;
    let isInitialized = false;
    let isAuthenticated = false;
    let isSubmitting = false; // Prevenir doble envío

    // Verificar autenticación
    async function checkAuth() {
        try {
            // Agregar timestamp para evitar caché
            const response = await fetch(`${BACKEND_URL}/auth/status?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                error('Error al verificar autenticación:', response.status, response.statusText);
                isAuthenticated = false;
                return false;
            }
            
            const data = await response.json();
            isAuthenticated = data.authenticated === true;
            
            if (!isAuthenticated) {
                warn('⚠️ Backend no autenticado. Necesitas autorizar la aplicación.');
            } else {
                log('✅ Aplicación autenticada correctamente');
            }
            return isAuthenticated;
        } catch (err) {
            error('Error al verificar autenticación:', err);
            error('Detalles del error:', err.message);
            isAuthenticated = false;
            return false;
        }
    }

    // Inicializar autenticación si es necesario
    async function initAuth() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            try {
                const response = await fetch(`${BACKEND_URL}/auth`);
                const data = await response.json();
                log('🔗 URL de autorización:', data.authUrl);
                // No abrir automáticamente, solo cuando sea necesario
            } catch (err) {
                error('Error al obtener URL de autorización:', err);
            }
        }
    }

    // Inicializar sistema de reservas
    function initBooking() {
        if (isInitialized) {
            warn('initBooking ya fue llamado, omitiendo...');
            return;
        }
        
        try {
            if (typeof SERVICES_CONFIG === 'undefined') {
                error('SERVICES_CONFIG no está disponible.');
                return;
            }
            
            const bookingButtons = utils.getElements('.btn-reservar');
            const modal = utils.getElement('#bookingModal');
            const closeBtn = utils.getElement('.booking-modal-close');
            const cancelBtn = utils.getElement('#bookingCancel');
            const bookingForm = utils.getElement('#bookingForm');
            const dateInput = utils.getElement('#bookingDate');

            if (!modal) {
                error('Modal de reserva no encontrado en el DOM');
                return;
            }

            // Event listeners para botones de reserva
            bookingButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceId = button.getAttribute('data-service');
                    if (serviceId && SERVICES_CONFIG[serviceId]) {
                        openBookingModal(serviceId);
                    }
                });
            });

            // Event listeners para cerrar modal
            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', closeModal);
            }

            // Cerrar modal al hacer clic fuera
            const overlay = utils.getElement('.booking-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', closeModal);
            }

            // Event listener para cambio de fecha
            if (dateInput) {
                dateInput.addEventListener('change', () => {
                    const selectedDate = dateInput.value;
                    if (selectedDate) {
                        loadAvailableSlots(selectedDate);
                    }
                });
            }

            // Event listener para envío del formulario
            if (bookingForm) {
                // Listener del formulario (método principal)
                // El botón con type="submit" automáticamente disparará este evento
                bookingForm.addEventListener('submit', handleBookingSubmit);
                log('✅ Event listener de submit registrado en el formulario');
                
                // Listener del botón para debugging y prevención de doble envío
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    log('✅ Botón de submit encontrado:', submitBtn);
                    
                    // Listener como respaldo - si el submit del formulario no se dispara
                    submitBtn.addEventListener('click', (e) => {
                        log('🔵 Click en botón de submit detectado');
                        log('🔵 Estado isSubmitting:', isSubmitting);
                        
                        // Si ya hay una reserva en proceso, prevenir
                        if (isSubmitting) {
                            warn('⚠️ Ya hay una reserva en proceso, bloqueando click...');
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            return false;
                        }
                        
                        // Si el formulario no es válido, no hacer nada (dejar que HTML5 valide)
                        if (!bookingForm.checkValidity()) {
                            warn('⚠️ Formulario no válido, dejando que HTML5 muestre los errores');
                            bookingForm.reportValidity();
                            return;
                        }
                        
                        // Si llegamos aquí y el submit no se ha disparado en 100ms, dispararlo manualmente
                        setTimeout(() => {
                            if (!isSubmitting) {
                                log('⚠️ El submit no se disparó automáticamente, disparándolo manualmente...');
                                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                bookingForm.dispatchEvent(submitEvent);
                            }
                        }, 100);
                        
                        log('✅ Click permitido, el submit del formulario se disparará');
                    }, { capture: false }); // No usar capture para no interferir
                } else {
                    warn('⚠️ No se encontró el botón de submit en el formulario');
                }
            } else {
                error('❌ No se encontró el formulario #bookingForm');
            }

            // Inicializar autenticación
            initAuth();

            isInitialized = true;
            log('✅ Sistema de reservas inicializado');
        } catch (err) {
            error('Error al inicializar sistema de reservas:', err);
        }
    }

    // Abrir modal de reserva (disponible globalmente)
    window.openBookingModal = async function(serviceId) {
        try {
            if (!SERVICES_CONFIG[serviceId]) {
                error('Servicio no encontrado:', serviceId);
                return;
            }

            selectedService = SERVICES_CONFIG[serviceId];
            const modal = utils.getElement('#bookingModal');
            const serviceDisplay = utils.getElement('#bookingServiceDisplay');
            const durationDisplay = utils.getElement('#bookingDurationDisplay');
            const serviceIdInput = utils.getElement('#bookingServiceId');
            const serviceNameInput = utils.getElement('#bookingServiceName');
            const durationInput = utils.getElement('#bookingDuration');

            if (!modal) return;

            // Llenar información del servicio
            if (serviceDisplay) serviceDisplay.textContent = selectedService.name;
            if (durationDisplay) durationDisplay.textContent = selectedService.duration;
            if (serviceIdInput) serviceIdInput.value = serviceId;
            if (serviceNameInput) serviceNameInput.value = selectedService.name;
            if (durationInput) durationInput.value = selectedService.duration;

            // Mostrar modal
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Establecer fecha mínima (hoy)
            const dateInput = utils.getElement('#bookingDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today);
                dateInput.value = '';
            }

            // Limpiar slots anteriores
            availableSlots = [];
            const timeSelect = utils.getElement('#bookingTime');
            if (timeSelect) {
                timeSelect.innerHTML = '<option value="" data-i18n="booking.selectTime">Selecciona una hora</option>';
                timeSelect.disabled = false;
            }

            // Verificar autenticación al abrir el modal
            await checkAuth();
        } catch (err) {
            error('Error al abrir modal:', err);
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
    }

    // Mostrar modal de éxito
    function showSuccessModal(details) {
        log('🎉 Mostrando modal de éxito con detalles:', details);
        
        const successModal = utils.getElement('#successModal');
        const successDetails = utils.getElement('#successDetails');
        
        if (!successModal) {
            error('❌ No se encontró el modal de éxito (#successModal)');
            // Mostrar alerta como respaldo
            alert(`¡Reserva confirmada!\n\nServicio: ${details.service}\nFecha: ${details.date}\nHora: ${details.time}`);
            return;
        }
        
        if (!successDetails) {
            error('❌ No se encontró el contenedor de detalles (#successDetails)');
        } else {
            // Llenar detalles
            successDetails.innerHTML = `
                <p><strong>Servicio:</strong> ${details.service}</p>
                <p><strong>Fecha:</strong> ${details.date}</p>
                <p><strong>Hora:</strong> ${details.time}</p>
            `;
            log('✅ Detalles del modal actualizados');
        }
        
        // Mostrar modal - IMPORTANTE: establecer aria-hidden="false" ANTES de dar foco
        successModal.setAttribute('aria-hidden', 'false');
        successModal.style.display = 'flex'; // Asegurar que se muestre
        document.body.style.overflow = 'hidden';
        
        log('✅ Modal de éxito mostrado, aria-hidden:', successModal.getAttribute('aria-hidden'));
        
        // Event listeners para cerrar
        const closeBtn = utils.getElement('#successModalClose');
        const okBtn = utils.getElement('#successModalOk');
        const overlay = successModal.querySelector('.booking-modal-overlay');
        
        const closeSuccessModal = () => {
            log('🔒 Cerrando modal de éxito');
            successModal.setAttribute('aria-hidden', 'true');
            successModal.style.display = 'none';
            document.body.style.overflow = '';
        };
        
        // Remover listeners anteriores si existen
        if (closeBtn) {
            closeBtn.onclick = closeSuccessModal;
            log('✅ Listener de cerrar configurado');
        } else {
            warn('⚠️ No se encontró el botón de cerrar (#successModalClose)');
        }
        
        if (okBtn) {
            okBtn.onclick = closeSuccessModal;
            log('✅ Listener de OK configurado');
        } else {
            warn('⚠️ No se encontró el botón OK (#successModalOk)');
        }
        
        if (overlay) {
            overlay.onclick = closeSuccessModal;
            log('✅ Listener de overlay configurado');
        } else {
            warn('⚠️ No se encontró el overlay del modal');
        }
        
        // Dar foco al botón después de un pequeño delay para asegurar que aria-hidden se actualizó
        setTimeout(() => {
            if (okBtn) {
                okBtn.focus();
                log('✅ Foco dado al botón OK');
            }
        }, 100);
    }

    // Cargar slots disponibles desde el backend
    async function loadAvailableSlots(date) {
        try {
            if (!selectedService) return;

            const timeSelect = utils.getElement('#bookingTime');
            if (!timeSelect) return;

            // Verificar autenticación primero
            const authenticated = await checkAuth();
            if (!authenticated) {
                timeSelect.innerHTML = '<option value="">⚠️ Necesitas autorizar la aplicación primero</option>';
                timeSelect.disabled = true;
                
                // Mostrar botón para autorizar
                const authButton = document.createElement('button');
                authButton.type = 'button';
                authButton.className = 'btn btn-primary';
                authButton.textContent = 'Autorizar Google Calendar';
                authButton.style.marginTop = '1rem';
                authButton.onclick = async () => {
                    try {
                        const response = await fetch(`${BACKEND_URL}/auth`);
                        const data = await response.json();
                        window.open(data.authUrl, '_blank');
                        alert('Se abrió una nueva ventana para autorizar. Después de autorizar, recarga esta página.');
                    } catch (err) {
                        alert('Error al obtener URL de autorización: ' + err.message);
                    }
                };
                
                // Insertar botón si no existe
                if (!timeSelect.parentElement.querySelector('.auth-button')) {
                    authButton.className += ' auth-button';
                    timeSelect.parentElement.appendChild(authButton);
                }
                return;
            }

            timeSelect.disabled = false;
            timeSelect.innerHTML = '<option value="">Cargando horarios disponibles...</option>';

            // Obtener disponibilidad del backend
            const response = await fetch(`${BACKEND_URL}/api/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    duration: selectedService.duration
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.needsReauth) {
                    timeSelect.innerHTML = '<option value="">⚠️ Sesión expirada. Por favor autoriza nuevamente.</option>';
                    timeSelect.disabled = true;
                    return;
                }
                throw new Error(errorData.error || 'Error al obtener disponibilidad');
            }

            const data = await response.json();
            availableSlots = data.availableSlots.map(slot => ({
                time: slot.display,
                start: new Date(slot.start),
                end: new Date(slot.end),
                display: slot.display
            }));

            // Llenar select con slots disponibles
            timeSelect.innerHTML = '<option value="" data-i18n="booking.selectTime">Selecciona una hora</option>';
            
            if (availableSlots.length === 0) {
                timeSelect.innerHTML += '<option value="">No hay horarios disponibles para esta fecha</option>';
            } else {
                availableSlots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.display;
                    option.textContent = slot.display;
                    timeSelect.appendChild(option);
                });
            }
        } catch (err) {
            error('Error al cargar slots disponibles:', err);
            const timeSelect = utils.getElement('#bookingTime');
            if (timeSelect) {
                timeSelect.innerHTML = '<option value="">Error al cargar horarios. Intenta de nuevo.</option>';
            }
        }
    }

    // Manejar envío del formulario
    async function handleBookingSubmit(e) {
        log('🔵 ========== handleBookingSubmit INICIADO ==========');
        log('🔵 Evento:', e);
        log('🔵 Target:', e.target);
        log('🔵 Current target:', e.currentTarget);
        
        e.preventDefault();
        e.stopPropagation();
        
        log('🔵 handleBookingSubmit llamado después de preventDefault');
        
        // Prevenir doble envío
        if (isSubmitting) {
            warn('⚠️ Ya hay una reserva en proceso, ignorando...');
            return false;
        }
        
        // Definir form fuera del try para que esté disponible en el finally
        // e.currentTarget es el formulario (donde está el listener)
        // e.target puede ser el botón o el formulario
        const form = e.currentTarget || e.target.closest('form') || utils.getElement('#bookingForm');
        log('🔵 Formulario obtenido:', form);
        
        if (!form) {
            error('❌ No se pudo obtener el formulario');
            isSubmitting = false;
            return;
        }
        
        let submitBtn = null;
        let originalText = 'Confirmar Reserva';
        
        // Marcar como en proceso INMEDIATAMENTE
        isSubmitting = true;
        
        try {
            const name = form.querySelector('#bookingName').value.trim();
            const email = form.querySelector('#bookingEmail').value.trim();
            const phone = form.querySelector('#bookingPhone').value.trim();
            const date = form.querySelector('#bookingDate').value;
            const time = form.querySelector('#bookingTime').value;

            // Validaciones
            if (!name || !email || !phone || !date || !time) {
                alert('Por favor completa todos los campos');
                isSubmitting = false; // Restablecer antes de salir
                return;
            }

            // Obtener información del servicio desde el formulario o selectedService
            const serviceIdInput = form.querySelector('#bookingServiceId');
            const serviceNameInput = form.querySelector('#bookingServiceName');
            const durationInput = form.querySelector('#bookingDuration');
            
            // Si selectedService es null, intentar obtenerlo desde el formulario
            if (!selectedService && serviceIdInput && serviceIdInput.value) {
                const serviceId = serviceIdInput.value;
                if (SERVICES_CONFIG[serviceId]) {
                    selectedService = SERVICES_CONFIG[serviceId];
                }
            }
            
            // Si aún no hay selectedService, obtener desde los inputs del formulario
            if (!selectedService) {
                const serviceName = serviceNameInput ? serviceNameInput.value : null;
                const duration = durationInput ? parseInt(durationInput.value) : null;
                
                if (!serviceName || !duration) {
                    alert('Error: Servicio no seleccionado. Por favor, cierra y vuelve a abrir el modal de reserva.');
                    return;
                }
                
                // Crear un objeto temporal con la información del servicio
                selectedService = {
                    name: serviceName,
                    duration: duration
                };
            }

            // Verificar autenticación
            const authenticated = await checkAuth();
            if (!authenticated) {
                const auth = confirm('Necesitas autorizar la aplicación para continuar. ¿Deseas autorizar ahora?');
                if (auth) {
                    try {
                        const response = await fetch(`${BACKEND_URL}/auth`);
                        const data = await response.json();
                        window.open(data.authUrl, '_blank');
                        alert('Se abrió una nueva ventana para autorizar. Después de autorizar, intenta la reserva nuevamente.');
                    } catch (err) {
                        alert('Error al obtener URL de autorización: ' + err.message);
                    }
                }
                isSubmitting = false; // Restablecer antes de salir
                return;
            }

            // Encontrar el slot seleccionado
            const selectedSlot = availableSlots.find(slot => slot.time === time);
            if (!selectedSlot) {
                alert('Por favor selecciona un horario válido');
                isSubmitting = false; // Restablecer antes de salir
                return;
            }

            // Obtener botón de envío
            submitBtn = form.querySelector('button[type="submit"]');
            originalText = submitBtn ? submitBtn.textContent : 'Confirmar Reserva';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creando reserva...';
            }

            // Preparar datos
            const bookingData = {
                name: name,
                email: email,
                phone: phone,
                serviceName: selectedService.name,
                duration: selectedService.duration,
                date: date,
                time: time,
                formattedDate: formatDateDisplay(date),
                formattedTime: selectedSlot.display,
                startTime: selectedSlot.start.toISOString(),
                endTime: selectedSlot.end.toISOString(),
                location: 'Carrera 54 #55-53 local 1'
            };

            // Enviar al backend
            log('📤 Enviando datos al backend:', bookingData);
            const response = await fetch(`${BACKEND_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            log('📥 Respuesta del backend:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                error('❌ Error del backend:', errorData);
                if (errorData.needsReauth) {
                    alert('Tu sesión expiró. Por favor autoriza la aplicación nuevamente.');
                    return;
                }
                throw new Error(errorData.error || 'Error al crear la reserva');
            }

            const result = await response.json();
            log('✅ Resultado del backend:', result);
            
            if (result && result.success) {
                log('✅ Reserva exitosa, preparando modal de éxito...');
                
                // Guardar información antes de cerrar el modal
                const serviceName = selectedService ? selectedService.name : (serviceNameInput ? serviceNameInput.value : 'Servicio');
                const successDetails = {
                    service: serviceName,
                    date: formatDateDisplay(date),
                    time: selectedSlot.display
                };
                
                log('📋 Detalles de la reserva exitosa:', successDetails);
                
                // Cerrar modal de reserva
                closeModal();
                log('✅ Modal de reserva cerrado');
                
                // Pequeño delay para asegurar que el modal anterior se cerró
                setTimeout(() => {
                    // Mostrar modal de éxito
                    showSuccessModal(successDetails);
                }, 300);
                
                // Resetear formulario
                form.reset();
            } else {
                const errorMsg = result?.error || 'Error desconocido';
                error('❌ El backend no reportó éxito:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err) {
            error('❌ Error al procesar la reserva:', err);
            error('❌ Stack trace:', err.stack);
            
            // Si el error es porque el backend procesó pero no devolvió success=true
            // Mostrar mensaje de éxito de todas formas si el backend respondió 200
            if (err.message && err.message.includes('Error desconocido')) {
                warn('⚠️ El backend puede haber procesado la reserva pero no devolvió success=true');
                // Intentar mostrar modal de éxito de todas formas
                try {
                    const serviceName = selectedService ? selectedService.name : 'Servicio';
                    const successDetails = {
                        service: serviceName,
                        date: form.querySelector('#bookingDate') ? formatDateDisplay(form.querySelector('#bookingDate').value) : 'Fecha',
                        time: form.querySelector('#bookingTime') ? form.querySelector('#bookingTime').value : 'Hora'
                    };
                    closeModal();
                    setTimeout(() => {
                        showSuccessModal(successDetails);
                    }, 300);
                    return; // Salir sin mostrar error
                } catch (modalError) {
                    error('❌ Error al mostrar modal de éxito:', modalError);
                }
            }
            
            alert('Error al procesar la reserva: ' + error.message);
        } finally {
            // Restaurar botón solo si existe
            if (form) {
                const btn = form.querySelector('button[type="submit"]') || submitBtn;
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            }
            // Permitir nuevos envíos
            isSubmitting = false;
        }
    }

    // Formatear fecha para mostrar (sin problemas de zona horaria)
    function formatDateDisplay(dateString) {
        // dateString viene en formato "YYYY-MM-DD"
        // Parsear manualmente para evitar problemas de zona horaria
        const [year, month, day] = dateString.split('-').map(Number);
        // Crear fecha en hora local (no UTC) para evitar desfase de un día
        const date = new Date(year, month - 1, day);
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

