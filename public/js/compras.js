//carrito de commpras en linea, productos agregar productos agragados al arreglo usando loclstorage

let editandoProductoIdx = null;
let fotoProductoBase64 = '';

// --- Foto: cargar desde archivo ---
const inputFotoProducto = document.getElementById('fotoProducto');
if (inputFotoProducto) {
    inputFotoProducto.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            fotoProductoBase64 = evt.target.result;
            const img = document.getElementById('previewFotoProducto');
            if (img) {
                img.src = fotoProductoBase64;
                img.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    });
}

// --- Foto: tomar desde cámara ---
const btnTomarFotoProducto = document.getElementById('tomarFotoProducto');
if (btnTomarFotoProducto) {
    btnTomarFotoProducto.addEventListener('click', function () {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const video = document.createElement('video');
            video.autoplay = true;
            video.style.width = '100%';
            video.style.maxWidth = '200px';
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.7)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = 9999;
            const btn = document.createElement('button');
            btn.textContent = 'Capturar';
            btn.className = 'btn btn-success mt-2';
            const cont = document.createElement('div');
            cont.appendChild(video);
            cont.appendChild(btn);
            modal.appendChild(cont);
            document.body.appendChild(modal);

            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                video.srcObject = stream;
                btn.onclick = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    fotoProductoBase64 = canvas.toDataURL('image/png');
                    const img = document.getElementById('previewFotoProducto');
                    if (img) {
                        img.src = fotoProductoBase64;
                        img.style.display = 'block';
                    }
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(modal);
                };
            }).catch(() => {
                alert('No se pudo acceder a la cámara.');
                document.body.removeChild(modal);
            });
            // Cerrar modal al hacer click fuera
            modal.onclick = function (e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
        } else {
            alert('Tu navegador no soporta acceso a la cámara.');
        }
    });
}

function mostrarProductos() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    productos.forEach((producto, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                ${producto.foto ? `<img src="${producto.foto}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;margin-right:8px;">` : ''}
                ${producto.nombre}
            </td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2 editar-producto" data-idx="${idx}">Editar</button>
                <button class="btn btn-sm btn-danger eliminar-producto" data-idx="${idx}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Asignar eventos a los botones eliminar
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            eliminarProducto(idx);
        });
    });

    // Asignar eventos a los botones editar
    document.querySelectorAll('.editar-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            cargarProductoEnFormulario(idx);
        });
    });
}

function eliminarProducto(idx) {
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos.splice(idx, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    // Si se estaba editando este producto, cancelar edición
    if (editandoProductoIdx === idx) {
        editandoProductoIdx = null;
        form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Agregar';
        form.reset();
    }
    mostrarProductos();
}

// No borrar productos automáticamente
// localStorage.removeItem("productos");

function agregarProducto(nombre, precio, cantidad) {
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let producto = {
        nombre: nombre,
        precio: precio,
        cantidad: cantidad,
        foto: fotoProductoBase64
    };
    productos.push(producto);
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarProductos();
}

function cargarProductoEnFormulario(idx) {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const producto = productos[idx];
    if (!producto) return;
    document.getElementById("nombreProducto").value = producto.nombre;
    document.getElementById("precioProducto").value = producto.precio;
    document.getElementById("cantidadProducto").value = producto.cantidad;
    fotoProductoBase64 = producto.foto || '';
    const img = document.getElementById('previewFotoProducto');
    if (img) {
        if (fotoProductoBase64) {
            img.src = fotoProductoBase64;
            img.style.display = 'block';
        } else {
            img.src = '';
            img.style.display = 'none';
        }
    }
    editandoProductoIdx = idx;
    form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-edit"></i> Actualizar';
}

// Manejar el formulario de agregar/actualizar producto
const form = document.getElementById("formAgregarProducto");
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nombre = document.getElementById("nombreProducto").value.trim();
        const precio = parseFloat(document.getElementById("precioProducto").value);
        const cantidad = parseInt(document.getElementById("cantidadProducto").value);
        if (nombre && precio > 0 && cantidad > 0) {
            if (editandoProductoIdx !== null) {
                // Actualizar producto existente
                let productos = JSON.parse(localStorage.getItem("productos")) || [];
                productos[editandoProductoIdx] = { nombre, precio, cantidad, foto: fotoProductoBase64 };
                localStorage.setItem("productos", JSON.stringify(productos));
                editandoProductoIdx = null;
                form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Agregar';
            } else {
                agregarProducto(nombre, precio, cantidad);
            }
            form.reset();
            fotoProductoBase64 = '';
            const img = document.getElementById('previewFotoProducto');
            if (img) {
                img.src = '';
                img.style.display = 'none';
            }
            mostrarProductos();
        }
    });
}

// Botón eliminar todos los productos
const btnEliminarProductos = document.getElementById('eliminarProductos');
if (btnEliminarProductos) {
    btnEliminarProductos.addEventListener('click', function() {
        localStorage.removeItem('productos');
        mostrarProductos();
    });
}

// Mostrar productos al cargar la página
mostrarProductos();