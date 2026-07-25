let pacientes = [];
let filtroPacientes = "";
let paisesNacimiento = [];
let pacienteEditandoId = "";
const SEXOS_PACIENTE = ["Masculino", "Femenino"];

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

function normalizarSexoPaciente(value) {
  const textoNormalizado = normalizarTexto(value);
  return SEXOS_PACIENTE.find(sexo => normalizarTexto(sexo) === textoNormalizado) || "";
}

function obtenerGeneroCalculadoraDesdeSexo(sexo) {
  const sexoNormalizado = normalizarSexoPaciente(sexo);
  if (sexoNormalizado === "Masculino") return "M";
  if (sexoNormalizado === "Femenino") return "F";
  return "";
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
      paciente.pais_nacimiento,
      paciente.sexo
    ].join(" "));

    return terminos.every(termino => textoPaciente.includes(termino));
  });
}

function calcularEdad(fechaNacimiento, fechaReferencia) {
  if (!fechaNacimiento) return "";

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const referencia = fechaReferencia
    ? new Date(`${fechaReferencia}T00:00:00`)
    : new Date();
  if (Number.isNaN(referencia.getTime())) return "";

  let edad = referencia.getFullYear() - nacimiento.getFullYear();
  const mes = referencia.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && referencia.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad >= 0 ? String(edad) : "";
}

function setPacienteMensaje(message, type) {
  const elemento = document.getElementById("paciente_mensaje");
  if (!elemento) return;

  elemento.textContent = message || "";
  elemento.className = `paciente-message ${type || ""}`.trim();
}

function actualizarIconosPacientes() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function actualizarModoEdicionPaciente() {
  const submit = document.getElementById("paciente_submit");
  const cancelar = document.getElementById("paciente_cancelar_edicion");

  if (submit) {
    submit.textContent = pacienteEditandoId ? "Actualizar paciente" : "Guardar paciente";
  }

  if (cancelar) {
    cancelar.hidden = !pacienteEditandoId;
  }
}

function limpiarFormularioPaciente() {
  ["paciente_nombres", "paciente_apellidos", "paciente_pais_nacimiento", "paciente_documento", "paciente_fecha_nacimiento", "paciente_sexo"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

function cancelarEdicionPaciente() {
  pacienteEditandoId = "";
  limpiarFormularioPaciente();
  actualizarModoEdicionPaciente();
  setPacienteMensaje("");
}

function cargarPacienteEnFormulario(paciente) {
  if (!paciente) return;

  const campos = {
    paciente_nombres: paciente.nombres,
    paciente_apellidos: paciente.apellidos,
    paciente_documento: paciente.documento,
    paciente_fecha_nacimiento: paciente.fecha_nacimiento,
    paciente_pais_nacimiento: paciente.pais_nacimiento,
    paciente_sexo: paciente.sexo
  };

  Object.keys(campos).forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = campos[id] || "";
  });
}

function editarPaciente(pacienteId) {
  const paciente = pacientes.find(item => item.id === pacienteId);
  const form = document.getElementById("paciente-form");

  if (!paciente) {
    setPacienteMensaje("No se encontro el paciente seleccionado.", "error");
    return;
  }

  pacienteEditandoId = paciente.id;
  cargarPacienteEnFormulario(paciente);
  actualizarModoEdicionPaciente();
  setPacienteMensaje("Editando paciente. Guarda para aplicar los cambios.", "");

  if (form && typeof form.scrollIntoView === "function") {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderPacientesTabla() {
  const tbody = document.getElementById("pacientes_tabla_body");
  if (!tbody) return;

  if (!pacientes.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted">Sin pacientes cargados.</td></tr>';
    return;
  }

  const pacientesFiltrados = obtenerPacientesFiltrados();

  if (!pacientesFiltrados.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted">Sin resultados para el filtro.</td></tr>';
    return;
  }

  tbody.innerHTML = pacientesFiltrados.map(paciente => `
    <tr>
      <td>${escapeHtml(paciente.nombres)}</td>
      <td>${escapeHtml(paciente.apellidos)}</td>
      <td>${escapeHtml(paciente.documento)}</td>
      <td>${escapeHtml(formatearFechaPaciente(paciente.fecha_nacimiento))}</td>
      <td>${escapeHtml(paciente.pais_nacimiento)}</td>
      <td>${escapeHtml(paciente.sexo)}</td>
      <td class="paciente-actions-cell">
        <button type="button" class="btn btn-outline-secondary btn-sm paciente-edit-button"
          data-paciente-editar="${escapeHtml(paciente.id)}" aria-label="Editar paciente"
          title="Editar paciente">
          <span data-lucide="pencil" aria-hidden="true"></span>
        </button>
      </td>
    </tr>
  `).join("");
  actualizarIconosPacientes();
}

function renderPacientesSelector() {
  const selector = document.getElementById("calc_paciente_selector");
  const pacienteIdInput = document.getElementById("calc_paciente_id");
  const pacienteBusqueda = document.getElementById("calc_paciente_busqueda");
  if (!selector) return;

  const valorActual = pacienteIdInput ? pacienteIdInput.value : "";
  const filtro = normalizarTexto(pacienteBusqueda ? pacienteBusqueda.value : "");
  const terminos = filtro.split(/\s+/).filter(Boolean);
  const pacientesFiltrados = pacientes.filter(paciente => {
    if (!terminos.length) return true;
    const etiqueta = normalizarTexto(obtenerEtiquetaPaciente(paciente));
    return terminos.every(termino => etiqueta.includes(termino));
  });
  const pacienteActual = pacientes.find(paciente => paciente.id === valorActual);
  const opciones = pacienteActual && !pacientesFiltrados.some(paciente => paciente.id === valorActual)
    ? [pacienteActual, ...pacientesFiltrados]
    : pacientesFiltrados;
  const textoOpcionInicial = !pacientes.length
    ? "No hay pacientes registrados"
    : "No se encontraron pacientes";

  selector.innerHTML = opciones.length
    ? opciones.map(paciente => (
      `<option value="${escapeHtml(paciente.id)}">${escapeHtml(obtenerEtiquetaPaciente(paciente))}</option>`
    )).join("")
    : `<option value="" disabled>${textoOpcionInicial}</option>`;
  selector.size = Math.max(2, Math.min(5, opciones.length || 1));

  if (pacienteIdInput && !pacientes.some(paciente => paciente.id === valorActual)) {
    pacienteIdInput.value = "";
    selector.selectedIndex = -1;
    return;
  }

  if (valorActual) {
    selector.value = valorActual;
  } else if (opciones.length) {
    selector.selectedIndex = -1;
  }
}

function mostrarResultadosPacientes() {
  const selector = document.getElementById("calc_paciente_selector");
  const buscador = document.getElementById("calc_paciente_busqueda");
  if (!selector || !buscador) return;

  renderPacientesSelector();
  selector.hidden = false;
  buscador.setAttribute("aria-expanded", "true");
}

function ocultarResultadosPacientes() {
  const selector = document.getElementById("calc_paciente_selector");
  const buscador = document.getElementById("calc_paciente_busqueda");
  if (selector) selector.hidden = true;
  if (buscador) buscador.setAttribute("aria-expanded", "false");
}

function obtenerEtiquetaPaciente(paciente) {
  return `${paciente.nombres} ${paciente.apellidos} - ${paciente.documento}`.trim();
}

function limpiarDatosPacienteCalculadora() {
  ["calc_nombre", "calc_id", "calc_edad", "calc_genero"].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = "";
  });
}

function aplicarPacienteEnCalculadora(pacienteId) {
  const paciente = pacientes.find(item => item.id === pacienteId);
  const detalle = document.getElementById("calc_paciente_detalle");
  const pacienteIdInput = document.getElementById("calc_paciente_id");
  const selector = document.getElementById("calc_paciente_selector");
  const pacienteBusqueda = document.getElementById("calc_paciente_busqueda");

  if (!paciente) {
    if (detalle) detalle.textContent = "";
    if (pacienteIdInput) pacienteIdInput.value = "";
    if (selector) selector.value = "";
    limpiarDatosPacienteCalculadora();
    return;
  }

  const nombreInput = document.getElementById("calc_nombre");
  const documentoInput = document.getElementById("calc_id");
  const edadInput = document.getElementById("calc_edad");
  const generoInput = document.getElementById("calc_genero");
  const fechaEvaluacion = document.getElementById("calc_fecha");
  const edad = calcularEdad(
    paciente.fecha_nacimiento,
    fechaEvaluacion ? fechaEvaluacion.value : ""
  );
  const genero = obtenerGeneroCalculadoraDesdeSexo(paciente.sexo);

  if (nombreInput) nombreInput.value = `${paciente.nombres} ${paciente.apellidos}`.trim();
  if (documentoInput) documentoInput.value = paciente.documento;
  if (edadInput) {
    edadInput.value = edad;
    edadInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (generoInput && genero) generoInput.value = genero;
  if (pacienteIdInput) pacienteIdInput.value = paciente.id;
  if (selector) selector.value = paciente.id;
  if (pacienteBusqueda) pacienteBusqueda.value = obtenerEtiquetaPaciente(paciente);
  if (detalle) {
    detalle.textContent = `${paciente.sexo || "Sexo no registrado"} | ${paciente.pais_nacimiento} | Nacimiento: ${paciente.fecha_nacimiento}`;
  }
}

function configurarBuscadorPacienteCalculadora(input) {
  const seleccionarTextoCompleto = function () {
    window.requestAnimationFrame(function () {
      input.select();
    });
  };

  input.addEventListener("focus", function () {
    mostrarResultadosPacientes();
    seleccionarTextoCompleto();
  });

  input.addEventListener("click", seleccionarTextoCompleto);

  input.addEventListener("input", function () {
    aplicarPacienteEnCalculadora("");
    mostrarResultadosPacientes();
  });

  input.addEventListener("keydown", function (event) {
    const selector = document.getElementById("calc_paciente_selector");
    if (event.key === "Escape") {
      ocultarResultadosPacientes();
      return;
    }
    if (event.key !== "ArrowDown") return;
    if (!selector || !selector.options.length || selector.options[0].disabled) return;

    event.preventDefault();
    mostrarResultadosPacientes();
    selector.focus();
    selector.selectedIndex = 0;
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
    window.dispatchEvent(new CustomEvent("pacientes:loaded"));
    return;
  }

  const { data, error } = await client
    .from("pacientes")
    .select("id,nombres,apellidos,pais_nacimiento,documento,fecha_nacimiento,sexo,created_at")
    .order("apellidos", { ascending: true })
    .order("nombres", { ascending: true });

  if (error) {
    pacientes = [];
    renderPacientesTabla();
    renderPacientesSelector();
    window.dispatchEvent(new CustomEvent("pacientes:loaded"));
    setPacienteMensaje("No se pudieron cargar los pacientes. Revisa que el esquema de pacientes este actualizado.", "error");
    return;
  }

  pacientes = data || [];
  if (pacienteEditandoId && !pacientes.some(paciente => paciente.id === pacienteEditandoId)) {
    cancelarEdicionPaciente();
  }
  renderPacientesTabla();
  renderPacientesSelector();
  window.dispatchEvent(new CustomEvent("pacientes:loaded"));
  setPacienteMensaje("");
}

async function guardarPaciente(event) {
  event.preventDefault();

  const client = window.supabaseClient;
  const boton = document.getElementById("paciente_submit");
  const paisNacimiento = obtenerPaisNacimientoCanonico(document.getElementById("paciente_pais_nacimiento").value);
  const sexo = normalizarSexoPaciente(document.getElementById("paciente_sexo").value);
  const payload = {
    nombres: document.getElementById("paciente_nombres").value.trim(),
    apellidos: document.getElementById("paciente_apellidos").value.trim(),
    documento: document.getElementById("paciente_documento").value.trim(),
    fecha_nacimiento: document.getElementById("paciente_fecha_nacimiento").value,
    pais_nacimiento: paisNacimiento,
    sexo
  };

  if (!payload.nombres || !payload.apellidos || !payload.documento || !payload.fecha_nacimiento || !payload.sexo) {
    setPacienteMensaje("Completa todos los campos del paciente.", "error");
    return;
  }

  if (!payload.pais_nacimiento) {
    setPacienteMensaje("Selecciona un pais de nacimiento de la lista.", "error");
    return;
  }

  if (boton) boton.disabled = true;
  const estaEditando = Boolean(pacienteEditandoId);
  setPacienteMensaje(estaEditando ? "Actualizando paciente..." : "Guardando paciente...", "");

  const { error } = estaEditando
    ? await client
      .from("pacientes")
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", pacienteEditandoId)
    : await client
      .from("pacientes")
      .insert(payload);

  if (boton) boton.disabled = false;

  if (error) {
    setPacienteMensaje(error.message, "error");
    return;
  }

  limpiarFormularioPaciente();
  pacienteEditandoId = "";
  actualizarModoEdicionPaciente();
  await cargarPacientes();
  setPacienteMensaje(estaEditando ? "Paciente actualizado correctamente." : "Paciente guardado correctamente.", "success");
}

function setNuevoPacienteCalculadoraMensaje(message, type) {
  const elemento = document.getElementById("calc_nuevo_paciente_mensaje");
  if (!elemento) return;
  elemento.textContent = message || "";
  elemento.className = `paciente-message mb-0 ${type || ""}`.trim();
}

function mostrarFormularioNuevoPacienteCalculadora(mostrar) {
  const panel = document.getElementById("calc_nuevo_paciente_panel");
  const boton = document.getElementById("calc_nuevo_paciente_toggle");
  if (!panel) return;

  panel.hidden = !mostrar;
  if (boton) boton.setAttribute("aria-expanded", mostrar ? "true" : "false");
  setNuevoPacienteCalculadoraMensaje("");

  if (mostrar) {
    const nombres = document.getElementById("calc_nuevo_paciente_nombres");
    if (nombres) nombres.focus();
  }
}

function limpiarFormularioNuevoPacienteCalculadora() {
  const form = document.getElementById("calc_nuevo_paciente_form");
  if (form) form.reset();
  setNuevoPacienteCalculadoraMensaje("");
}

async function guardarNuevoPacienteCalculadora(event) {
  event.preventDefault();

  const client = window.supabaseClient;
  const boton = document.getElementById("calc_nuevo_paciente_guardar");
  const paisNacimiento = obtenerPaisNacimientoCanonico(
    document.getElementById("calc_nuevo_paciente_pais_nacimiento").value
  );
  const payload = {
    nombres: document.getElementById("calc_nuevo_paciente_nombres").value.trim(),
    apellidos: document.getElementById("calc_nuevo_paciente_apellidos").value.trim(),
    documento: document.getElementById("calc_nuevo_paciente_documento").value.trim(),
    fecha_nacimiento: document.getElementById("calc_nuevo_paciente_fecha_nacimiento").value,
    pais_nacimiento: paisNacimiento,
    sexo: normalizarSexoPaciente(document.getElementById("calc_nuevo_paciente_sexo").value)
  };

  if (!client) {
    setNuevoPacienteCalculadoraMensaje("No hay conexión disponible con la base de datos.", "error");
    return;
  }
  if (!payload.nombres || !payload.apellidos || !payload.documento || !payload.fecha_nacimiento || !payload.sexo) {
    setNuevoPacienteCalculadoraMensaje("Completa todos los campos del paciente.", "error");
    return;
  }
  if (!payload.pais_nacimiento) {
    setNuevoPacienteCalculadoraMensaje("Selecciona un país de nacimiento de la lista.", "error");
    return;
  }

  if (boton) boton.disabled = true;
  setNuevoPacienteCalculadoraMensaje("Guardando paciente...", "");

  const { data, error } = await client
    .from("pacientes")
    .insert(payload)
    .select("id")
    .single();

  if (boton) boton.disabled = false;

  if (error) {
    setNuevoPacienteCalculadoraMensaje(error.message, "error");
    return;
  }

  await cargarPacientes();
  if (data && data.id) aplicarPacienteEnCalculadora(data.id);
  limpiarFormularioNuevoPacienteCalculadora();
  mostrarFormularioNuevoPacienteCalculadora(false);
}

function configurarNavegacionLateral() {
  const appLayout = document.querySelector(".app-layout");
  const sideMenu = document.getElementById("side-menu");
  const hoverMenuQuery = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;
  let menuBloqueadoTrasSeleccion = false;

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
    setMenuColapsado(true);
  }

  function ocultarMenuLateral() {
    menuBloqueadoTrasSeleccion = true;
    setMenuColapsado(true);

    if (sideMenu && sideMenu.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  if (sideMenu) {
    aplicarModoMenu();

    sideMenu.addEventListener("mouseenter", function () {
      if (puedeUsarHoverMenu() && !menuBloqueadoTrasSeleccion) setMenuColapsado(false);
    });

    sideMenu.addEventListener("mouseleave", function () {
      menuBloqueadoTrasSeleccion = false;
      if (puedeUsarHoverMenu()) setMenuColapsado(true);
    });

    sideMenu.addEventListener("pointerleave", function () {
      menuBloqueadoTrasSeleccion = false;
      setMenuColapsado(true);
    });

    sideMenu.addEventListener("focusin", function () {
      if (puedeUsarHoverMenu() && !menuBloqueadoTrasSeleccion) setMenuColapsado(false);
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

  document.querySelectorAll(".side-menu-link").forEach(link => {
    link.addEventListener("click", function () {
      window.setTimeout(ocultarMenuLateral, 0);
    });
    link.addEventListener("touchend", function () {
      window.setTimeout(ocultarMenuLateral, 0);
    }, { passive: true });
  });

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

      ocultarMenuLateral();
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
  const pacienteSelector = document.getElementById("calc_paciente_selector");
  const pacienteControl = document.getElementById("calc_paciente_control");
  const fechaEvaluacion = document.getElementById("calc_fecha");
  const filtro = document.getElementById("paciente_filtro");
  const cancelarEdicion = document.getElementById("paciente_cancelar_edicion");
  const pacientesTablaBody = document.getElementById("pacientes_tabla_body");
  const nuevoPacienteForm = document.getElementById("calc_nuevo_paciente_form");
  const nuevoPacienteToggle = document.getElementById("calc_nuevo_paciente_toggle");
  const nuevoPacienteCerrar = document.getElementById("calc_nuevo_paciente_cerrar");
  const nuevoPacienteCancelar = document.getElementById("calc_nuevo_paciente_cancelar");

  if (form) form.addEventListener("submit", guardarPaciente);
  if (nuevoPacienteForm) nuevoPacienteForm.addEventListener("submit", guardarNuevoPacienteCalculadora);
  if (nuevoPacienteToggle) {
    nuevoPacienteToggle.addEventListener("click", () => {
      const panel = document.getElementById("calc_nuevo_paciente_panel");
      mostrarFormularioNuevoPacienteCalculadora(Boolean(panel && panel.hidden));
    });
  }
  [nuevoPacienteCerrar, nuevoPacienteCancelar].forEach(boton => {
    if (!boton) return;
    boton.addEventListener("click", () => {
      limpiarFormularioNuevoPacienteCalculadora();
      mostrarFormularioNuevoPacienteCalculadora(false);
    });
  });
  if (cancelarEdicion) cancelarEdicion.addEventListener("click", cancelarEdicionPaciente);
  if (recargar) recargar.addEventListener("click", cargarPacientes);
  if (pacientesTablaBody) {
    pacientesTablaBody.addEventListener("click", event => {
      const botonEditar = event.target.closest("[data-paciente-editar]");
      if (botonEditar) editarPaciente(botonEditar.dataset.pacienteEditar);
    });
  }
  if (filtro) {
    filtro.addEventListener("input", event => {
      filtroPacientes = event.target.value;
      renderPacientesTabla();
    });
  }
  if (pacienteBusqueda) {
    configurarBuscadorPacienteCalculadora(pacienteBusqueda);
  }
  if (pacienteSelector) {
    pacienteSelector.addEventListener("click", () => {
      if (!pacienteSelector.value) return;
      aplicarPacienteEnCalculadora(pacienteSelector.value);
      ocultarResultadosPacientes();
    });
    pacienteSelector.addEventListener("keydown", event => {
      if (event.key === "Enter" && pacienteSelector.value) {
        event.preventDefault();
        aplicarPacienteEnCalculadora(pacienteSelector.value);
        ocultarResultadosPacientes();
        if (pacienteBusqueda) pacienteBusqueda.focus();
      } else if (event.key === "Escape") {
        ocultarResultadosPacientes();
        if (pacienteBusqueda) pacienteBusqueda.focus();
      }
    });
  }
  document.addEventListener("click", event => {
    if (pacienteControl && !pacienteControl.contains(event.target)) {
      ocultarResultadosPacientes();
    }
  });
  if (fechaEvaluacion) {
    fechaEvaluacion.addEventListener("change", () => {
      const pacienteIdInput = document.getElementById("calc_paciente_id");
      if (pacienteIdInput && pacienteIdInput.value) {
        aplicarPacienteEnCalculadora(pacienteIdInput.value);
      }
    });
  }

  cargarListaPaisesNacimiento();
  configurarNavegacionLateral();
  actualizarModoEdicionPaciente();
  window.addEventListener("auth:session-changed", cargarPacientes);
  cargarPacientes();
}

document.addEventListener("DOMContentLoaded", configurarPacientes);
