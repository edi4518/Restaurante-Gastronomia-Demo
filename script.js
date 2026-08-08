/**
 * SABOR & FUEGO — Script Principal
 * Lógica modular para Carrito de Compras (Drawer), Filtrado de Menú, Reservas y WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================== 1. ESTADO DEL CARRITO ====================
    let cart = [];

    // Elementos DOM del Carrito
    const cartDrawerBtn = document.getElementById('cart-drawer-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartDrawerClose = document.getElementById('cart-drawer-close');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const cartDrawerSubtotal = document.getElementById('cart-drawer-subtotal');
    const sendWhatsAppBtn = document.getElementById('send-whatsapp-order-btn');
    const cartGoToMenu = document.getElementById('cart-go-to-menu');

    // ==================== 2. LÓGICA AUXILIAR Y CÁLCULOS ====================

    /**
     * Parsea un string de precio a número (Ej: "$18.500" -> 18500)
     */
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
    }

    /**
     * Formatea un número a string de moneda en ARS (Ej: 18500 -> "$18.500")
     */
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-AR');
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

    // ==================== 3. RENDERIZADO Y ACTUALIZACIÓN DEL DOM ====================

    /**
     * Renderiza los ítems del carrito y actualiza contadores
     */
    function renderCart() {
        const { totalCount, totalPrice } = calculateTotals();

        // Actualizar Badge y Display de Totales
        if (cartBadge) cartBadge.textContent = totalCount;
        if (cartTotalDisplay) cartTotalDisplay.textContent = formatCurrency(totalPrice);
        if (cartDrawerSubtotal) cartDrawerSubtotal.textContent = formatCurrency(totalPrice);

        // Renderizar lista en el Drawer
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div id="cart-empty-state" class="text-center py-12 space-y-3">
                        <div class="w-16 h-16 rounded-full bg-stone-800/80 flex items-center justify-center text-stone-500 mx-auto text-2xl">
                            <i class="fa-solid fa-basket-shopping"></i>
                        </div>
                        <h4 class="text-base font-semibold text-stone-300">Tu carrito está vacío</h4>
                        <p class="text-xs text-stone-500 max-w-xs mx-auto">Explora nuestra Carta Digital y agrega tus platos preferidos para armar tu pedido.</p>
                    </div>
                `;
            } else {
                cartItemsContainer.innerHTML = cart.map((item, index) => `
                    <div class="bg-stone-800/60 border border-stone-700/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                        <div class="flex-grow">
                            <h4 class="text-sm font-bold text-white leading-tight">${item.name}</h4>
                            <p class="text-xs text-amber-400 font-semibold mt-1">${formatCurrency(item.price)} c/u</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-1">
                                <button type="button" data-index="${index}" class="btn-decrease w-6 h-6 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="w-7 text-center text-xs font-bold text-white">${item.quantity}</span>
                                <button type="button" data-index="${index}" class="btn-increase w-6 h-6 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <button type="button" data-index="${index}" class="btn-remove w-8 h-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-colors">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `).join('');

                // Asignar listeners para incrementar, decrementar y eliminar
                cartItemsContainer.querySelectorAll('.btn-increase').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-index'), 10);
                        cart[idx].quantity += 1;
                        renderCart();
                    });
                });

                cartItemsContainer.querySelectorAll('.btn-decrease').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-index'), 10);
                        if (cart[idx].quantity > 1) {
                            cart[idx].quantity -= 1;
                        } else {
                            cart.splice(idx, 1);
                        }
                        renderCart();
                    });
                });

                cartItemsContainer.querySelectorAll('.btn-remove').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-index'), 10);
                        cart.splice(idx, 1);
                        renderCart();
                    });
                });
            }
        }
    }

    /**
     * Muestra un aviso emergente Toast al agregar un plato
     */
    function showToast(dishName, priceStr) {
        const existingToast = document.getElementById('cart-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'fixed bottom-24 left-6 z-50 bg-stone-900/95 border border-amber-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in transition-all duration-300';
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
     * Agrega un plato al carrito o incrementa la cantidad si ya existe
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

        renderCart();
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

    // ==================== 4. CONTROL DEL DRAWER / MODAL DEL CARRITO ====================
    function openCartDrawer() {
        if (cartDrawer) {
            cartDrawer.classList.remove('hidden');
        }
    }

    function closeCartDrawer() {
        if (cartDrawer) {
            cartDrawer.classList.add('hidden');
        }
    }

    if (cartDrawerBtn) cartDrawerBtn.addEventListener('click', openCartDrawer);
    if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
    if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

    // ==================== 5. ENVÍO DEL PEDIDO POR WHATSAPP ====================
    function sendWhatsAppOrder() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío. Agrega algunos platos antes de enviar el pedido por WhatsApp.');
            return;
        }

        const { totalPrice } = calculateTotals();
        let message = "Hola! Quisiera realizar el siguiente pedido en SABOR & FUEGO:\n\n";

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            message += `- ${item.quantity}x ${item.name} ($${subtotal.toLocaleString('es-AR')})\n`;
        });

        message += `\n*Total:* $${totalPrice.toLocaleString('es-AR')}`;

        const waUrl = `https://wa.me/541155559999?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    if (sendWhatsAppBtn) {
        sendWhatsAppBtn.addEventListener('click', sendWhatsAppOrder);
    }

    // ==================== 6. NAVEGACIÓN MOBILE ====================
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

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIconOpen.classList.remove('hidden');
                menuIconClose.classList.add('hidden');
            });
        });
    }

    // ==================== 7. FILTRADO DE MENÚ POR CATEGORÍA ====================
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

    // ==================== 8. FORMULARIO DE RESERVA ====================
    const resForm = document.getElementById('reservation-form');
    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('res-name').value;
            alert(`¡Gracias ${name}! Tu solicitud de reserva ha sido recibida con éxito. Nos pondremos en contacto a la brevedad para confirmar tu mesa.`);
            resForm.reset();
        });
    }

    // Inicializar renderizado del carrito
    renderCart();
});
