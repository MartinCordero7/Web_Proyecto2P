const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let seleccionado = parseInt(localStorage.getItem('clienteSeleccionado'));
if (isNaN(seleccionado)) {
    // Si hay sesión, seleccionar automáticamente el cliente logueado
    const sesion = parseInt(localStorage.getItem('sesionCliente'));
    if (!isNaN(sesion)) {
        seleccionado = sesion;
        localStorage.setItem('clienteSeleccionado', sesion);
    }
}
const cliente = (!isNaN(seleccionado) && clientes[seleccionado]) ? clientes[seleccionado] : null;
const datosCliente = document.getElementById('datosCliente');
if (cliente && datosCliente) {
    datosCliente.innerHTML = `
        <strong>Cliente:</strong> ${cliente.nombre} ${cliente.apellido}<br>
        <strong>Teléfono:</strong> ${cliente.telefono}<br>
        <strong>Dirección:</strong> ${cliente.ubicacion || ''}
    `;
} else if (datosCliente) {
    datosCliente.innerHTML = `<span class="text-danger">No hay cliente seleccionado.</span>`;
}

const productos = JSON.parse(localStorage.getItem('productos')) || [];
const tbody = document.getElementById('tablaFactura');
let subtotal = 0;
productos.forEach(producto => {
    const sub = producto.precio * producto.cantidad;
    subtotal += sub;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>${producto.cantidad}</td>
        <td>${sub}</td>
    `;
    tbody.appendChild(tr);
});
const iva = subtotal * 0.15;
const total = subtotal + iva;

// Mostrar los valores en la tabla
document.getElementById('subtotalFactura').textContent = subtotal.toFixed(2);
document.getElementById('ivaFactura').textContent = iva.toFixed(2);
document.getElementById('totalFactura').textContent = total.toFixed(2);

// Notificación API y botón Enviar Factura
const btnEnviarFactura = document.getElementById('enviarFactura');
const notificacionDiv = document.getElementById('notificacionFactura');

function mostrarNotificacion(mensaje) {
    // Notification API
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification(mensaje);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permiso => {
                if (permiso === "granted") {
                    new Notification(mensaje);
                } else {
                    if (notificacionDiv) {
                        notificacionDiv.innerHTML = `<div class="alert alert-info">${mensaje}</div>`;
                    }
                }
            });
        } else {
            if (notificacionDiv) {
                notificacionDiv.innerHTML = `<div class="alert alert-info">${mensaje}</div>`;
            }
        }
    } else {
        if (notificacionDiv) {
            notificacionDiv.innerHTML = `<div class="alert alert-info">${mensaje}</div>`;
        }
    }
}

if (btnEnviarFactura) {
    btnEnviarFactura.addEventListener('click', function() {
        mostrarNotificacion('¡Factura enviada correctamente!');
        // Vaciar carrito para nueva compra
        localStorage.removeItem('productos');
    });
}
