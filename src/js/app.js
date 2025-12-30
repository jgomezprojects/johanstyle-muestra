// Aplicación Principal - Optimizada con validaciones y manejo de errores

(function() {
    'use strict';

    // Utilidades
    const utils = {
        // Verificar si un elemento existe
        exists: (element) => element !== null && element !== undefined,
        
        // Obtener elemento de forma segura
        getElement: (selector) => {
            try {
                return document.querySelector(selector);
            } catch (error) {
                console.error(`Error al obtener elemento ${selector}:`, error);
                return null;
            }
        },
        
        // Obtener múltiples elementos de forma segura
        getElements: (selector) => {
            try {
                return document.querySelectorAll(selector);
            } catch (error) {
                console.error(`Error al obtener elementos ${selector}:`, error);
                return [];
            }
        }
    };

    // Inicialización
    function init() {
        try {
            initHeroSlider();
            initMobileMenu();
            initHeaderScroll();
            initSmoothScroll();
            initReviews();
            initServicesFilter();
        } catch (error) {
            console.error('Error en la inicialización:', error);
        }
    }

    // Sistema de Reviews
    function initReviews() {
        const starRating = utils.getElement('#starRating');
        const reviewForm = utils.getElement('#reviewForm');
        const reviewsContainer = utils.getElement('#reviewsContainer');
        const reviewRatingInput = utils.getElement('#reviewRating');
        const loadMoreContainer = utils.getElement('#reviewsLoadMoreContainer');
        const loadMoreBtn = utils.getElement('#loadMoreReviews');
        const loadLessBtn = utils.getElement('#loadLessReviews');
        
        if (!starRating || !reviewForm || !reviewsContainer) return;

        let selectedRating = 0;
        const reviewsPerPage = 6; // Mostrar 6 reviews por página
        let currentPage = 1;
        let allReviews = []; // Almacenar todas las reviews
        let displayedReviews = 0; // Contador de reviews mostradas
        const initialReviewsCount = 3; // Las 3 reviews de simulación

        // Inicializar reviews desde localStorage
        loadReviewsFromStorage();

        // Manejar clic en estrellas
        const starButtons = starRating.querySelectorAll('.star-btn');
        
        if (starButtons.length === 0) {
            console.error('No se encontraron botones de estrellas');
            return;
        }
        
        starButtons.forEach((btn, index) => {
            const rating = index + 1;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectedRating = rating;
                reviewRatingInput.value = selectedRating;
                updateStarDisplay(starButtons, selectedRating);
            });

            btn.addEventListener('mouseenter', () => {
                // Al hacer hover, mostrar preview de la calificación
                highlightStars(starButtons, rating);
            });
        });

        starRating.addEventListener('mouseleave', () => {
            // Al salir del hover, volver al estado seleccionado
            updateStarDisplay(starButtons, selectedRating);
        });
        
        function highlightStars(buttons, rating) {
            if (!buttons || buttons.length === 0) return;
            
            buttons.forEach((btn, index) => {
                const star = btn.querySelector('.star');
                if (!star) return;
                
                // Iluminar todas las estrellas hasta el rating (incluyendo la actual)
                // Ejemplo: si rating es 3, iluminar estrellas 0, 1, 2 (índices)
                if (index < rating) {
                    star.style.setProperty('color', 'var(--dorado)', 'important');
                } else {
                    star.style.setProperty('color', 'var(--gris-oscuro)', 'important');
                }
            });
        }

        // Manejar envío del formulario
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = utils.getElement('#reviewName').value.trim();
            const rating = parseInt(reviewRatingInput.value);
            const comment = utils.getElement('#reviewText').value.trim();

            if (!name || !rating || !comment) {
                alert('Por favor completa todos los campos');
                return;
            }

            if (rating === 0) {
                alert('Por favor selecciona una calificación');
                return;
            }

            addReview(name, rating, comment);
            reviewForm.reset();
            selectedRating = 0;
            reviewRatingInput.value = 0;
            updateStarDisplay(starButtons, 0);
        });

        function updateStarDisplay(buttons, rating) {
            if (!buttons || buttons.length === 0) return;
            
            buttons.forEach((btn, index) => {
                const star = btn.querySelector('.star');
                if (!star) return;
                
                // Remover todas las clases active primero
                btn.classList.remove('active');
                
                // Si el índice es menor que el rating, debe estar activa (iluminada)
                // Ejemplo: si rating es 3, las estrellas 0, 1, 2 (índices) deben estar doradas
                if (index < rating) {
                    btn.classList.add('active');
                    // Forzar el color con inline style para que tenga prioridad
                    star.style.setProperty('color', 'var(--dorado)', 'important');
                } else {
                    star.style.setProperty('color', 'var(--gris-oscuro)', 'important');
                }
            });
        }

        function addReview(name, rating, comment) {
            const reviewCard = document.createElement('article');
            reviewCard.className = 'review-card';
            reviewCard.setAttribute('role', 'article');

            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            const date = 'Hace unos momentos';

            const starsHTML = Array.from({ length: 5 }, (_, i) => 
                `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
            ).join('');

            reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="review-author">
                        <div class="review-avatar">${initials}</div>
                        <div class="review-author-info">
                            <h3 class="review-name">${escapeHtml(name)}</h3>
                            <p class="review-date">${date}</p>
                        </div>
                    </div>
                    <div class="review-stars" aria-label="Calificación: ${rating} estrellas">
                        ${starsHTML}
                    </div>
                </div>
                <p class="review-text">${escapeHtml(comment)}</p>
            `;

            // Insertar después de las reviews de simulación
            const existingReviews = reviewsContainer.querySelectorAll('.review-card');
            if (existingReviews.length >= initialReviewsCount) {
                reviewsContainer.insertBefore(reviewCard, existingReviews[initialReviewsCount] || null);
            } else {
                reviewsContainer.appendChild(reviewCard);
            }
            
            displayedReviews++;
            
            // Guardar en localStorage
            const reviewData = { name, rating, comment, date };
            saveReviewToStorage(reviewData);
            
            // Actualizar allReviews
            allReviews.unshift(reviewData);
            if (allReviews.length > 50) {
                allReviews = allReviews.slice(0, 50);
            }
            
            // Actualizar botón "Ver más" - no es necesario porque la nueva review ya se muestra
            // Pero si hay más reviews guardadas, el botón debe aparecer
            updateLoadMoreButton();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function saveReviewToStorage(reviewData) {
            try {
                const reviews = JSON.parse(localStorage.getItem('johanstyle-reviews') || '[]');
                reviews.unshift(reviewData);
                // Mantener solo los últimos 50 reviews
                const limitedReviews = reviews.slice(0, 50);
                localStorage.setItem('johanstyle-reviews', JSON.stringify(limitedReviews));
            } catch (error) {
                console.error('Error al guardar review:', error);
            }
        }

        function loadReviewsFromStorage() {
            try {
                // Limpiar localStorage para eliminar la reseña de prueba
                localStorage.removeItem('johanstyle-reviews');
                allReviews = [];
                
                // Contar las reviews de simulación que ya están en el HTML (3)
                const existingReviews = reviewsContainer.querySelectorAll('.review-card');
                displayedReviews = existingReviews.length; // Debería ser 3 inicialmente
                
                // No mostrar reviews del localStorage inicialmente, solo las 3 de simulación
                // El botón "Ver más" aparecerá si hay reviews en localStorage
                updateLoadMoreButton();
            } catch (error) {
                console.error('Error al cargar reviews:', error);
            }
        }

        function displayReviews(reviews) {
            reviews.forEach(review => {
                const reviewCard = createReviewCard(review);
                // Insertar después de las reviews de simulación
                const existingReviews = reviewsContainer.querySelectorAll('.review-card');
                if (existingReviews.length >= initialReviewsCount) {
                    reviewsContainer.insertBefore(reviewCard, existingReviews[initialReviewsCount] || null);
        } else {
                    reviewsContainer.appendChild(reviewCard);
                }
                displayedReviews++;
            });
        }

        function createReviewCard(review) {
            const reviewCard = document.createElement('article');
            reviewCard.className = 'review-card';
            reviewCard.setAttribute('role', 'article');

            const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            const starsHTML = Array.from({ length: 5 }, (_, i) => 
                `<span class="star ${i < review.rating ? 'filled' : ''}">★</span>`
            ).join('');

            reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="review-author">
                        <div class="review-avatar">${initials}</div>
                        <div class="review-author-info">
                            <h3 class="review-name">${escapeHtml(review.name)}</h3>
                            <p class="review-date">${review.date}</p>
                        </div>
                    </div>
                    <div class="review-stars" aria-label="Calificación: ${review.rating} estrellas">
                        ${starsHTML}
                    </div>
                </div>
                <p class="review-text">${escapeHtml(review.comment)}</p>
            `;

            return reviewCard;
        }

        function updateLoadMoreButton() {
            if (!loadMoreContainer) return;
            
            // Calcular cuántas reviews del localStorage aún no se han mostrado
            const reviewsFromStorage = allReviews.length;
            const reviewsShownFromStorage = Math.max(0, displayedReviews - initialReviewsCount);
            
            // Mostrar el contenedor si hay reviews en localStorage o si ya se mostraron más de las iniciales
            if ((reviewsFromStorage > 0 && reviewsFromStorage > reviewsShownFromStorage) || displayedReviews > initialReviewsCount) {
                loadMoreContainer.style.display = 'flex';
                
                // Mostrar "Ver menos" si se han cargado más reviews que las iniciales
                if (loadLessBtn && displayedReviews > initialReviewsCount) {
                    loadLessBtn.style.display = 'inline-block';
                } else if (loadLessBtn) {
                    loadLessBtn.style.display = 'none';
                }
                
                // Mostrar "Ver más" si aún hay reviews por mostrar
                if (loadMoreBtn && reviewsFromStorage > reviewsShownFromStorage) {
                    loadMoreBtn.style.display = 'inline-block';
                } else if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'none';
                }
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }

        // Manejar clic en "Ver más"
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                const reviewsShownFromStorage = displayedReviews - initialReviewsCount;
                const startIndex = reviewsShownFromStorage;
                const endIndex = Math.min(startIndex + reviewsPerPage, allReviews.length);
                const nextReviews = allReviews.slice(startIndex, endIndex);
                
                if (nextReviews.length > 0) {
                    displayReviews(nextReviews);
                    
                    // Asegurar que todas las reviews mostradas estén visibles
                    const allCards = reviewsContainer.querySelectorAll('.review-card');
                    allCards.forEach(card => {
                        card.style.display = 'block';
                    });
                    
                    // Actualizar botones después de mostrar las reviews
                    updateLoadMoreButton();
                    
                    // Scroll suave hacia las nuevas reviews
                    setTimeout(() => {
                        const newReviews = reviewsContainer.querySelectorAll('.review-card');
                        if (newReviews.length > 0) {
                            newReviews[newReviews.length - 1].scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'nearest' 
                            });
                        }
                    }, 100);
                }
            });
        }
        
        // Manejar clic en "Ver menos"
        if (loadLessBtn) {
            loadLessBtn.addEventListener('click', () => {
                // Obtener todas las reviews mostradas
                const allDisplayedCards = reviewsContainer.querySelectorAll('.review-card');
                
                // Si hay más de las iniciales, ocultar las extras
                if (allDisplayedCards.length > initialReviewsCount) {
                    // Ocultar todas las reviews excepto las iniciales
                    allDisplayedCards.forEach((card, index) => {
                        if (index >= initialReviewsCount) {
                            card.style.display = 'none';
                        }
                    });
                    
                    // Actualizar contador
                    displayedReviews = initialReviewsCount;
                    
                    // Ocultar botón "Ver menos" y mostrar "Ver más"
                    if (loadLessBtn) loadLessBtn.style.display = 'none';
                    if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
                    
                    // Scroll suave hacia arriba
                    setTimeout(() => {
                        if (allDisplayedCards[initialReviewsCount - 1]) {
                            allDisplayedCards[initialReviewsCount - 1].scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'nearest' 
                            });
                        }
                    }, 100);
                }
            });
        }
    }

    // Hero Slider
    function initHeroSlider() {
        const heroImages = utils.getElements('.hero-image');
        if (heroImages.length === 0) return;

        let currentIndex = 0;
        const totalImages = heroImages.length;
        let isPaused = false;

        function showImage(index) {
            heroImages.forEach((img, i) => {
                img.style.opacity = i === index ? '1' : '0';
            });
        }

        function nextImage() {
            if (!isPaused) {
                currentIndex = (currentIndex + 1) % totalImages;
                showImage(currentIndex);
            }
        }

        // Cambiar imagen cada 5 segundos
        setInterval(nextImage, 5000);

        // Pausar cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            isPaused = document.hidden;
        });
    }

    // Menú móvil
    function initMobileMenu() {
        const menuToggle = utils.getElement('.menu-toggle');
        const navMenu = utils.getElement('.nav-menu');
        
        if (!menuToggle || !navMenu) return;

        // Función para bloquear/desbloquear el scroll
        const toggleBodyScroll = (block) => {
            if (block) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            const willBeOpen = !isExpanded;
            
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', willBeOpen);
            
            // Bloquear scroll cuando el menú está abierto
            toggleBodyScroll(willBeOpen);
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = utils.getElements('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                // Desbloquear scroll cuando se cierra el menú
                toggleBodyScroll(false);
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            const isMenuOpen = navMenu.classList.contains('active');
            const isClickInsideMenu = navMenu.contains(e.target);
            const isClickOnToggle = menuToggle.contains(e.target);
            
            if (isMenuOpen && !isClickInsideMenu && !isClickOnToggle) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                // Desbloquear scroll cuando se cierra el menú
                toggleBodyScroll(false);
            }
        });
    }

    // Header scroll
    function initHeaderScroll() {
        const header = utils.getElement('.header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > scrollThreshold) {
                if (currentScroll > lastScroll) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        });
    }

    // Smooth scroll
    function initSmoothScroll() {
        const links = utils.getElements('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = utils.getElement(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Filtro de servicios (Caballeros/Damas)
    function initServicesFilter() {
        const filterButtons = utils.getElements('.filter-btn');
        const serviceCards = utils.getElements('.servicio-card');
        
        if (filterButtons.length === 0 || serviceCards.length === 0) {
            return;
        }

        // Por defecto, mostrar solo servicios de caballeros
        filterServices('caballeros');

        // Agregar event listeners a los botones de filtro
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                
                if (filter) {
                    // Remover clase active de todos los botones
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    // Agregar clase active al botón clickeado
                    button.classList.add('active');
                    // Filtrar servicios
                    filterServices(filter);
                }
            });
        });

        // Manejar botones "Ver más" de servicios de damas
        initDamasServices();
    }

    // Inicializar servicios de damas (solo click en botón)
    function initDamasServices() {
        const verMasButtons = utils.getElements('.btn-ver-mas');

        // Event listeners SOLO para botones "Reservar" - no en toda la tarjeta
        verMasButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const service = button.getAttribute('data-service');
                if (service) {
                    // Abrir modal de reserva con el servicio seleccionado
                    openBookingModal(service);
                }
            });
        });
    }

    // Función para abrir modal de reserva (debe estar disponible globalmente o importada)
    function openBookingModal(service) {
        // Verificar si existe la función en booking-backend.js
        if (typeof window.openBookingModal === 'function') {
            window.openBookingModal(service);
        } else {
            // Fallback: buscar el botón de reservar correspondiente
            const reservarButton = utils.getElement(`button[data-service="${service}"]`);
            if (reservarButton) {
                reservarButton.click();
            }
        }
    }

    // Función para filtrar servicios
    function filterServices(category) {
        const serviceCards = utils.getElements('.servicio-card');
        
        serviceCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (cardCategory === category) {
                card.style.display = '';
                // Animación suave
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 10);
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Iniciar aplicación
    init();
})();
