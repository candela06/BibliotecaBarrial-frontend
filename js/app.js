// Vistas de la aplicación
const Views = {

    // ---------- LIBROS ----------
    async libros() {
        renderLoading();
        const libros = await Api.getLibros();

        let rows = libros.map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${escapeHtml(l.titulo)}</td>
                <td>${escapeHtml(l.autor)}</td>
                <td>${escapeHtml(l.isbn)}</td>
                <td>
                    <button class="small" onclick="Views.editarLibro(${l.id})">Editar</button>
                </td>
            </tr>`).join("");

        if (!rows) rows = `<tr><td colspan="5" class="empty">Sin libros registrados</td></tr>`;

        $("#view-container").innerHTML = `
            <h2 class="view-title">Libros</h2>

            <fieldset>
                <legend>Registrar libro</legend>
                <form id="form-libro" onsubmit="Views.crearLibro(event)">
                    <label>Título:</label>
                    <input type="text" id="lib-titulo" required>
                    <label>Autor:</label>
                    <input type="text" id="lib-autor" required>
                    <label>ISBN (13 díg.):</label>
                    <input type="text" id="lib-isbn" required pattern="[0-9-]{10,17}">
                    <br>
                    <button type="submit">Registrar</button>
                </form>
                <div id="libro-msg"></div>
            </fieldset>

            <table>
                <thead>
                    <tr><th>ID</th><th>Título</th><th>Autor</th><th>ISBN</th><th>Acciones</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        setStatus("Libros cargados.", "ok");
    },

    async crearLibro(e) {
        e.preventDefault();
        const msg = $("#libro-msg");
        msg.textContent = "";
        try {
            await Api.crearLibro({
                titulo: $("#lib-titulo").value.trim(),
                autor: $("#lib-autor").value.trim(),
                isbn: $("#lib-isbn").value.trim()
            });
            setStatus("Libro registrado.", "ok");
            Views.libros();
        } catch (err) {
            msg.className = "msg-error";
            msg.textContent = "⚠ " + err.message;
            setStatus(err.message, "error");
        }
    },

    async editarLibro(id) {
    renderLoading();
    try {
        const libro = await Api.getLibro(id);

        $("#view-container").innerHTML = `
            <h2 class="view-title">Editar libro #${libro.id}</h2>

            <fieldset>
                <legend>Datos del libro</legend>
                <form onsubmit="Views.guardarLibro(event, ${libro.id})">
                    <label>Título:</label>
                    <input type="text" id="ed-titulo" value="${escapeHtml(libro.titulo)}" required><br>

                    <label>Autor:</label>
                    <input type="text" id="ed-autor" value="${escapeHtml(libro.autor)}" required><br>

                    <label>ISBN:</label>
                    <input type="text" id="ed-isbn" value="${escapeHtml(libro.isbn)}" required><br>

                    <button type="submit">Guardar cambios</button>
                    <button type="button" onclick="Views.libros()">Cancelar</button>
                </form>
                <div id="ed-msg"></div>
            </fieldset>
        `;
        setStatus("Editando libro.", "ok");
    } catch (err) {
        renderError(err);
    }
},

    async guardarLibro(e, id) {
        e.preventDefault();
        const msg = $("#ed-msg");
        msg.textContent = "";

        const titulo = $("#ed-titulo").value.trim();
        const autor  = $("#ed-autor").value.trim();
        const isbn   = $("#ed-isbn").value.trim();

        // Validación en el cliente (el backend también valida)
        if (!titulo || !autor || !isbn) {
            msg.className = "msg-error";
            msg.textContent = "⚠ Ningún campo puede quedar vacío.";
            return;
        }

        try {
            await Api.actualizarLibro(id, { titulo, autor, isbn });
            setStatus("Libro actualizado.", "ok");
            Views.libros();
        } catch (err) {
            msg.className = "msg-error";
            msg.textContent = "⚠ " + err.message;
            setStatus(err.message, "error");
        }
    },

    async eliminarLibro(id) {
        if (!confirm(`¿Eliminar libro #${id}?`)) return;
        try {
            await Api.eliminarLibro(id);
            setStatus("Libro eliminado.", "ok");
            Views.libros();
        } catch (err) {
            setStatus(err.message, "error");
        }
    },

    // ---------- EJEMPLARES ----------
    async ejemplares() {
        renderLoading();
        const [ejemplares, libros] = await Promise.all([Api.getEjemplares(), Api.getLibros()]);

        const opciones = libros.map(l =>
            `<option value="${l.id}">#${l.id} - ${escapeHtml(l.titulo)}</option>`).join("");

        let rows = ejemplares.map(e => `
            <tr>
                <td>${e.id}</td>
                <td>${e.libro ? `#${e.libro.id} ${escapeHtml(e.libro.titulo)}` : "-"}</td>
                <td>${estadoBadge(e.estado)}</td>
                <td>
                    ${e.estado !== "BAJA"
                        ? `<button class="small" onclick="Views.bajaEjemplar(${e.id})">Dar de baja</button>`
                        : `<button class="small" onclick="Views.reactivarEjemplar(${e.id})">Disponible</button>`}
                </td>
            </tr>`).join("");

        if (!rows) rows = `<tr><td colspan="4" class="empty">Sin ejemplares</td></tr>`;

        $("#view-container").innerHTML = `
            <h2 class="view-title">Ejemplares</h2>

            <fieldset>
                <legend>Registrar ejemplar</legend>
                <form onsubmit="Views.crearEjemplar(event)">
                    <label>Libro:</label>
                    <select id="ej-libro" required>${opciones}</select>
                    <label>Estado:</label>
                    <select id="ej-estado">
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="PRESTADO">PRESTADO</option>
                    </select>
                    <br>
                    <button type="submit">Registrar</button>
                </form>
                <div id="ej-msg"></div>
            </fieldset>

            <table>
                <thead>
                    <tr><th>ID</th><th>Libro</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        setStatus("Ejemplares cargados.", "ok");
    },

    async crearEjemplar(e) {
        e.preventDefault();
        const msg = $("#ej-msg");
        msg.textContent = "";
        try {
            await Api.crearEjemplar({
                libro: { id: Number($("#ej-libro").value) },
                estado: $("#ej-estado").value
            });
            setStatus("Ejemplar registrado.", "ok");
            Views.ejemplares();
        } catch (err) {
            msg.className = "msg-error";
            msg.textContent = "⚠ " + err.message;
            setStatus(err.message, "error");
        }
    },

    async bajaEjemplar(id) {
        try {
            await Api.darDeBaja(id);
            setStatus("Ejemplar dado de baja.", "ok");
            Views.ejemplares();
        } catch (err) {
            setStatus(err.message, "error");
        }
    },

    async reactivarEjemplar(id) {
        try {
            await Api.setDisponible(id);
            setStatus("Ejemplar disponible nuevamente.", "ok");
            Views.ejemplares();
        } catch (err) {
            setStatus(err.message, "error");
        }
    },

    // ---------- SOCIOS ----------
    async socios() {
        renderLoading();
        const socios = await Api.getSocios();

        let rows = socios.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHtml(s.nombre)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td><button class="small" onclick="Views.verSocio(${s.id})">Ver historial</button></td>
            </tr>`).join("");

        if (!rows) rows = `<tr><td colspan="4" class="empty">Sin socios</td></tr>`;

        $("#view-container").innerHTML = `
            <h2 class="view-title">Socios</h2>

            <fieldset>
                <legend>Registrar socio</legend>
                <form onsubmit="Views.crearSocio(event)">
                    <label>Nombre:</label>
                    <input type="text" id="so-nombre" required>
                    <label>Email:</label>
                    <input type="email" id="so-email" required>
                    <br>
                    <button type="submit">Registrar</button>
                </form>
                <div id="so-msg"></div>
            </fieldset>

            <table>
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Historial de Prestamos</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        setStatus("Socios cargados.", "ok");
    },

    async crearSocio(e) {
        e.preventDefault();
        const msg = $("#so-msg");
        msg.textContent = "";
        try {
            await Api.crearSocio({
                nombre: $("#so-nombre").value.trim(),
                email: $("#so-email").value.trim()
            });
            setStatus("Socio registrado.", "ok");
            Views.socios();
        } catch (err) {
            msg.className = "msg-error";
            msg.textContent = "⚠ " + err.message;
            setStatus(err.message, "error");
        }
    },

    async verSocio(id) {
        try {
            const [socio, prestamos] = await Promise.all([
                Api.getSocio(id),
                Api.getPrestamosDeSocio(id)
            ]);

            let rows = prestamos.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.ejemplar ? `#${p.ejemplar.id} ${escapeHtml(p.ejemplar.libro?.titulo || "")}` : "-"}</td>
                    <td>${p.fechaPrestamo || "-"}</td>
                    <td>${p.fechaLimite || "-"}</td>
                </tr>`).join("");
            if (!rows) rows = `<tr><td colspan="4" class="empty">Sin préstamos activos</td></tr>`;

            $("#view-container").innerHTML = `
                <h2 class="view-title">Socio #${socio.id}</h2>
                <p><b>Nombre:</b> ${escapeHtml(socio.nombre)}</p>
                <p><b>Email:</b> ${escapeHtml(socio.email)}</p>
                <h3 style="margin-top:12px;">Préstamos activos</h3>
                <table>
                    <thead><tr><th>ID</th><th>Ejemplar</th><th>Prestado</th><th>Límite</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <button onclick="Views.socios()">← Volver</button>
            `;
        } catch (err) {
            renderError(err);
        }
    },

    // ---------- PRÉSTAMOS ----------
    async prestamos() {
    renderLoading();
    const [todos, activos, socios, ejemplares] = await Promise.all([
        Api.getPrestamos(),
        Api.getPrestamosActivos(),
        Api.getSocios(),
        Api.getEjemplares()
    ]);

    Views._prestamosData = { todos, activos };

    const sociosOpt = socios.map(s =>
        `<option value="${s.id}">#${s.id} - ${escapeHtml(s.nombre)}</option>`).join("");

    const disponibles = ejemplares.filter(e => e.estado === "DISPONIBLE");
    const ejemplaresOpt = disponibles.map(e =>
        `<option value="${e.id}">#${e.id} - ${escapeHtml(e.libro?.titulo || "")}</option>`).join("");

    $("#view-container").innerHTML = `
        <h2 class="view-title">Préstamos</h2>

        <fieldset>
            <legend>Nuevo préstamo</legend>
            <form onsubmit="Views.realizarPrestamo(event)">
                <label>Socio:</label>
                <select id="pr-socio" required>${sociosOpt}</select><br>
                <label>Ejemplar:</label>
                <select id="pr-ejemplar" required>${ejemplaresOpt}</select><br>
                <button type="submit">Realizar préstamo</button>
            </form>
            <div id="pr-msg"></div>
        </fieldset>

        <fieldset>
            <legend>Filtro</legend>
            <label>Mostrar:</label>
            <select id="pr-filtro" onchange="Views.filtrarPrestamos()">
                <option value="todos">Todos</option>
                <option value="activos">Solo activos</option>
            </select>
        </fieldset>

        <h3 id="pr-titulo">Todos los préstamos</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Socio</th><th>Ejemplar</th>
                    <th>Prestado</th><th>Límite</th><th>Devuelto</th><th></th>
                </tr>
            </thead>
            <tbody id="pr-tabla"></tbody>
        </table>
    `;

    Views.filtrarPrestamos();
    setStatus("Préstamos cargados.", "ok");
},

filtrarPrestamos() {
    const filtro = $("#pr-filtro").value;
    const lista = filtro === "activos"
        ? Views._prestamosData.activos
        : Views._prestamosData.todos;

    $("#pr-titulo").textContent =
        filtro === "activos" ? "Préstamos activos" : "Todos los préstamos";

    let rows = lista.map(p => {
        const activo = !p.fechaDevolucion;
        return `
            <tr>
                <td>${p.id}</td>
                <td>${p.socio ? `#${p.socio.id} ${escapeHtml(p.socio.nombre)}` : "-"}</td>
                <td>${p.ejemplar ? `#${p.ejemplar.id} ${escapeHtml(p.ejemplar.libro?.titulo || "")}` : "-"}</td>
                <td>${p.fechaPrestamo || "-"}</td>
                <td>${p.fechaLimite || "-"}</td>
                <td>${p.fechaDevolucion || "-"}</td>
                <td>
                    ${activo
                        ? `<button class="small" onclick="Views.devolver(${p.id})">Devolver</button>`
                        : `<span class="badge DISPONIBLE">Devuelto</span>`}
                </td>
            </tr>`;
    }).join("");

    if (!rows) rows = `<tr><td colspan="7" class="empty">Sin préstamos</td></tr>`;

    $("#pr-tabla").innerHTML = rows;
},

    async realizarPrestamo(e) {
        e.preventDefault();
        const msg = $("#pr-msg");
        msg.textContent = "";
        try {
            await Api.realizarPrestamo({
                socio: { id: Number($("#pr-socio").value) },
                ejemplar: { id: Number($("#pr-ejemplar").value) }
            });
            setStatus("Préstamo registrado.", "ok");
            Views.prestamos();
        } catch (err) {
            msg.className = "msg-error";
            msg.textContent = "⚠ " + err.message;
            setStatus(err.message, "error");
        }
    },

    async devolver(id) {
        if (!confirm(`¿Devolver préstamo #${id}?`)) return;
        try {
            await Api.devolver(id);
            setStatus("Devolución registrada.", "ok");
            Views.prestamos();
        } catch (err) {
            setStatus(err.message, "error");
        }
    }
};

// ---------- Navegación ----------
function navigate(view) {
    document.querySelectorAll("#menu li").forEach(li =>
        li.classList.toggle("active", li.dataset.view === view));

    const fn = Views[view];
    if (!fn) return;

    Promise.resolve()
        .then(() => fn())
        .catch(renderError);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#menu li").forEach(li => {
        li.addEventListener("click", () => navigate(li.dataset.view));
    });
    navigate("libros");
});