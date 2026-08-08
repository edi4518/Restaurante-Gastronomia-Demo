/**
 * SABOR & FUEGO — Script Principal
 * Lógica modular para Carrito de Compras, Filtrado de Menú, Reservas y WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================== 1. ESTADO DEL CARRITO ====================
    let cart = [];

    // Contenedores del Carrito en el DOM (Botón Flotante)
    const whatsappBtn = document.querySelector('a[href*="wa.me"]');

    // ==================== 2. LÓGICA DEL CARRITO DE COMPRAS ====================

    /**
     * Parsea un string de precio a número (Ej: "$18.500" -> 18500)
     */
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
    }

    /**
     * Calcula la cantidad total de ítems y el monto total acumulado
     */
    function calculateTotals() {
        return cart.reduce((acc, item) => {
            acc.totalCount += item.quantity;
            acc.totalPrice += item.price * item.quantity;
            return acc;
        }, { totalCount: 0, totalPrice: 0 });
    }

    /**
     * Actualiza los enlaces de WhatsApp con el pedido detallado o la consulta general
     */
    function updateWhatsAppLinks() {
        const { totalCount, totalPrice } = calculateTotals();
        let waUrl = "https://wa.me/541155559999?text=Hola!%20Quiero%20hacer%20una%20consulta";

        if (totalCount > 0) {
            let message = "🔥 *NUEVO PEDIDO EN SABOR & FUEGO* 🔥\n\n";
            cart.forEach((item, index) => {
                message += `${index + 1}. *${item.quantity}x* ${item.name} — $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
            });
            message += `\n💰 *Total del Pedido:* $${totalPrice.toLocaleString('es-AR')}\n`;
            message += "📍 *Dirección de Entrega / Consulta:*";

            waUrl = `https://wa.me/541155559999?text=${encodeURIComponent(message)}`;
        }

        // Actualizar todos los botones de WhatsApp
        const waLinks = document.querySelectorAll('a[href*="wa.me"]');
        waLinks.forEach(link => {
            link.href = waUrl;
        });

        // Actualizar tooltip flotante si existe
        const tooltip = document.querySelector('#cart-tooltip');
        if (tooltip) {
            if (totalCount > 0) {
                tooltip.innerHTML = `<i class="fa-solid fa-cart-shopping text-amber-400 mr-1.5"></i> Pedido (${totalCount}) — $${totalPrice.toLocaleString('es-AR')}`;
            } else {
                tooltip.innerHTML = `<i class="fa-brands fa-whatsapp text-emerald-400 mr-1.5 text-sm"></i> Hacer pedido / Consulta`;
            }
        }
    }

    /**
     * Muestra una notificación emergente (Toast) al agregar un plato
     */
    function showToast(dishName, priceStr) {
        // Remover toast previo si existe
        const existingToast = document.getElementById('cart-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'fixed bottom-24 right-6 z-50 bg-stone-900/95 border border-amber-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in transition-all duration-300';
        toast.innerHTML = `
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-bold">
                <i class="fa-solid fa-check text-sm"></i>
            </div>
            <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-amber-400">Agregado al Pedido</p>
                <p class="text-sm font-bold text-stone-100">${dishName} <span class="text-amber-500">(${priceStr})</span></p>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Agrega un plato al carrito
     */
    function addToCart(dishName, priceStr) {
        const price = parsePrice(priceStr);
        const existingItem = cart.find(item => item.name === dishName);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: dishName,
                price: price,
                quantity: 1
            });
        }

        updateWhatsAppLinks();
        showToast(dishName, priceStr);
    }

    // Escuchar clicks en los botones "Agregar al Pedido"
    const addButtons = document.querySelectorAll('.dish-card button');
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.dish-card');
            if (card) {
                const titleEl = card.querySelector('h3');
                const priceEl = card.querySelector('span.bg-amber-500');
                
                if (titleEl && priceEl) {
                    const name = titleEl.textContent.trim();
                    const priceStr = priceEl.textContent.trim();
                    addToCart(name, priceStr);
                }
            }
        });
    });

    // ==================== 3. NAVEGACIÓN MOBILE ====================
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuIconOpen.classList.add('hidden');
                menuIconClose.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
                menuIconOpen.classList.remove('hidden');
                menuIconClose.classList.add('hidden');
            }
        });

        // Cerrar menú mobile al hacer clic en un enlace
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIconOpen.classList.remove('hidden');
                menuIconClose.classList.add('hidden');
            });
        });
    }

    // ==================== 4. FILTRADO DE MENÚ POR CATEGORÍA ====================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dishCards = document.querySelectorAll('.dish-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-amber-600', 'text-white', 'shadow-lg', 'shadow-amber-950/60', 'ring-2', 'ring-amber-500/50');
                b.classList.add('bg-stone-800/80', 'text-stone-300', 'hover:text-white', 'hover:bg-stone-700/80', 'border', 'border-stone-700/50');
            });

            btn.classList.add('active', 'bg-amber-600', 'text-white', 'shadow-lg', 'shadow-amber-950/60', 'ring-2', 'ring-amber-500/50');
            btn.classList.remove('bg-stone-800/80', 'text-stone-300', 'hover:text-white', 'hover:bg-stone-700/80', 'border', 'border-stone-700/50');

            const filter = btn.getAttribute('data-filter');
            dishCards.forEach(card => {
                if (filter === 'all' || card.classList.contains(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==================== 5. FORMULARIO DE RESERVA ====================
    const resForm = document.getElementById('reservation-form');
    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('res-name').value;
            alert(`¡Gracias ${name}! Tu solicitud de reserva ha sido recibida con éxito. Nos pondremos en contacto a la brevedad para confirmar tu mesa.`);
            resForm.reset();
        });
    }

    // Inicializar links de WhatsApp
    updateWhatsAppLinks();
});
