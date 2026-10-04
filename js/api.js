// Cliente HTTP hacia el backend Spring Boot
const API_BASE = "http://localhost:8080";

async function request(path, options = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    let data = null;
    const text = await res.text();
    if (text) {
        try { data = JSON.parse(text); } catch (e) { data = text; }
    }

    if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `Error ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

const Api = {
    // Libros
    getLibros: () => request("/libros"),
    getLibro: (id) => request(`/libros/${id}`),
    crearLibro: (libro) => request("/libros", { method: "POST", body: JSON.stringify(libro) }),
    actualizarLibro: (id, libro) => request(`/libros/${id}`, { method: "PUT", body: JSON.stringify(libro) }),
    eliminarLibro: (id) => request(`/libros/${id}`, { method: "DELETE" }),

    // Ejemplares
    getEjemplares: () => request("/ejemplares"),
    getEjemplar: (id) => request(`/ejemplares/${id}`),
    crearEjemplar: (ejemplar) => request("/ejemplares", { method: "POST", body: JSON.stringify(ejemplar) }),
    darDeBaja: (id) => request(`/ejemplares/${id}`, { method: "PATCH" }),
    setDisponible: (id) => request(`/ejemplares/disponible/${id}`, { method: "PATCH" }),

    // Socios
    getSocios: () => request("/socios"),
    getSocio: (id) => request(`/socios/${id}`),
    crearSocio: (socio) => request("/socios", { method: "POST", body: JSON.stringify(socio) }),

    // Préstamos
    getPrestamos: () => request("/prestamos"),
    getPrestamosActivos: () => request("/prestamos/activos"),
    getPrestamosDeSocio: (idSocio) => request(`/prestamos/${idSocio}`),
    realizarPrestamo: (prestamo) => request("/prestamos", { method: "POST", body: JSON.stringify(prestamo) }),
    devolver: (idPrestamo) => request(`/prestamos/${idPrestamo}`, { method: "PATCH" })
};