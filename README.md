# Biblioteca Barrial — Frontend

Interfaz web para la gestión de una biblioteca barrial. Consume la API REST del [backend](https://github.com/candela06/BibliotecaBarrial-backend) para administrar libros, ejemplares, socios y préstamos.

---

## Descripción

Aplicación web liviana, construida en **HTML, CSS y JavaScript vanilla**, sin frameworks ni build step. Está pensada para que el personal de la biblioteca pueda operar el sistema desde el navegador con una interfaz simple, clara y de estética retro.

El diseño es de **dos columnas**: un menú fijo a la izquierda con las secciones (Libros, Ejemplares, Socios, Préstamos) y el contenido dinámico a la derecha.

---

## Stack tecnológico

- **HTML5**
- **CSS3** (estilo retro, sin frameworks)
- **JavaScript vanilla** (fetch API)

---

## Estructura del proyecto

```
frontend/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── api.js      # Cliente HTTP hacia el backend
    ├── ui.js       # Helpers de render y feedback
    └── app.js      # Vistas y navegación
```

---

## Cómo ejecutarlo

1. Cloná el repositorio.
2. Levantá el backend en `http://localhost:8080`.
3. Abrí `index.html` con **Live Server** (o cualquier servidor estático).

La URL base de la API se configura en `js/api.js`:

```js
const API_BASE = "http://localhost:8080";
```

---

## Funcionalidades

### Libros
- Listar el catálogo completo.
- Registrar libros con título, autor e ISBN.
- Editar cualquier campo de un libro existente.

### Ejemplares
- Listar todos los ejemplares con su estado (`DISPONIBLE`, `PRESTADO`, `BAJA`).
- Registrar ejemplares asociados a un libro existente.
- Dar de baja un ejemplar.
- Reactivar un ejemplar dado de baja.

### Socios
- Listar todos los socios.
- Registrar socios con nombre y email.
- Ver el historial de préstamos de cada socio.

### Préstamos
- Realizar préstamos indicando socio y ejemplar.
- Devolver ejemplares.
- Ver todos los préstamos con filtro por activos.
- Ver los préstamos activos de un socio.

---

## Repos relacionados

- **Backend**:[biblioteca-barrial-backend](https://github.com/candela06/BibliotecaBarrial-backend)

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](./LICENSE) para más detalles.

---