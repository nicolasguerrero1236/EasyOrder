// Configuración del sistema
const CONFIG = {
    WHATSAPP_NUMBER: '543518697090',
    NEGOCIO: 'Bros Burger y Lomos'
};

// Clase para gestionar el carrito
class Carrito {
    constructor() {
        this.items = this.cargarDelStorage();
    }

    cargarDelStorage() {
        const datos = localStorage.getItem('carrito');
        return datos ? JSON.parse(datos) : [];
    }

    guardarEnStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarContador();
    }

    agregar(producto) {
        const itemExistente = this.items.find(item => item.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad += producto.cantidad || 1;
        } else {
            this.items.push({
                ...producto,
                cantidad: producto.cantidad || 1
            });
        }

        this.guardarEnStorage();
        return true;
    }

    actualizar(id, cantidad) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (cantidad <= 0) {
                this.eliminar(id);
            } else {
                item.cantidad = cantidad;
                this.guardarEnStorage();
            }
        }
    }

    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardarEnStorage();
    }

    vaciar() {
        this.items = [];
        this.guardarEnStorage();
    }

    obtener() {
        return this.items;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    actualizarContador() {
        const contadores = document.querySelectorAll('#contador-carrito');
        const total = this.getTotalItems();
        contadores.forEach(contador => {
            contador.textContent = total;
        });
    }
}

// Instancia global del carrito
const carrito = new Carrito();

// Actualizar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    carrito.actualizarContador();
});

// Función para agregar producto al carrito
function agregarAlCarrito(producto) {
    carrito.agregar(producto);
    mostrarAlerta('✓ Producto agregado al carrito', 'exito');
}

// Mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(alerta, container.firstChild);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

// Generar mensaje de WhatsApp
function generarMensajeWhatsApp(cliente) {
    let mensaje = `Hola, soy *${cliente.nombre}*\n\n`;
    mensaje += `📱 Teléfono: ${cliente.telefono}\n`;
    if (cliente.email) mensaje += `📧 Email: ${cliente.email}\n`;
    if (cliente.direccion) mensaje += `🏠 Dirección: ${cliente.direccion}\n`;
    mensaje += `🚚 Modalidad: ${cliente.delivery ? 'Delivery (+$500)' : 'Retiro en local'}\n`;
    if (cliente.notas) mensaje += `📝 Notas: ${cliente.notas}\n`;
    mensaje += `\n*PEDIDO:*\n`;
    mensaje += `${'='.repeat(40)}\n`;

    carrito.obtener().forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre} x${item.cantidad}\n`;
        mensaje += `   Precio: $${(item.precio * item.cantidad).toFixed(2)}\n`;
    });

    mensaje += `${'='.repeat(40)}\n`;
    const subtotal = carrito.getTotal();
    const delivery = cliente.delivery ? 500 : 0;
    const total = subtotal + delivery;
    
    if (delivery > 0) {
        mensaje += `Subtotal: $${subtotal.toFixed(2)}\n`;
        mensaje += `Delivery: $${delivery.toFixed(2)}\n`;
        mensaje += `${'='.repeat(40)}\n`;
    }
    mensaje += `*TOTAL: $${total.toFixed(2)}*\n`;
    mensaje += `\n¡Gracias por tu pedido en ${CONFIG.NEGOCIO}!`;

    return encodeURIComponent(mensaje);
}

// Redirigir a WhatsApp
function enviarPorWhatsApp(cliente) {
    const mensaje = generarMensajeWhatsApp(cliente);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensaje}`;
    window.open(url, '_blank');
}
