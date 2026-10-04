// Helpers de render y feedback
const $ = (sel, root = document) => root.querySelector(sel);

function setStatus(msg, type = "") {
    const el = $("#status");
    el.textContent = msg;
    el.className = "status " + type;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderLoading() {
    $("#view-container").innerHTML = `<p class="empty">Cargando...</p>`;
}

function renderError(err) {
    setStatus(err.message || "Error", "error");
    $("#view-container").innerHTML =
        `<p class="msg-error">⚠ ${escapeHtml(err.message || err)}</p>`;
}

function estadoBadge(estado) {
    return `<span class="badge ${estado}">${estado}</span>`;
}