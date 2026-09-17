// ==========================================================================
// LOGICA DEL MENU RESPONSIVO
// ==========================================================================
const btnMenu = document.getElementById('btn-menu');
const menuLista = document.getElementById('menu-lista');

if (btnMenu && menuLista) {
    btnMenu.addEventListener('click', () => {
        menuLista.classList.toggle('active');
        btnMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuLista.classList.remove('active');
            btnMenu.classList.remove('open');
        });
    });
}

// ==========================================================================
// SISTEMA DEL CARRITO DE COMPRAS CON MULTIVISTAS (WHATSAPP + LOCALSTORAGE)
// ==========================================================================
let carrito = JSON.parse(localStorage.getItem('fresquesito_cart')) || [];
const numeroWhatsApp = "573138254366";

// Elementos de la Interfaz
const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('cart-icon'); 
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountLabel = document.getElementById('cart-count');
const cartSubtotalLabel = document.getElementById('cart-subtotal');
const cartTotalLabel = document.getElementById('cart-total-val'); 
const formTotalLabel = document.getElementById('form-total');
const btnCheckout = document.getElementById('btn-checkout');

// Elementos del Control de Vistas Internas
const viewCart = document.getElementById('view-cart');
const viewCheckoutForm = document.getElementById('view-checkout-form');
const viewSuccess = document.getElementById('view-success');

// Control del Despliegue de la Barra Lateral
if (cartIcon && closeCart && cartSidebar) {
    cartIcon.addEventListener('click', () => {
        goToCartView();
        cartSidebar.classList.add('open');
    });
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));
}

// Escuchar los clicks en los botones de "Comprar"
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const productoCard = e.target.closest('.producto');
        const idBase = productoCard.getAttribute('data-id');
        const titulo = productoCard.querySelector('h3').textContent;
        
        const selector = productoCard.querySelector('.selector-presentacion');
        const opcionSeleccionada = selector.options[selector.selectedIndex];
        const presentacion = opcionSeleccionada.value;
        const precio = parseInt(opcionSeleccionada.getAttribute('data-precio'));

        const idUnico = `${idBase}-${presentacion}`;
        const nombreCompleto = `${titulo} (${presentacion})`;

        goToCartView();
        agregarAlCarrito(idUnico, nombreCompleto, precio);
        
        if (cartSidebar) cartSidebar.classList.add('open');
    });
});

function agregarAlCarrito(id, nombre, precio) {
    const itemExistente = carrito.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarInterfazCarrito();
}

window.cambiarCantidad = function(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }
    }
    actualizarInterfazCarrito();
}

window.eliminarDelCarrito = function(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    if (!cartItemsContainer) return;
    
    localStorage.setItem('fresquesito_cart', JSON.stringify(carrito));
    
    cartItemsContainer.innerHTML = '';
    let totalElementos = 0;
    let precioTotal = 0;

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#777; margin-top:20px;">Tu carrito está vacío.</p>';
        
        if (btnCheckout) {
            btnCheckout.disabled = true;
            btnCheckout.style.backgroundColor = '#6c757d';
            btnCheckout.style.cursor = 'not-allowed';
        }
    } else {
        if (btnCheckout) {
            btnCheckout.disabled = false;
            btnCheckout.style.backgroundColor = 'var(--medium-green)';
            btnCheckout.style.cursor = 'pointer';
        }

        carrito.forEach(item => {
            totalElementos += item.cantidad;
            precioTotal += (item.precio * item.cantidad);

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="item-details">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toLocaleString()} c/u</p>
                    <div class="item-qty-controls">
                        <button class="btn-qty" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-qty" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-weight:bold; display:block; margin-bottom:5px;">$${(item.precio * item.cantidad).toLocaleString()}</span>
                    <button class="btn-remove" onclick="eliminarDelCarrito('${item.id}')">❌</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    if (cartCountLabel) cartCountLabel.textContent = totalElementos;
    if (cartSubtotalLabel) cartSubtotalLabel.textContent = `$${precioTotal.toLocaleString()}`;
    if (cartTotalLabel) cartTotalLabel.textContent = `$${precioTotal.toLocaleString()}`;
    if (formTotalLabel) formTotalLabel.textContent = `$${precioTotal.toLocaleString()}`;
}

// NAVEGACIÓN DE VISTAS 
window.goToCheckoutForm = function() {
    if (carrito.length === 0) return;
    if (viewCart) viewCart.style.display = 'none';
    if (viewCheckoutForm) viewCheckoutForm.style.display = 'flex';
    if (viewSuccess) viewSuccess.style.display = 'none';
}

window.goToCartView = function() {
    if (viewCheckoutForm) viewCheckoutForm.style.display = 'none';
    if (viewSuccess) viewSuccess.style.display = 'none';
    if (viewCart) viewCart.style.display = 'flex';
}

// PROCESAR PEDIDO Y REDIRECCIÓN EN SEGUNDO PLANO
window.processFinalOrder = function(event) {
    event.preventDefault(); 

    const nombre = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const telefono = document.getElementById('cust-phone').value;
    const direccion = document.getElementById('cust-address').value;
    const ciudad = document.getElementById('cust-city').value;

    let mensaje = `¡Hola FresQuesito! 🧀 He realizado un pedido desde la página web.\n\n`;
    mensaje += `*Datos de Envío:*\n`;
    mensaje += `• *Nombre:* ${nombre}\n`;
    mensaje += `• *Email:* ${email}\n`;
    mensaje += `• *Teléfono:* ${telefono}\n`;
    mensaje += `• *Dirección:* ${direccion}\n`;
    mensaje += `• *Ciudad:* ${ciudad}\n\n`;
    mensaje += `*Pedido:*\n`;

    let precioTotal = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        precioTotal += subtotal;
        mensaje += `• _${item.nombre}_ x${item.cantidad} - $${subtotal.toLocaleString()}\n`;
    });

    mensaje += `\n*Total Neto a Pagar:* $${precioTotal.toLocaleString()}\n\n`;
    mensaje += "Quedo atento a la confirmación de la entrega. ¡Muchas gracias!";

    
    // Cambia de inmediato a la vista de éxito idéntica a tu ejemplo
    if (viewCheckoutForm) viewCheckoutForm.style.display = 'none';
    if (viewSuccess) viewSuccess.style.display = 'flex';

    // Limpieza interna del estado del carrito
    carrito = [];
    document.getElementById('shipping-form').reset();
    actualizarInterfazCarrito();
}

window.resetToStore = function() {
    goToCartView();
    if (cartSidebar) cartSidebar.classList.remove('open');
}

// Inicialización de la Interfaz al cargar la página
actualizarInterfazCarrito();