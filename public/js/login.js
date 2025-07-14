document.addEventListener('DOMContentLoaded', function() {
    // Mostrar usuario si está logueado
    mostrarUsuarioHeader();

    // Login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const contrasena = document.getElementById('loginContrasena').value.trim();
            const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            const idx = clientes.findIndex(c => c.email === email && c.contrasena === contrasena);
            if (idx !== -1) {
                localStorage.setItem('clienteSeleccionado', idx);
                localStorage.setItem('sesionCliente', idx);
                mostrarUsuarioHeader();
                document.getElementById('loginError').textContent = '';
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
                if (modal) modal.hide();
            } else {
                document.getElementById('loginError').textContent = 'Email o contraseña incorrectos.';
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('sesionCliente');
            localStorage.removeItem('clienteSeleccionado');
            mostrarUsuarioHeader();
        });
    }

    // Inicializar contador del carrito
    actualizarContadorCarrito();
});

// Contador de carrito global
function actualizarContadorCarrito() {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    let total = productos.reduce((acc, p) => acc + (p.cantidad || 1), 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = total;
}
actualizarContadorCarrito();
window.addEventListener('storage', function(e) {
    if (e.key === 'productos') actualizarContadorCarrito();
});

// Lógica para botones "Agregar al carrito" en accesorios y laptops
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.agregar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
            const nombre = this.getAttribute('data-nombre');
            const precio = parseFloat(this.getAttribute('data-precio'));
            const foto = this.getAttribute('data-img');
            let productos = JSON.parse(localStorage.getItem('productos')) || [];
            let idx = productos.findIndex(p => p.nombre === nombre);
            if (idx !== -1) {
                productos[idx].cantidad += 1;
            } else {
                productos.push({ nombre, precio, cantidad: 1, foto });
            }
            localStorage.setItem('productos', JSON.stringify(productos));
            this.textContent = "¡Agregado!";
            actualizarContadorCarrito();
            setTimeout(() => this.textContent = "Agregar al carrito", 1000);
        });
    });
    actualizarContadorCarrito();
});

function mostrarUsuarioHeader() {
    const idx = parseInt(localStorage.getItem('sesionCliente'));
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const usuarioHeader = document.getElementById('usuarioHeader');
    const cuentaHeader = document.getElementById('cuentaHeader');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!isNaN(idx) && clientes[idx]) {
        usuarioHeader.textContent = `Hola, ${clientes[idx].nombre}`;
        if (cuentaHeader) cuentaHeader.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';
    } else {
        usuarioHeader.textContent = '';
        if (cuentaHeader) cuentaHeader.style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}
