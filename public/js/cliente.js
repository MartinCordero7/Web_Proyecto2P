document.getElementById('guardarCliente').addEventListener('click', function() {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const apellido = document.getElementById('apellidoCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const ubicacion = document.getElementById('ubicacionCliente').value.trim();
    // fotoBase64 ya está en variable global

    if (editandoClienteIdx !== null) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes[editandoClienteIdx] = { nombre, apellido, telefono, email, ubicacion, foto: fotoBase64 };
        localStorage.setItem('clientes', JSON.stringify(clientes));
        editandoClienteIdx = null;
        this.innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
    } else {
        const cliente = { nombre, apellido, telefono, email, ubicacion, foto: fotoBase64 };
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes.push(cliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    document.getElementById('nombreCliente').value = '';
    document.getElementById('apellidoCliente').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('emailCliente').value = '';
    document.getElementById('ubicacionCliente').value = '';
    fotoBase64 = '';
    document.getElementById('previewFoto').src = '';
    document.getElementById('previewFoto').style.display = 'none';
    mostrarClientes();
});

document.getElementById('eliminarClientes').addEventListener('click', function() {
    localStorage.removeItem('clientes');
    mostrarClientes();
});

let fotoBase64 = '';
let editandoClienteIdx = null;

// Foto: cargar desde archivo
document.getElementById('fotoCliente').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        fotoBase64 = evt.target.result;
        const img = document.getElementById('previewFoto');
        img.src = fotoBase64;
        img.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

// Foto: tomar desde cámara
document.getElementById('tomarFoto').addEventListener('click', function () {
    // Preferir input file con capture, pero si se quiere usar getUserMedia:
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
                fotoBase64 = canvas.toDataURL('image/png');
                document.getElementById('previewFoto').src = fotoBase64;
                document.getElementById('previewFoto').style.display = 'block';
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

// Geolocalización
document.getElementById('obtenerUbicacion').addEventListener('click', function () {
    if (!navigator.geolocation) {
        alert('La geolocalización no está soportada.');
        return;
    }
    document.getElementById('ubicacionCliente').value = 'Obteniendo ubicación...';
    navigator.geolocation.getCurrentPosition(function (pos) {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        document.getElementById('ubicacionCliente').value = `${lat},${lng}`;
    }, function () {
        document.getElementById('ubicacionCliente').value = '';
        alert('No se pudo obtener la ubicación.');
    });
});

function mostrarClientes() {
    const lista = document.getElementById('listaClientes');
    if (!lista) return;
    lista.innerHTML = '';
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const seleccionado = parseInt(localStorage.getItem('clienteSeleccionado'));
    clientes.forEach((cliente, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center flex-wrap py-3';
        if (idx === seleccionado) {
            li.classList.add('active');
        }
        li.innerHTML = `
            <span class="d-flex align-items-center flex-wrap">
                ${cliente.foto ? `<img src="${cliente.foto}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;margin-right:8px;">` : ''}
                <span>
                    <strong>${cliente.nombre} ${cliente.apellido}</strong>
                    <br>
                    <small>Email: ${cliente.email ? cliente.email : 'No definido'} | Tel: ${cliente.telefono} | Ubicación: ${cliente.ubicacion ? cliente.ubicacion : 'No definida'}</small>
                    ${idx === seleccionado ? '<span class="badge bg-info ms-2">Seleccionado</span>' : ''}
                </span>
            </span>
            <div class="btn-group btn-group-sm mt-2 mt-md-0" role="group" aria-label="Acciones cliente">
                <button class="btn btn-outline-primary seleccionar-cliente" data-idx="${idx}" title="Seleccionar">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-warning editar-cliente" data-idx="${idx}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger eliminar-cliente" data-idx="${idx}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(li);
    });

    // Evento seleccionar cliente
    document.querySelectorAll('.seleccionar-cliente').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            localStorage.setItem('clienteSeleccionado', idx);
            mostrarClientes();
            mostrarClienteSeleccionado();
        });
    });

    // Evento editar cliente
    document.querySelectorAll('.editar-cliente').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            cargarClienteEnFormulario(idx);
        });
    });

    // Evento eliminar cliente
    document.querySelectorAll('.eliminar-cliente').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            eliminarCliente(idx);
        });
    });

    mostrarClienteSeleccionado();
}

function cargarClienteEnFormulario(idx) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes[idx];
    if (!cliente) return;
    document.getElementById('nombreCliente').value = cliente.nombre;
    document.getElementById('apellidoCliente').value = cliente.apellido;
    document.getElementById('telefonoCliente').value = cliente.telefono;
    document.getElementById('emailCliente').value = cliente.email || '';
    document.getElementById('ubicacionCliente').value = cliente.ubicacion || '';
    fotoBase64 = cliente.foto || '';
    if (fotoBase64) {
        document.getElementById('previewFoto').src = fotoBase64;
        document.getElementById('previewFoto').style.display = 'block';
    } else {
        document.getElementById('previewFoto').src = '';
        document.getElementById('previewFoto').style.display = 'none';
    }
    editandoClienteIdx = idx;
    document.getElementById('guardarCliente').innerHTML = '<i class="fas fa-edit"></i> Actualizar Cliente';
}

function mostrarClienteSeleccionado() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const seleccionado = parseInt(localStorage.getItem('clienteSeleccionado'));
    const msg = document.getElementById('clienteSeleccionadoMsg');
    if (msg) {
        if (!isNaN(seleccionado) && clientes[seleccionado]) {
            msg.textContent = `Cliente seleccionado para la compra: ${clientes[seleccionado].nombre} ${clientes[seleccionado].apellido}`;
            msg.classList.remove('d-none');
        } else {
            msg.textContent = '';
            msg.classList.add('d-none');
        }
    }
}

function eliminarCliente(idx) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.splice(idx, 1);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    // Si el eliminado era el seleccionado, limpiar selección
    const seleccionado = parseInt(localStorage.getItem('clienteSeleccionado'));
    if (seleccionado === idx) {
        localStorage.removeItem('clienteSeleccionado');
    } else if (seleccionado > idx) {
        // Ajustar índice si era después del eliminado
        localStorage.setItem('clienteSeleccionado', seleccionado - 1);
    }
    // Si se estaba editando este cliente, cancelar edición
    if (editandoClienteIdx === idx) {
        editandoClienteIdx = null;
        document.getElementById('guardarCliente').innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
        document.getElementById('nombreCliente').value = '';
        document.getElementById('apellidoCliente').value = '';
        document.getElementById('telefonoCliente').value = '';
        document.getElementById('direccionCliente').value = '';
    }
    mostrarClientes();
}

// Mostrar clientes al cargar la página
mostrarClientes();
