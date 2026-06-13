let pacientes = [];
let filtroPacientes = "";
let paisesNacimiento = [];

const PAGINAS_APP = ["#perfil", "#pacientes", "#home", "#citas", "#generador", "#configuracion"];

const CODIGOS_PAIS_NACIMIENTO = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ",
  "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ",
  "DE", "DJ", "DK", "DM", "DO", "DZ",
  "EC", "EE", "EG", "EH", "ER", "ES", "ET",
  "FI", "FJ", "FK", "FM", "FO", "FR",
  "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY",
  "HK", "HM", "HN", "HR", "HT", "HU",
  "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT",
  "JE", "JM", "JO", "JP",
  "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ",
  "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY",
  "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
  "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ",
  "OM",
  "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY",
  "QA",
  "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ",
  "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ",
  "UA", "UG", "UM", "US", "UY", "UZ",
  "VA", "VC", "VE", "VG", "VI", "VN", "VU",
  "WF", "WS", "XK",
  "YE", "YT",
  "ZA", "ZM", "ZW"
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarTexto(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inicializarPaisesNacimiento() {
  if (paisesNacimiento.length) return;

  const displayNames = typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["es"], { type: "region" })
    : null;

  paisesNacimiento = CODIGOS_PAIS_NACIMIENTO
    .map(codigo => displayNames ? displayNames.of(codigo) : codigo)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function cargarListaPaisesNacimiento() {
  inicializarPaisesNacimiento();

  const datalist = document.getElementById("paises_nacimiento_lista");
  if (!datalist) return;

  datalist.innerHTML = paisesNacimiento.map(pais => (
    `<option value="${escapeHtml(pais)}"></option>`
  )).join("");
}

function obtenerPaisNacimientoCanonico(value) {
  inicializarPaisesNacimiento();

  const textoNormalizado = normalizarTexto(value);
  return paisesNacimiento.find(pais => normalizarTexto(pais) === textoNormalizado) || "";
}

function formatearFechaPaciente(fecha) {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha || "";

  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerPacientesFiltrados() {
  const filtro = normalizarTexto(filtroPacientes);
  if (!filtro) return pacientes;

  const terminos = filtro.split(/\s+/).filter(Boolean);

  return pacientes.filter(paciente => {
    const textoPaciente = normalizarTexto([
      paciente.nombres,
      paciente.apellidos,
      paciente.documento,
      paciente.fecha_nacimiento,
      formatearFechaPaciente(paciente.fecha_nacimiento),
      paciente.pais_nacimiento
    ].join(" "));

    return terminos.every(termino => textoPaciente.includes(termino));
  });
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "";

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad > 0 ? String(edad) : "";
}

function setPacienteMensaje(message, type) {
  const elemento = document.getElementById("paciente_mensaje");
  if (!elemento) return;

  elemento.textContent = message || "";
  elemento.className = `paciente-message ${type || ""}`.trim();
}

function limpiarFormularioPaciente() {
  ["paciente_nombres", "paciente_apellidos", "paciente_pais_nacimiento", "paciente_documento", "paciente_fecha_nacimiento"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

function renderPacientesTabla() {
  const tbody = document.getElementById("pacientes_tabla_body");
  if (!tbody) return;

  if (!pacientes.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin pacientes cargados.</td></tr>';
    return;
  }

  const pacientesFiltrados = obtenerPacientesFiltrados();

  if (!pacientesFiltrados.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin resultados para el filtro.</td></tr>';
    return;
  }

  tbody.innerHTML = pacientesFiltrados.map(paciente => `
    <tr>
      <td>${escapeHtml(paciente.nombres)}</td>
      <td>${escapeHtml(paciente.apellidos)}</td>
      <td>${escapeHtml(paciente.documento)}</td>
      <td>${escapeHtml(formatearFechaPaciente(paciente.fecha_nacimiento))}</td>
      <td>${escapeHtml(paciente.pais_nacimiento)}</td>
    </tr>
  `).join("");
}

function renderPacientesSelector() {
  const datalist = document.getElementById("calc_pacientes_lista");
  const pacienteIdInput = document.getElementById("calc_paciente_id");
  const pacienteBusqueda = document.getElementById("calc_paciente_busqueda");
  if (!datalist) return;

  const valorActual = pacienteIdInput ? pacienteIdInput.value : "";
  datalist.innerHTML = pacientes.map(paciente => (
    `<option value="${escapeHtml(obtenerEtiquetaPaciente(paciente))}"></option>`
  )).join("");

  if (pacienteIdInput && !pacientes.some(paciente => paciente.id === valorActual)) {
    pacienteIdInput.value = "";
    if (pacienteBusqueda) pacienteBusqueda.value = "";
    return;
  }

  if (pacienteBusqueda && valorActual) {
    const pacienteActual = pacientes.find(paciente => paciente.id === valorActual);
    if (pacienteActual) pacienteBusqueda.value = obtenerEtiquetaPaciente(pacienteActual);
  }
}

function obtenerEtiquetaPaciente(paciente) {
  return `${paciente.nombres} ${paciente.apellidos} - ${paciente.documento}`.trim();
}

function encontrarPacientePorBusqueda(value) {
  const texto = normalizarTexto(value);
  if (!texto) return null;

  return pacientes.find(paciente => (
    normalizarTexto(obtenerEtiquetaPaciente(paciente)) === texto ||
    normalizarTexto(paciente.documento) === texto
  )) || null;
}

function aplicarPacienteEnCalculadora(pacienteId) {
  const paciente = pacientes.find(item => item.id === pacienteId);
  const detalle = document.getElementById("calc_paciente_detalle");
  const pacienteIdInput = document.getElementById("calc_paciente_id");
  const pacienteBusqueda = document.getElementById("calc_paciente_busqueda");

  if (!paciente) {
    if (detalle) detalle.textContent = "";
    if (pacienteIdInput) pacienteIdInput.value = "";
    return;
  }

  const nombreInput = document.getElementById("calc_nombre");
  const documentoInput = document.getElementById("calc_id");
  const edadInput = document.getElementById("calc_edad");
  const edad = calcularEdad(paciente.fecha_nacimiento);

  if (nombreInput) nombreInput.value = `${paciente.nombres} ${paciente.apellidos}`.trim();
  if (documentoInput) documentoInput.value = paciente.documento;
  if (edadInput && edad) edadInput.value = edad;
  if (pacienteIdInput) pacienteIdInput.value = paciente.id;
  if (pacienteBusqueda) pacienteBusqueda.value = obtenerEtiquetaPaciente(paciente);
  if (detalle) {
    detalle.textContent = `${paciente.pais_nacimiento} | Nacimiento: ${paciente.fecha_nacimiento}`;
  }
}

function configurarBuscadorPacienteCalculadora(input) {
  input.addEventListener("change", function () {
    const paciente = encontrarPacientePorBusqueda(input.value);
    aplicarPacienteEnCalculadora(paciente ? paciente.id : "");
  });

  input.addEventListener("input", function () {
    const pacienteIdInput = document.getElementById("calc_paciente_id");
    const detalle = document.getElementById("calc_paciente_detalle");
    const paciente = encontrarPacientePorBusqueda(input.value);

    if (paciente) {
      aplicarPacienteEnCalculadora(paciente.id);
      return;
    }

    if (pacienteIdInput) pacienteIdInput.value = "";
    if (detalle) detalle.textContent = "";
  });
}

async function cargarPacientes() {
  const client = window.supabaseClient;
  if (!client) return;

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    pacientes = [];
    renderPacientesTabla();
    renderPacientesSelector();
    return;
  }

  const { data, error } = await client
    .from("pacientes")
    .select("id,nombres,apellidos,pais_nacimiento,documento,fecha_nacimiento,created_at")
    .order("apellidos", { ascending: true })
    .order("nombres", { ascending: true });

  if (error) {
    pacientes = [];
    renderPacientesTabla();
    renderPacientesSelector();
    setPacienteMensaje("No se pudieron cargar los pacientes. Ejecuta supabase-pacientes.sql en Supabase.", "error");
    return;
  }

  pacientes = data || [];
  renderPacientesTabla();
  renderPacientesSelector();
  setPacienteMensaje("");
}

async function guardarPaciente(event) {
  event.preventDefault();

  const client = window.supabaseClient;
  const boton = document.getElementById("paciente_submit");
  const paisNacimiento = obtenerPaisNacimientoCanonico(document.getElementById("paciente_pais_nacimiento").value);
  const payload = {
    nombres: document.getElementById("paciente_nombres").value.trim(),
    apellidos: document.getElementById("paciente_apellidos").value.trim(),
    documento: document.getElementById("paciente_documento").value.trim(),
    fecha_nacimiento: document.getElementById("paciente_fecha_nacimiento").value,
    pais_nacimiento: paisNacimiento
  };

  if (!payload.nombres || !payload.apellidos || !payload.documento || !payload.fecha_nacimiento) {
    setPacienteMensaje("Completa todos los campos del paciente.", "error");
    return;
  }

  if (!payload.pais_nacimiento) {
    setPacienteMensaje("Selecciona un pais de nacimiento de la lista.", "error");
    return;
  }

  if (boton) boton.disabled = true;
  setPacienteMensaje("Guardando paciente...", "");

  const { error } = await client
    .from("pacientes")
    .insert(payload);

  if (boton) boton.disabled = false;

  if (error) {
    setPacienteMensaje(error.message, "error");
    return;
  }

  limpiarFormularioPaciente();
  await cargarPacientes();
  setPacienteMensaje("Paciente guardado correctamente.", "success");
}

function configurarNavegacionLateral() {
  const appLayout = document.querySelector(".app-layout");
  const sideMenu = document.getElementById("side-menu");
  const hoverMenuQuery = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;

  function actualizarIconos() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function puedeUsarHoverMenu() {
    return hoverMenuQuery ? hoverMenuQuery.matches : true;
  }

  function setMenuColapsado(isCollapsed) {
    if (!appLayout) return;
    appLayout.classList.toggle("side-menu-collapsed", isCollapsed);
  }

  function aplicarModoMenu() {
    setMenuColapsado(puedeUsarHoverMenu());
  }

  if (sideMenu) {
    aplicarModoMenu();

    sideMenu.addEventListener("mouseenter", function () {
      if (puedeUsarHoverMenu()) setMenuColapsado(false);
    });

    sideMenu.addEventListener("mouseleave", function () {
      if (puedeUsarHoverMenu()) setMenuColapsado(true);
    });

    sideMenu.addEventListener("focusin", function () {
      if (puedeUsarHoverMenu()) setMenuColapsado(false);
    });

    sideMenu.addEventListener("focusout", function (event) {
      if (!puedeUsarHoverMenu()) return;
      if (!event.relatedTarget || !sideMenu.contains(event.relatedTarget)) {
        setMenuColapsado(true);
      }
    });

    if (hoverMenuQuery) {
      if (hoverMenuQuery.addEventListener) {
        hoverMenuQuery.addEventListener("change", aplicarModoMenu);
      } else if (hoverMenuQuery.addListener) {
        hoverMenuQuery.addListener(aplicarModoMenu);
      }
    }
  }

  if (window.jQuery) {
    window.jQuery('.side-menu-link[data-toggle="tab"]').on("shown.bs.tab", function (event) {
      const target = event.target.getAttribute("href");
      document.querySelectorAll(".side-menu-link").forEach(item => {
        const isActive = item.getAttribute("href") === target;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (target && window.location.hash !== target) {
        window.history.replaceState(null, "", target);
      }
    });

    const paginaInicial = PAGINAS_APP.includes(window.location.hash)
      ? window.location.hash
      : "#home";
    window.jQuery(`.side-menu-link[href="${paginaInicial}"]`).tab("show");

    window.addEventListener("hashchange", function () {
      if (PAGINAS_APP.includes(window.location.hash)) {
        window.jQuery(`.side-menu-link[href="${window.location.hash}"]`).tab("show");
      }
    });
  }

  actualizarIconos();
}

function configurarPacientes() {
  const form = document.getElementById("paciente-form");
  const recargar = document.getElementById("paciente_recargar");
  const pacienteBusqueda = document.getElementById("calc_paciente_busqueda");
  const filtro = document.getElementById("paciente_filtro");

  if (form) form.addEventListener("submit", guardarPaciente);
  if (recargar) recargar.addEventListener("click", cargarPacientes);
  if (filtro) {
    filtro.addEventListener("input", event => {
      filtroPacientes = event.target.value;
      renderPacientesTabla();
    });
  }
  if (pacienteBusqueda) {
    configurarBuscadorPacienteCalculadora(pacienteBusqueda);
  }

  cargarListaPaisesNacimiento();
  configurarNavegacionLateral();
  window.addEventListener("auth:session-changed", cargarPacientes);
  cargarPacientes();
}

document.addEventListener("DOMContentLoaded", configurarPacientes);
