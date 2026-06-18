let citas = [];
let filtroCitas = "";

const CAMPOS_NUTRIENTES = [
  ["energia_calculada", "Energia calculada (Kcal)"],
  ["proteina", "Proteina (g)"],
  ["grasa_total", "Grasa total (g)"],
  ["carbohidratos", "Carbohidratos (g)"],
  ["fibra", "Fibra (g)"],
  ["ags", "AGS (g)"],
  ["agm", "AGM (g)"],
  ["agpi", "AGPI (g)"],
  ["colesterol", "Colesterol (mg)"],
  ["calcio", "Calcio (mg)"],
  ["fosforo", "Fosforo (mg)"],
  ["hierro", "Hierro (mg)"],
  ["potasio", "Potasio (mg)"],
  ["sodio", "Sodio (mg)"],
  ["zinc", "Zinc (mg)"],
  ["vitamina_c", "Vitamina C (mg)"],
  ["vitamina_a", "Vitamina A (ug ERE)"],
  ["folatos", "Folatos (ug)"],
  ["vitamina_b12", "Vitamina B12 (ug)"]
];

const CAMPOS_MEDIDAS_CITA = [
  ["brazo_izquierdo", "Brazo izquierdo"],
  ["brazo_derecho", "Brazo derecho"],
  ["abdomen", "Abdomen"],
  ["abdomen_bajo", "Abdomen bajo"],
  ["muslo_izquierdo", "Muslo izquierdo"],
  ["muslo_derecho", "Muslo derecho"],
  ["pantorrilla_izquierda", "Pantorrilla izquierda"],
  ["pantorrilla_derecha", "Pantorrilla derecha"]
];

function obtenerTiemposCita() {
  if (typeof tiemposComida !== "undefined" && Array.isArray(tiemposComida)) {
    return tiemposComida;
  }

  return ["Desayuno", "Media Ma\u00f1ana", "Almuerzo", "Media Tarde", "Merienda", "Cena"];
}

function obtenerHorasComidaCita() {
  if (typeof obtenerHorasComida === "function") {
    return obtenerHorasComida();
  }

  const horas = {};
  obtenerTiemposCita().forEach(tiempo => {
    horas[tiempo] = "";
  });
  return horas;
}

function obtenerEtiquetaTiempoCita(tiempo, horasComida) {
  const horas = horasComida && typeof horasComida === "object" ? horasComida : {};
  const hora = horas[tiempo] || "";
  return hora ? `${tiempo} (${hora})` : tiempo;
}

function citaEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function citaNormalizar(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function citaValor(id) {
  const elemento = document.getElementById(id);
  return elemento ? elemento.value || "" : "";
}

function citaTexto(id) {
  const elemento = document.getElementById(id);
  return elemento ? elemento.textContent || "" : "";
}

function citaSelectTexto(id) {
  const elemento = document.getElementById(id);
  if (!elemento || !elemento.selectedOptions || !elemento.selectedOptions.length) {
    return citaValor(id);
  }

  return elemento.selectedOptions[0].textContent || citaValor(id);
}

function citaPorcentaje(id) {
  const value = citaValor(id) || citaTexto(id);
  if (!value) return "";
  return String(value).includes("%") ? value : `${value}%`;
}

function citaNumero(value) {
  const numero = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(numero) ? Number(numero.toFixed(4)) : 0;
}

function citaFormatearFecha(fecha) {
  if (!fecha) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const partes = fecha.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleDateString("es-EC");
}

function citaFormatearFechaHora(fecha) {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function citaFormatearNumero(value) {
  const numero = parseFloat(value);
  if (!Number.isFinite(numero)) return citaEscape(value);
  return numero.toFixed(2);
}

function citaClonarNutricion(objeto) {
  const salida = {};
  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    salida[campo] = citaNumero(objeto ? objeto[campo] : 0);
  });
  return salida;
}

function obtenerColumnasVisiblesCita() {
  if (typeof obtenerColumnasAlimentosVisiblesArray === "function") {
    return obtenerColumnasAlimentosVisiblesArray();
  }

  return [];
}

function obtenerGraficoImcCita() {
  if (typeof actualizarIndiceMasaCorporal === "function") {
    actualizarIndiceMasaCorporal();
  }

  const chart = document.getElementById("imc_chart");
  if (!chart) return "";

  const clone = chart.cloneNode(true);
  const prefijo = `cita_${Date.now()}_`;
  const idMap = {};

  [clone].concat(Array.from(clone.querySelectorAll("[id]"))).forEach(elemento => {
    if (!elemento.id) return;
    const idAnterior = elemento.id;
    const idSiguiente = `${prefijo}${idAnterior}`;
    idMap[idAnterior] = idSiguiente;
    elemento.id = idSiguiente;
  });

  const actualizarReferencia = function (valor) {
    let salida = valor;
    Object.keys(idMap).forEach(idAnterior => {
      salida = salida
        .split(`#${idAnterior}`).join(`#${idMap[idAnterior]}`)
        .split(idAnterior).join(idMap[idAnterior]);
    });
    return salida;
  };

  [clone].concat(Array.from(clone.querySelectorAll("*"))).forEach(elemento => {
    Array.from(elemento.attributes).forEach(attr => {
      if (attr.name === "id") return;
      if (Object.keys(idMap).some(idAnterior => attr.value.includes(idAnterior))) {
        elemento.setAttribute(attr.name, actualizarReferencia(attr.value));
      }
    });
  });

  clone.removeAttribute("id");
  clone.classList.add("cita-imc-chart-svg");

  return clone.outerHTML;
}

function obtenerImcCita() {
  const datos = typeof obtenerIndiceMasaCorporalActual === "function"
    ? obtenerIndiceMasaCorporalActual()
    : null;

  if (!datos || !datos.valido) {
    return {
      valido: false,
      peso: citaNumero(citaValor("calc_peso")),
      estatura_cm: citaNumero(citaValor("calc_estatura")),
      estatura_m: 0,
      valor: 0,
      clasificacion: "",
      grafico_svg: ""
    };
  }

  return {
    valido: true,
    peso: citaNumero(datos.peso),
    estatura_cm: citaNumero(citaValor("calc_estatura")),
    estatura_m: citaNumero(datos.estaturaMetros),
    valor: citaNumero(datos.imc),
    clasificacion: datos.clasificacion || "",
    grafico_svg: obtenerGraficoImcCita()
  };
}

function obtenerImcDesdeSnapshot(snapshot) {
  if (snapshot && snapshot.imc && snapshot.imc.valido) return snapshot.imc;

  const paciente = snapshot && snapshot.paciente ? snapshot.paciente : {};
  const peso = citaNumero(paciente.peso);
  const estaturaCm = citaNumero(paciente.estatura);
  const estaturaM = estaturaCm > 3 ? estaturaCm / 100 : estaturaCm;
  const imc = peso > 0 && estaturaM > 0 ? peso / (estaturaM * estaturaM) : 0;

  if (!imc || !Number.isFinite(imc)) {
    return { valido: false, peso, estatura_cm: estaturaCm, estatura_m: estaturaM, valor: 0, clasificacion: "", grafico_svg: "" };
  }

  const clasificacion = typeof obtenerClasificacionImc === "function"
    ? obtenerClasificacionImc(imc)
    : "";

  return {
    valido: true,
    peso,
    estatura_cm: estaturaCm,
    estatura_m: estaturaM,
    valor: citaNumero(imc),
    clasificacion,
    grafico_svg: ""
  };
}

function obtenerSvgSeguroCita(svg) {
  const contenido = String(svg || "").trim();
  if (!contenido || !/^<svg[\s>]/i.test(contenido)) return "";
  if (/<script|<foreignObject|javascript:|on[a-z]+\s*=/i.test(contenido)) return "";
  return contenido;
}

async function obtenerProfesionalCita(session) {
  const user = session && session.user ? session.user : null;
  if (!user) return {};

  const profesional = {
    user_id: user.id,
    email: user.email || "",
    usuario: user.user_metadata && user.user_metadata.usuario ? user.user_metadata.usuario : "",
    nombre: "",
    telefono: ""
  };

  const client = window.supabaseClient;
  if (!client) return profesional;

  const { data, error } = await client
    .from("profiles")
    .select("usuario,nombre,telefono")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data) {
    profesional.usuario = data.usuario || profesional.usuario;
    profesional.nombre = data.nombre || "";
    profesional.telefono = data.telefono || "";
  }

  if (!profesional.usuario) {
    const resumen = document.getElementById("auth-user-name");
    profesional.usuario = resumen ? resumen.textContent || "" : "";
  }

  return profesional;
}

function obtenerMacronutrientesCita() {
  return [
    {
      macronutriente: "Proteinas",
      porcentaje: citaPorcentaje("macro_proteina_porcentaje"),
      kcal: citaTexto("macro_proteina_kcal"),
      gramos: citaTexto("macro_proteina_gramos"),
      gkg: citaTexto("macro_proteina_gkg")
    },
    {
      macronutriente: "Grasas",
      porcentaje: citaPorcentaje("macro_grasa_porcentaje"),
      kcal: citaTexto("macro_grasa_kcal"),
      gramos: citaTexto("macro_grasa_gramos"),
      gkg: citaTexto("macro_grasa_gkg")
    },
    {
      macronutriente: "Carbohidratos",
      porcentaje: citaPorcentaje("macro_carbohidratos_porcentaje"),
      kcal: citaTexto("macro_carbohidratos_kcal"),
      gramos: citaTexto("macro_carbohidratos_gramos"),
      gkg: citaTexto("macro_carbohidratos_gkg")
    }
  ];
}

function obtenerAlimentosPorTiempoCita() {
  if (typeof nuevoOrden === "function") nuevoOrden();
  if (typeof actualizarTiemposDesdeTabla === "function") actualizarTiemposDesdeTabla();
  if (typeof total_kilocalorias === "function") total_kilocalorias();

  const porTiempo = {};
  const tiempos = obtenerTiemposCita();
  tiempos.forEach(tiempo => {
    porTiempo[tiempo] = [];
  });

  const orden = Array.isArray(window.alimentos_seleccionados_en_orden)
    ? window.alimentos_seleccionados_en_orden
    : (typeof alimentos_seleccionados_en_orden !== "undefined" ? alimentos_seleccionados_en_orden : []);

  for (const clave in orden) {
    const item = orden[clave];
    if (!item) continue;
    const tiempo = porTiempo[item.tiempo] ? item.tiempo : "Desayuno";
    porTiempo[tiempo].push({
      nombre: item.nombre || "",
      gramos: citaNumero(item.gramos),
      ...citaClonarNutricion(item)
    });
  }

  return porTiempo;
}

function obtenerTotalesCita() {
  if (typeof calcular === "function") calcular();
  if (typeof total_kilocalorias === "function") total_kilocalorias();

  const subtotales = {};
  const tiempos = obtenerTiemposCita();
  tiempos.forEach(tiempo => {
    subtotales[tiempo] = citaClonarNutricion(window.alimentos_subtotales ? window.alimentos_subtotales[tiempo] : {});
  });

  return {
    subtotales,
    total: citaClonarNutricion(typeof alimentos_total !== "undefined" ? alimentos_total : {}),
    total_kilocalorias: {
      proteina: citaNumero(typeof alimentos_total_kc !== "undefined" ? alimentos_total_kc.proteina : 0),
      grasa_total: citaNumero(typeof alimentos_total_kc !== "undefined" ? alimentos_total_kc.grasa_total : 0),
      carbohidratos: citaNumero(typeof alimentos_total_kc !== "undefined" ? alimentos_total_kc.carbohidratos : 0)
    },
    requerimiento: citaClonarNutricion(typeof alimentos_requerimiento !== "undefined" ? alimentos_requerimiento : {}),
    adecuacion: citaClonarNutricion(typeof alimentos_adecuacion !== "undefined" ? alimentos_adecuacion : {})
  };
}

function obtenerSnapshotCita() {
  const pacienteId = citaValor("calc_paciente_id") || null;
  const pacienteRegistrado = pacienteId && typeof pacientes !== "undefined" && Array.isArray(pacientes)
    ? pacientes.find(item => item.id === pacienteId)
    : null;
  const paciente = {
    paciente_id: pacienteId,
    nombre: citaValor("calc_nombre"),
    nombres: pacienteRegistrado ? pacienteRegistrado.nombres : "",
    apellidos: pacienteRegistrado ? pacienteRegistrado.apellidos : "",
    documento: citaValor("calc_id"),
    fecha_nacimiento: pacienteRegistrado ? pacienteRegistrado.fecha_nacimiento : "",
    pais_nacimiento: pacienteRegistrado ? pacienteRegistrado.pais_nacimiento : "",
    sexo: pacienteRegistrado ? pacienteRegistrado.sexo : citaSelectTexto("calc_genero"),
    fecha_evaluacion: citaValor("calc_fecha"),
    peso: citaValor("calc_peso"),
    peso_ideal: citaValor("macro_peso_ideal"),
    estatura: citaValor("calc_estatura"),
    edad: citaValor("calc_edad"),
    genero: citaValor("calc_genero"),
    genero_texto: citaSelectTexto("calc_genero"),
    actividad: citaValor("calc_actividad"),
    actividad_texto: citaSelectTexto("calc_actividad"),
    medidas_antropometricas: typeof obtenerMedidasAntropometricas === "function" ? obtenerMedidasAntropometricas() : {}
  };

  return {
    version: 4,
    guardado_en: new Date().toISOString(),
    paciente,
    profesional: {},
    imc: obtenerImcCita(),
    configuracion: {
      columnas_alimentos_visibles: obtenerColumnasVisiblesCita()
    },
    macronutrientes: obtenerMacronutrientesCita(),
    horas_comida: obtenerHorasComidaCita(),
    alimentos_por_tiempo: obtenerAlimentosPorTiempoCita(),
    totales: obtenerTotalesCita()
  };
}

async function guardarCita() {
  const client = window.supabaseClient;
  if (!client) return;

  if (!confirm("\u00bfEst\u00e1 seguro que quiere guardar como cita?")) return;

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    alert("Debes iniciar sesion para guardar la cita.");
    return;
  }

  const snapshot = obtenerSnapshotCita();
  snapshot.profesional = await obtenerProfesionalCita(sessionData.session);
  if (!snapshot.paciente.nombre && !snapshot.paciente.documento) {
    alert("Selecciona o escribe los datos del paciente antes de guardar la cita.");
    return;
  }

  const boton = document.getElementById("guardar_cita_btn");
  if (boton) boton.disabled = true;

  try {
    const { error } = await client
      .from("citas")
      .insert({
        paciente_id: snapshot.paciente.paciente_id,
        paciente_nombre: snapshot.paciente.nombre,
        paciente_documento: snapshot.paciente.documento,
        fecha_cita: snapshot.paciente.fecha_evaluacion || new Date().toISOString().slice(0, 10),
        snapshot
      });

    if (error) {
      alert(`No se pudo guardar la cita: ${error.message}`);
      return;
    }

    alert("Cita guardada correctamente.");
    await cargarCitas();
  } catch (error) {
    alert(`No se pudo guardar la cita: ${error.message}`);
  } finally {
    if (boton) boton.disabled = false;
  }
}

function obtenerCitasFiltradas() {
  const filtro = citaNormalizar(filtroCitas);
  if (!filtro) return citas;

  const terminos = filtro.split(/\s+/).filter(Boolean);
  return citas.filter(cita => {
    const texto = citaNormalizar([
      cita.paciente_nombre,
      cita.paciente_documento,
      cita.fecha_cita,
      citaFormatearFecha(cita.fecha_cita),
      cita.created_at
    ].join(" "));

    return terminos.every(termino => texto.includes(termino));
  });
}

function renderCitasTabla() {
  const tbody = document.getElementById("citas_tbody");
  if (!tbody) return;

  if (!citas.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin citas guardadas.</td></tr>';
    return;
  }

  const filtradas = obtenerCitasFiltradas();
  if (!filtradas.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin resultados para el filtro.</td></tr>';
    return;
  }

  tbody.innerHTML = filtradas.map(cita => `
    <tr class="cita-row" data-cita-id="${citaEscape(cita.id)}">
      <td>${citaEscape(citaFormatearFecha(cita.fecha_cita))}</td>
      <td>${citaEscape(cita.paciente_nombre || "")}</td>
      <td>${citaEscape(cita.paciente_documento || "")}</td>
      <td>${citaEscape(citaFormatearFechaHora(cita.created_at))}</td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".cita-row").forEach(row => {
    row.addEventListener("click", () => {
      const cita = citas.find(item => item.id === row.dataset.citaId);
      if (cita) renderDetalleCita(cita);
    });
  });
}

async function cargarCitas() {
  const client = window.supabaseClient;
  if (!client) return;

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    citas = [];
    renderCitasTabla();
    return;
  }

  const { data, error } = await client
    .from("citas")
    .select("id,paciente_id,paciente_nombre,paciente_documento,fecha_cita,snapshot,created_at")
    .order("fecha_cita", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    const detalle = document.getElementById("cita_detalle");
    if (detalle) detalle.innerHTML = '<div class="alert alert-warning">No se pudieron cargar las citas. Ejecuta supabase-citas.sql en Supabase.</div>';
    return;
  }

  citas = data || [];
  renderCitasTabla();
}

function tablaObjetoNutricional(titulo, filas) {
  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-primary">
          <tr>
            <th>${citaEscape(titulo)}</th>
            ${CAMPOS_NUTRIENTES.map(([, label]) => `<th>${citaEscape(label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${filas.map(fila => `
            <tr>
              <td>${citaEscape(fila.nombre)}</td>
              ${CAMPOS_NUTRIENTES.map(([campo]) => `<td>${citaFormatearNumero(fila[campo])}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTablaMacronutrientes(macros) {
  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-primary">
          <tr>
            <th>Macronutriente</th>
            <th>%</th>
            <th>Kcal</th>
            <th>Gramos Totales</th>
            <th>g/kg</th>
          </tr>
        </thead>
        <tbody>
          ${(macros || []).map(item => `
            <tr>
              <td>${citaEscape(item.macronutriente)}</td>
              <td>${citaEscape(item.porcentaje)}</td>
              <td>${citaEscape(item.kcal)}</td>
              <td>${citaEscape(item.gramos)}</td>
              <td>${citaEscape(item.gkg)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTablaAlimentos(alimentosPorTiempo, horasComida) {
  const filas = [];
  const columnas = CAMPOS_NUTRIENTES.length + 2;
  obtenerTiemposCita().forEach(tiempo => {
    filas.push(`<tr class="table-info"><td colspan="${columnas}"><strong>${citaEscape(obtenerEtiquetaTiempoCita(tiempo, horasComida))}</strong></td></tr>`);
    const items = alimentosPorTiempo && alimentosPorTiempo[tiempo] ? alimentosPorTiempo[tiempo] : [];
    if (!items.length) {
      filas.push(`<tr><td colspan="${columnas}" class="text-muted">Sin alimentos.</td></tr>`);
      return;
    }

    items.forEach(item => {
      filas.push(`
        <tr>
          <td>${citaEscape(item.nombre)}</td>
          <td>${citaFormatearNumero(item.gramos)} g</td>
          ${CAMPOS_NUTRIENTES.map(([campo]) => `<td>${citaFormatearNumero(item[campo])}</td>`).join("")}
        </tr>
      `);
    });
  });

  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-primary">
          <tr>
            <th>Alimento</th>
            <th>Gramos</th>
            ${CAMPOS_NUTRIENTES.map(([, label]) => `<th>${citaEscape(label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${filas.join("")}</tbody>
      </table>
    </div>
  `;
}

function renderHorariosComidaCita(horasComida) {
  const horas = horasComida && typeof horasComida === "object" ? horasComida : {};
  const tieneHoras = obtenerTiemposCita().some(tiempo => Boolean(horas[tiempo]));

  if (!tieneHoras) {
    return '<p class="text-muted mb-0">Sin horarios de comida registrados.</p>';
  }

  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered cita-medidas-table">
        <thead class="table-primary">
          <tr>
            <th>Tiempo de comida</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          ${obtenerTiemposCita().map(tiempo => `
            <tr>
              <td>${citaEscape(tiempo)}</td>
              <td>${citaEscape(horas[tiempo] || "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderIndiceMasaCorporalCita(imc) {
  const datos = imc && imc.valido ? imc : null;
  const grafico = datos ? obtenerSvgSeguroCita(datos.grafico_svg) : "";

  return `
    <div class="cita-imc-layout">
      <div class="cita-imc-summary">
        <div><span>IMC</span><strong>${datos ? citaFormatearNumero(datos.valor) : "--"}</strong></div>
        <div><span>Clasificaci&oacute;n</span><strong>${datos ? citaEscape(datos.clasificacion) : "--"}</strong></div>
        <div><span>Peso</span><strong>${datos ? `${citaFormatearNumero(datos.peso)} kg` : "--"}</strong></div>
        <div><span>Estatura</span><strong>${datos ? `${citaFormatearNumero(datos.estatura_m)} m` : "--"}</strong></div>
      </div>
      <div class="cita-imc-chart-panel">
        ${grafico || '<p class="text-muted mb-0">Esta cita no tiene grafico de IMC guardado.</p>'}
      </div>
    </div>
  `;
}

function renderMedidasAntropometricasCita(medidas) {
  const datos = medidas && typeof medidas === "object" ? medidas : {};
  const tieneMedidas = CAMPOS_MEDIDAS_CITA.some(([campo]) => datos[campo] !== null && datos[campo] !== undefined && datos[campo] !== "");
  const observaciones = String(datos.observaciones || "").trim();

  if (!tieneMedidas && !observaciones) {
    return '<p class="text-muted mb-0">Sin medidas corporales registradas.</p>';
  }

  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered cita-medidas-table">
        <thead class="table-primary">
          <tr>
            <th>Medida</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${CAMPOS_MEDIDAS_CITA.map(([campo, label]) => `
            <tr>
              <td>${citaEscape(label)}</td>
              <td>${datos[campo] !== null && datos[campo] !== undefined && datos[campo] !== "" ? `${citaFormatearNumero(datos[campo])} cm` : ""}</td>
            </tr>
          `).join("")}
          ${observaciones ? `
            <tr>
              <td>Observaciones</td>
              <td>${citaEscape(observaciones)}</td>
            </tr>
          ` : ""}
        </tbody>
      </table>
    </div>
  `;
}

function renderDetalleCita(cita) {
  const detalle = document.getElementById("cita_detalle");
  if (!detalle) return;

  const snapshot = cita.snapshot || {};
  const paciente = snapshot.paciente || {};
  const profesional = snapshot.profesional || {};
  const imc = obtenerImcDesdeSnapshot(snapshot);
  const totales = snapshot.totales || {};
  const horasComida = snapshot.horas_comida || {};
  const filasTotales = [];

  obtenerTiemposCita().forEach(tiempo => {
    filasTotales.push({ nombre: obtenerEtiquetaTiempoCita(tiempo, horasComida), ...(totales.subtotales ? totales.subtotales[tiempo] : {}) });
  });
  filasTotales.push({ nombre: "Total", ...(totales.total || {}) });
  filasTotales.push({ nombre: "Requerimiento", ...(totales.requerimiento || {}) });
  filasTotales.push({ nombre: "% Adecuaci\u00f3n", ...(totales.adecuacion || {}) });

  detalle.innerHTML = `
    <div class="card p-3 cita-detail-section">
      <h5>Datos del paciente</h5>
      <div class="row g-2">
        <div class="col-md-4"><strong>Nombre:</strong> ${citaEscape(paciente.nombre)}</div>
        <div class="col-md-4"><strong>C&eacute;dula/Pasaporte:</strong> ${citaEscape(paciente.documento)}</div>
        <div class="col-md-4"><strong>Fecha:</strong> ${citaEscape(citaFormatearFecha(paciente.fecha_evaluacion || cita.fecha_cita))}</div>
        <div class="col-md-4"><strong>Fecha de nacimiento:</strong> ${citaEscape(citaFormatearFecha(paciente.fecha_nacimiento))}</div>
        <div class="col-md-4"><strong>Pa&iacute;s de nacimiento:</strong> ${citaEscape(paciente.pais_nacimiento)}</div>
        <div class="col-md-4"><strong>Actividad:</strong> ${citaEscape(paciente.actividad_texto || paciente.actividad)}</div>
        <div class="col-md-3"><strong>Peso:</strong> ${citaEscape(paciente.peso)} kg</div>
        <div class="col-md-3"><strong>Peso ideal:</strong> ${citaEscape(paciente.peso_ideal || paciente.peso)} kg</div>
        <div class="col-md-3"><strong>Estatura:</strong> ${citaEscape(paciente.estatura)} cm</div>
        <div class="col-md-3"><strong>Edad:</strong> ${citaEscape(paciente.edad)}</div>
        <div class="col-md-3"><strong>Sexo:</strong> ${citaEscape(paciente.sexo || paciente.genero_texto || paciente.genero)}</div>
        <div class="col-md-3"><strong>Usuario:</strong> ${citaEscape(profesional.usuario)}</div>
        <div class="col-md-3"><strong>Profesional:</strong> ${citaEscape(profesional.nombre)}</div>
        <div class="col-md-3"><strong>Correo usuario:</strong> ${citaEscape(profesional.email)}</div>
      </div>
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>&Iacute;ndice de masa corporal</h5>
      ${renderIndiceMasaCorporalCita(imc)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Medidas corporales</h5>
      ${renderMedidasAntropometricasCita(paciente.medidas_antropometricas)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Macronutrientes</h5>
      ${renderTablaMacronutrientes(snapshot.macronutrientes)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Horarios de comida</h5>
      ${renderHorariosComidaCita(horasComida)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Alimentos seleccionados</h5>
      ${renderTablaAlimentos(snapshot.alimentos_por_tiempo, horasComida)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Totales, requerimiento y adecuaci&oacute;n</h5>
      ${tablaObjetoNutricional("Concepto", filasTotales)}
    </div>
  `;
}

function configurarCitas() {
  const guardarBtn = document.getElementById("guardar_cita_btn");
  const recargarBtn = document.getElementById("citas_recargar");
  const filtro = document.getElementById("citas_filtro");

  if (guardarBtn) guardarBtn.addEventListener("click", guardarCita);
  if (recargarBtn) recargarBtn.addEventListener("click", cargarCitas);
  if (filtro) {
    filtro.addEventListener("input", event => {
      filtroCitas = event.target.value;
      renderCitasTabla();
    });
  }

  window.addEventListener("auth:session-changed", cargarCitas);
  cargarCitas();
}

document.addEventListener("DOMContentLoaded", configurarCitas);
