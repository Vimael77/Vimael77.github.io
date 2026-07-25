let citas = [];
let filtroCitas = "";
let filtroCitasFechaDesde = "";
let filtroCitasFechaHasta = "";
let paginaCitasActual = 1;
let citasSeleccionadas = new Set();
let citaEditandoId = "";
const CITAS_POR_PAGINA = 15;
const MEDIDAS_EVOLUCION = {
  cintura: "Cintura",
  abdomen_bajo: "Abdomen bajo",
  cadera: "Cadera",
  brazo_izquierdo: "Brazo izquierdo",
  brazo_derecho: "Brazo derecho",
  muslo_izquierdo: "Muslo izquierdo",
  muslo_derecho: "Muslo derecho",
  pantorrilla_izquierda: "Pantorrilla izquierda",
  pantorrilla_derecha: "Pantorrilla derecha"
};

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
  ["cintura", "Cintura"],
  ["abdomen_bajo", "Abdomen bajo"],
  ["cadera", "Cadera"],
  ["muslo_izquierdo", "Muslo izquierdo"],
  ["muslo_derecho", "Muslo derecho"],
  ["pantorrilla_izquierda", "Pantorrilla izquierda"],
  ["pantorrilla_derecha", "Pantorrilla derecha"]
];

const CAMPOS_BIA_CITA = [
  ["bia_masa_muscular_kg", "Masa muscular total", "kg"],
  ["bia_masa_muscular_brazo_izquierdo_kg", "Masa muscular - brazo izquierdo", "kg"],
  ["bia_masa_muscular_brazo_derecho_kg", "Masa muscular - brazo derecho", "kg"],
  ["bia_masa_muscular_tronco_kg", "Masa muscular - tronco", "kg"],
  ["bia_masa_muscular_pierna_izquierda_kg", "Masa muscular - pierna izquierda", "kg"],
  ["bia_masa_muscular_pierna_derecha_kg", "Masa muscular - pierna derecha", "kg"],
  ["bia_masa_grasa_pct", "Masa grasa total", "%"],
  ["bia_masa_grasa_brazo_izquierdo_pct", "Masa grasa - brazo izquierdo", "%"],
  ["bia_masa_grasa_brazo_derecho_pct", "Masa grasa - brazo derecho", "%"],
  ["bia_masa_grasa_tronco_pct", "Masa grasa - tronco", "%"],
  ["bia_masa_grasa_pierna_izquierda_pct", "Masa grasa - pierna izquierda", "%"],
  ["bia_masa_grasa_pierna_derecha_pct", "Masa grasa - pierna derecha", "%"],
  ["bia_grasa_visceral_pct", "Masa grasa visceral", "%"],
  ["bia_agua_corporal_pct", "Agua corporal", "%"],
  ["bia_geb_kcal", "Gasto energético basal (GEB)", "kcal"],
  ["bia_masa_osea_kg", "Masa ósea", "kg"],
  ["bia_edad_anios", "Edad según BIA", "años"]
];

const COLUMNAS_HORARIOS_CITA = [
  ["Desayuno", "hora_desayuno"],
  ["Media Ma\u00f1ana", "hora_media_manana"],
  ["Almuerzo", "hora_almuerzo"],
  ["Media Tarde", "hora_media_tarde"],
  ["Merienda", "hora_merienda"],
  ["Cena", "hora_cena"]
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

function obtenerCamposNutrientesVisiblesCita(datos) {
  return CAMPOS_NUTRIENTES;
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
      clasificacion: ""
    };
  }

  return {
    valido: true,
    peso: citaNumero(datos.peso),
    estatura_cm: citaNumero(citaValor("calc_estatura")),
    estatura_m: citaNumero(datos.estaturaMetros),
    valor: citaNumero(datos.imc),
    clasificacion: datos.clasificacion || ""
  };
}

function obtenerImcDesdeDatosCita(datos) {
  if (datos && datos.imc && datos.imc.valido) return datos.imc;

  const paciente = datos && datos.paciente ? datos.paciente : {};
  const peso = citaNumero(paciente.peso);
  const estaturaCm = citaNumero(paciente.estatura);
  const estaturaM = estaturaCm > 3 ? estaturaCm / 100 : estaturaCm;
  const imc = peso > 0 && estaturaM > 0 ? peso / (estaturaM * estaturaM) : 0;

  if (!imc || !Number.isFinite(imc)) {
    return { valido: false, peso, estatura_cm: estaturaCm, estatura_m: estaturaM, valor: 0, clasificacion: "" };
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
    clasificacion
  };
}

function obtenerSvgSeguroCita(svg) {
  const contenido = String(svg || "").trim();
  if (!contenido || !/^<svg[\s>]/i.test(contenido)) return "";
  if (/<script|<foreignObject|javascript:|on[a-z]+\s*=/i.test(contenido)) return "";

  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return contenido;
  }

  try {
    const documento = new DOMParser().parseFromString(contenido, "image/svg+xml");
    const svgNormalizado = documento.documentElement;
    if (!svgNormalizado || svgNormalizado.tagName.toLowerCase() !== "svg") return "";

    const prefijo = `cita_render_${Date.now()}_${Math.random().toString(36).slice(2)}_`;
    const idMap = {};

    [svgNormalizado].concat(Array.from(svgNormalizado.querySelectorAll("[id]"))).forEach(elemento => {
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
          .split(`url(${idAnterior})`).join(`url(${idMap[idAnterior]})`)
          .split(`url(#${idAnterior})`).join(`url(#${idMap[idAnterior]})`)
          .split(idAnterior).join(idMap[idAnterior]);
      });
      return salida;
    };

    [svgNormalizado].concat(Array.from(svgNormalizado.querySelectorAll("*"))).forEach(elemento => {
      Array.from(elemento.attributes).forEach(attr => {
        if (attr.name === "id") return;
        if (Object.keys(idMap).some(idAnterior => attr.value.includes(idAnterior))) {
          elemento.setAttribute(attr.name, actualizarReferencia(attr.value));
        }
      });
    });

    const clipPath = Array.from(svgNormalizado.querySelectorAll("clipPath")).find(elemento => {
      return elemento.id && elemento.id.endsWith("imc_plot_clip");
    });
    const bandas = Array.from(svgNormalizado.querySelectorAll("g")).find(elemento => {
      return elemento.id && elemento.id.endsWith("imc_chart_bands");
    });
    if (clipPath && bandas) {
      bandas.setAttribute("clip-path", `url(#${clipPath.id})`);
    }

    svgNormalizado.classList.add("cita-imc-chart-svg");
    svgNormalizado.removeAttribute("width");
    svgNormalizado.removeAttribute("height");
    svgNormalizado.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgNormalizado.setAttribute("focusable", "false");
    svgNormalizado.style.overflow = "hidden";

    return new XMLSerializer().serializeToString(svgNormalizado);
  } catch (error) {
    console.warn("No se pudo normalizar el grafico de IMC de la cita.", error);
    return contenido;
  }
}

async function obtenerProfesionalCita(session) {
  const user = session && session.user ? session.user : null;
  if (!user) return {};

  const profesional = {
    user_id: user.id,
    email: user.email || "",
    usuario: user.user_metadata && (user.user_metadata.nombre_usuario || user.user_metadata.usuario)
      ? user.user_metadata.nombre_usuario || user.user_metadata.usuario
      : "",
    nombre: "",
    telefono: ""
  };

  const client = window.supabaseClient;
  if (!client) return profesional;

  const { data, error } = await client
    .from("profiles")
    .select("nombre_usuario,nombre,telefono")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data) {
    profesional.usuario = data.nombre_usuario || profesional.usuario;
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
      alimento_id: item.alimento_id || item.id || null,
      nombre: item.nombre || "",
      gramos: citaNumero(item.gramos)
    });
  }

  return porTiempo;
}

function calcularEdadEnFechaCita(fechaNacimiento, fechaEvaluacion) {
  if (!fechaNacimiento || !fechaEvaluacion) return "";
  const nacimiento = new Date(`${String(fechaNacimiento).slice(0, 10)}T00:00:00`);
  const evaluacion = new Date(`${String(fechaEvaluacion).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime()) || Number.isNaN(evaluacion.getTime())) return "";

  let edad = evaluacion.getFullYear() - nacimiento.getFullYear();
  const mes = evaluacion.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && evaluacion.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 ? edad : "";
}

function obtenerGeneroDesdeSexoCita(sexo) {
  const normalizado = citaNormalizar(sexo);
  if (normalizado === "masculino") return "M";
  if (normalizado === "femenino") return "F";
  return "";
}

function formatearNumeroMacroCita(value, decimales = 2) {
  const numero = citaNumeroOpcional(value, decimales);
  return numero === null ? "" : numero.toFixed(decimales);
}

function citaNumeroOpcional(value, decimales = 2) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const numero = parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(numero)) return null;
  return Number(numero.toFixed(decimales));
}

function citaEnteroOpcional(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const numero = parseInt(String(value), 10);
  return Number.isFinite(numero) ? numero : null;
}

function citaJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function normalizarMedidasCita(medidas) {
  const datos = medidas && typeof medidas === "object" ? { ...medidas } : {};
  if (datos.cintura === undefined && datos.abdomen !== undefined) {
    datos.cintura = datos.abdomen;
  }
  if (datos.abdomen_bajo === undefined && datos.cintura_baja !== undefined) {
    datos.abdomen_bajo = datos.cintura_baja;
  }
  return datos;
}

function obtenerPacienteLocalCita(pacienteId) {
  if (!pacienteId || typeof pacientes === "undefined" || !Array.isArray(pacientes)) return null;
  return pacientes.find(item => String(item.id) === String(pacienteId)) || null;
}

function obtenerNombreCompletoPacienteCita(paciente) {
  if (!paciente) return "";
  return `${paciente.nombres || ""} ${paciente.apellidos || ""}`.trim();
}

function normalizarAlimentosRelacionalesCita(value) {
  const datos = Array.isArray(value) ? value : [];
  const salida = {};
  obtenerTiemposCita().forEach(tiempo => {
    salida[tiempo] = [];
  });

  datos
    .slice()
    .sort((a, b) => {
      const tiempoA = String(a && a.tiempo ? a.tiempo : "");
      const tiempoB = String(b && b.tiempo ? b.tiempo : "");
      if (tiempoA !== tiempoB) return tiempoA.localeCompare(tiempoB);
      return citaNumero(a && a.orden) - citaNumero(b && b.orden);
    })
    .forEach(item => {
      const tiempo = item && item.tiempo ? item.tiempo : "Desayuno";
      const destino = Object.prototype.hasOwnProperty.call(salida, tiempo) ? tiempo : tiempo || "Desayuno";
      if (!Object.prototype.hasOwnProperty.call(salida, destino)) salida[destino] = [];
      salida[destino].push({
        alimento_id: item ? item.alimento_id || item.id || null : null,
        nombre: item ? item.alimento_nombre || item.nombre || "" : "",
        gramos: citaNumero(item ? item.gramos : 0)
      });
    });

  return salida;
}

function normalizarHorariosTablaUnicaCita(cita) {
  const salida = {};

  COLUMNAS_HORARIOS_CITA.forEach(([tiempo, columna]) => {
    const valor = cita && cita[columna] ? String(cita[columna]).slice(0, 5) : "";
    salida[tiempo] = valor;
  });

  obtenerTiemposCita().forEach(tiempo => {
    if (!Object.prototype.hasOwnProperty.call(salida, tiempo)) salida[tiempo] = "";
  });

  return salida;
}

function normalizarColumnasTablaUnicaCita(value) {
  return citaJsonArray(value)
    .map(columna => String(columna || "").trim())
    .filter(Boolean);
}

function formatearMacroTablaUnicaCita(value, unidad) {
  const texto = String(value ?? "").trim();
  if (!texto) return "";
  if (unidad === "%" && texto.includes("%")) return texto;
  if (unidad !== "%" && texto.toLowerCase().includes(unidad.toLowerCase())) return texto;

  const numero = formatearNumeroMacroCita(value);
  if (!numero) return texto;
  return unidad === "%" ? `${numero}%` : `${numero} ${unidad}`;
}

function normalizarMacronutrientesTablaUnicaCita(cita) {
  const energia = citaNumeroOpcional(cita ? cita.req_energia_calculada : null, 4);
  const pesoReferencia = citaNumeroOpcional(cita ? cita.peso_ideal || cita.peso : null, 4);
  const proteinaPorcentaje = citaNumeroOpcional(cita ? cita.macro_proteina_porcentaje : null, 4);
  const grasaPorcentaje = citaNumeroOpcional(cita ? cita.macro_grasa_porcentaje : null, 4);
  const carbohidratosPorcentaje = proteinaPorcentaje !== null && grasaPorcentaje !== null
    ? Math.max(0, 100 - proteinaPorcentaje - grasaPorcentaje)
    : null;

  const crearMacro = (macronutriente, porcentaje, kcalPorGramo) => {
    const kcal = energia !== null && porcentaje !== null ? citaNumeroOpcional((energia * porcentaje) / 100, 4) : null;
    const gramos = kcal !== null ? citaNumeroOpcional(kcal / kcalPorGramo, 4) : null;
    const gkg = gramos !== null && pesoReferencia !== null && pesoReferencia > 0
      ? citaNumeroOpcional(gramos / pesoReferencia, 4)
      : null;

    return {
      macronutriente,
      porcentaje: porcentaje === null ? "" : formatearMacroTablaUnicaCita(porcentaje, "%"),
      kcal: kcal === null ? "" : formatearMacroTablaUnicaCita(kcal, "kcal"),
      gramos: gramos === null ? "" : formatearMacroTablaUnicaCita(gramos, "g"),
      gkg: gkg === null ? "" : formatearMacroTablaUnicaCita(gkg, "g/kg")
    };
  };

  return [
    crearMacro("Proteinas", proteinaPorcentaje, 4),
    crearMacro("Grasas", grasaPorcentaje, 9),
    crearMacro("Carbohidratos", carbohidratosPorcentaje, 4)
  ];
}

function obtenerRequerimientoTablaUnicaCita(cita) {
  const requerimiento = {};
  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    requerimiento[campo] = citaNumero(cita ? cita[`req_${campo}`] : 0);
  });
  return requerimiento;
}

function obtenerFilaCitaTablaUnica(datos) {
  const paciente = datos && datos.paciente ? datos.paciente : {};
  const profesional = datos && datos.profesional ? datos.profesional : {};
  const medidas = normalizarMedidasCita(paciente.medidas_antropometricas);
  const imc = obtenerImcDesdeDatosCita(datos);
  const requerimiento = datos && datos.totales && datos.totales.requerimiento
    ? datos.totales.requerimiento
    : {};
  const macronutrientes = Array.isArray(datos.macronutrientes) ? datos.macronutrientes : [];
  const macronutrientesPorNombre = new Map(macronutrientes.map(item => [
    citaNormalizar(item && item.macronutriente),
    item || {}
  ]));
  const horasComida = datos.horas_comida && typeof datos.horas_comida === "object"
    ? datos.horas_comida
    : {};
  const fila = {
    paciente_id: paciente.paciente_id,
    fecha_cita: paciente.fecha_evaluacion || new Date().toISOString().slice(0, 10),
    cita_schema_version: 18,
    actividad: citaNumeroOpcional(paciente.actividad, 4),
    actividad_texto: paciente.actividad_texto || "",
    profesional_user_id: profesional.user_id || null,
    profesional_email: profesional.email || "",
    profesional_nombre: profesional.nombre || "",
    profesional_usuario: profesional.usuario || "",
    profesional_telefono: profesional.telefono || "",
    peso: citaNumeroOpcional(paciente.peso ?? imc.peso),
    peso_ideal: citaNumeroOpcional(paciente.peso_ideal),
    estatura_cm: citaNumeroOpcional(paciente.estatura ?? imc.estatura_cm),
    imc: imc && imc.valido ? citaNumeroOpcional(imc.valor, 4) : null,
    clasificacion_imc: imc && imc.valido ? String(imc.clasificacion || "") : "",
    brazo_izquierdo: citaNumeroOpcional(medidas.brazo_izquierdo),
    brazo_derecho: citaNumeroOpcional(medidas.brazo_derecho),
    cintura: citaNumeroOpcional(medidas.cintura),
    abdomen_bajo: citaNumeroOpcional(medidas.abdomen_bajo),
    cadera: citaNumeroOpcional(medidas.cadera),
    muslo_izquierdo: citaNumeroOpcional(medidas.muslo_izquierdo),
    muslo_derecho: citaNumeroOpcional(medidas.muslo_derecho),
    pantorrilla_izquierda: citaNumeroOpcional(medidas.pantorrilla_izquierda),
    pantorrilla_derecha: citaNumeroOpcional(medidas.pantorrilla_derecha),
    observaciones: String(medidas.observaciones || "").trim()
  };

  CAMPOS_BIA_CITA.forEach(([campo]) => {
    fila[campo] = citaNumeroOpcional(datos.bia ? datos.bia[campo] : null);
  });

  const macroProteina = macronutrientesPorNombre.get(citaNormalizar("Proteinas")) || {};
  const macroGrasa = macronutrientesPorNombre.get(citaNormalizar("Grasas")) || {};
  fila.macro_proteina_porcentaje = citaNumeroOpcional(macroProteina.porcentaje, 4);
  fila.macro_grasa_porcentaje = citaNumeroOpcional(macroGrasa.porcentaje, 4);

  COLUMNAS_HORARIOS_CITA.forEach(([tiempo, columna]) => {
    const hora = horasComida[tiempo] ? String(horasComida[tiempo]).slice(0, 5) : "";
    fila[columna] = hora || null;
  });

  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    fila[`req_${campo}`] = citaNumeroOpcional(requerimiento[campo], 4);
  });

  return fila;
}

function obtenerFilasAlimentosRelacionalesCita(citaId, alimentosPorTiempo) {
  const filas = [];
  const datos = alimentosPorTiempo && typeof alimentosPorTiempo === "object"
    ? alimentosPorTiempo
    : {};

  obtenerTiemposCita().forEach(tiempo => {
    const items = Array.isArray(datos[tiempo]) ? datos[tiempo] : [];
    items.forEach((item, index) => {
      if (!item) return;
      const nombre = String(item.nombre || item.alimento_nombre || "").trim();
      const alimentoId = citaEnteroOpcional(item.alimento_id || item.id);
      const gramos = citaNumeroOpcional(item.gramos, 4) || 0;
      if (!nombre && alimentoId === null && gramos <= 0) return;

      filas.push({
        cita_id: citaId,
        alimento_id: alimentoId,
        alimento_nombre: nombre || "Alimento sin nombre",
        tiempo,
        gramos,
        orden: index + 1
      });
    });
  });

  return filas;
}

function integrarDatosTablaUnicaCita(cita) {
  const resultado = { ...cita };
  const paciente = obtenerPacienteLocalCita(cita.paciente_id);
  const nombreCompleto = obtenerNombreCompletoPacienteCita(paciente);
  const fechaNacimiento = paciente ? paciente.fecha_nacimiento || "" : "";
  const sexo = paciente ? paciente.sexo || "" : "";
  const documento = paciente ? paciente.documento || "" : "";
  const paisNacimiento = paciente ? paciente.pais_nacimiento || "" : "";
  const genero = obtenerGeneroDesdeSexoCita(sexo);
  const estaturaCm = citaNumeroOpcional(cita.estatura_cm);
  const valorImc = citaNumeroOpcional(cita.imc, 4);

  const datos = {
    version: cita.cita_schema_version || 12,
    guardado_en: cita.created_at || "",
    paciente: {
      paciente_id: cita.paciente_id || null,
      nombre: nombreCompleto,
      nombres: paciente ? paciente.nombres || "" : "",
      apellidos: paciente ? paciente.apellidos || "" : "",
      documento,
      fecha_nacimiento: fechaNacimiento,
      pais_nacimiento: paisNacimiento,
      sexo,
      fecha_evaluacion: cita.fecha_cita || "",
      edad: calcularEdadEnFechaCita(fechaNacimiento, cita.fecha_cita),
      genero,
      genero_texto: sexo,
      actividad: cita.actividad ?? "",
      actividad_texto: cita.actividad_texto || "",
      peso: cita.peso ?? "",
      peso_ideal: cita.peso_ideal ?? "",
      estatura: cita.estatura_cm ?? "",
      medidas_antropometricas: {
        brazo_izquierdo: cita.brazo_izquierdo,
        brazo_derecho: cita.brazo_derecho,
        cintura: cita.cintura ?? cita.abdomen,
        abdomen_bajo: cita.abdomen_bajo ?? cita.cintura_baja,
        cadera: cita.cadera,
        muslo_izquierdo: cita.muslo_izquierdo,
        muslo_derecho: cita.muslo_derecho,
        pantorrilla_izquierda: cita.pantorrilla_izquierda,
        pantorrilla_derecha: cita.pantorrilla_derecha,
        observaciones: cita.observaciones || ""
      }
    },
    profesional: {
      user_id: cita.profesional_user_id || cita.user_id || "",
      email: cita.profesional_email || "",
      nombre: cita.profesional_nombre || "",
      usuario: cita.profesional_usuario || "",
      telefono: cita.profesional_telefono || ""
    },
    imc: {
      valido: valorImc !== null && valorImc > 0,
      peso: citaNumeroOpcional(cita.peso),
      estatura_cm: estaturaCm,
      estatura_m: estaturaCm !== null ? citaNumeroOpcional(estaturaCm / 100, 4) : null,
      valor: valorImc,
      clasificacion: cita.clasificacion_imc || ""
    },
    bia: Object.fromEntries(CAMPOS_BIA_CITA.map(([campo]) => [campo, cita[campo]])),
    configuracion: {},
    macronutrientes: normalizarMacronutrientesTablaUnicaCita(cita),
    horas_comida: normalizarHorariosTablaUnicaCita(cita),
    alimentos_por_tiempo: normalizarAlimentosRelacionalesCita(cita.cita_alimentos),
    totales: {
      requerimiento: obtenerRequerimientoTablaUnicaCita(cita)
    }
  };

  resultado.datos = datos;
  resultado.paciente_nombre = datos.paciente.nombre || "";
  resultado.paciente_documento = datos.paciente.documento || "";
  return resultado;
}

function obtenerIndiceAlimentosCita() {
  const base = Array.isArray(window.alimentos)
    ? window.alimentos
    : (typeof alimentos !== "undefined" && Array.isArray(alimentos) ? alimentos : []);
  const porId = new Map();
  const porNombre = new Map();

  base.forEach(alimento => {
    if (!alimento) return;
    const id = alimento.alimento_id || alimento.id;
    if (id !== null && id !== undefined) porId.set(String(id), alimento);
    if (alimento.nombre) porNombre.set(citaNormalizar(alimento.nombre), alimento);
  });

  return { porId, porNombre };
}

function buscarAlimentoBaseCita(item, indice) {
  if (!item || !indice) return null;
  const id = item.alimento_id || item.id;
  if (id !== null && id !== undefined && indice.porId.has(String(id))) {
    return indice.porId.get(String(id));
  }

  const nombre = citaNormalizar(item.nombre);
  return nombre ? indice.porNombre.get(nombre) || null : null;
}

function alimentoDatosTieneNutrientesCita(item) {
  return Boolean(item && CAMPOS_NUTRIENTES.some(([campo]) => item[campo] !== null && item[campo] !== undefined));
}

function hidratarAlimentoDatosCita(item, indice) {
  const datos = item && typeof item === "object" ? item : {};
  if (alimentoDatosTieneNutrientesCita(datos)) return { ...datos };

  const base = buscarAlimentoBaseCita(datos, indice) || {};
  const gramos = citaNumero(datos.gramos);
  const factor = gramos > 0 ? gramos / 100 : 0;
  const hidratado = {
    alimento_id: datos.alimento_id || datos.id || base.alimento_id || base.id || null,
    nombre: datos.nombre || base.nombre || "",
    gramos
  };

  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    hidratado[campo] = citaNumero(base[campo]) * factor;
  });

  return hidratado;
}

function hidratarAlimentosPorTiempoCita(alimentosPorTiempo) {
  const hidratados = {};
  const indice = obtenerIndiceAlimentosCita();

  obtenerTiemposCita().forEach(tiempo => {
    const items = alimentosPorTiempo && Array.isArray(alimentosPorTiempo[tiempo])
      ? alimentosPorTiempo[tiempo]
      : [];
    hidratados[tiempo] = items.map(item => hidratarAlimentoDatosCita(item, indice));
  });

  return hidratados;
}

function crearNutricionCeroCita() {
  const salida = {};
  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    salida[campo] = 0;
  });
  return salida;
}

function calcularTotalesDesdeAlimentosCita(alimentosPorTiempo, requerimientoEntrada) {
  const subtotales = {};
  const total = crearNutricionCeroCita();
  const requerimiento = citaClonarNutricion(requerimientoEntrada || {});
  const adecuacion = {};

  obtenerTiemposCita().forEach(tiempo => {
    subtotales[tiempo] = crearNutricionCeroCita();
    const items = alimentosPorTiempo && Array.isArray(alimentosPorTiempo[tiempo])
      ? alimentosPorTiempo[tiempo]
      : [];

    items.forEach(item => {
      CAMPOS_NUTRIENTES.forEach(([campo]) => {
        const valor = citaNumero(item ? item[campo] : 0);
        subtotales[tiempo][campo] += valor;
        total[campo] += valor;
      });
    });
  });

  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    const base = citaNumero(requerimiento[campo]);
    adecuacion[campo] = base > 0 ? citaNumero((total[campo] / base) * 100) : 0;
  });

  return {
    subtotales,
    total,
    total_kilocalorias: {
      proteina: citaNumero(total.proteina * 4),
      grasa_total: citaNumero(total.grasa_total * 9),
      carbohidratos: citaNumero(total.carbohidratos * 4)
    },
    requerimiento,
    adecuacion
  };
}

function hidratarTotalesCita(totales, alimentosPorTiempo) {
  const datos = totales && typeof totales === "object" ? totales : {};
  if (datos.subtotales && datos.total && datos.adecuacion) return datos;
  return calcularTotalesDesdeAlimentosCita(alimentosPorTiempo, datos.requerimiento);
}

function obtenerTotalesCita() {
  if (typeof calcular === "function") calcular();
  if (typeof total_kilocalorias === "function") total_kilocalorias();

  return {
    requerimiento: citaClonarNutricion(typeof alimentos_requerimiento !== "undefined" ? alimentos_requerimiento : {})
  };
}

function obtenerDatosBiaCita() {
  return Object.fromEntries(CAMPOS_BIA_CITA.map(([campo]) => [
    campo,
    citaNumeroOpcional(citaValor(campo))
  ]));
}

function aplicarDatosBiaCita(datos) {
  const valores = datos && typeof datos === "object" ? datos : {};
  CAMPOS_BIA_CITA.forEach(([campo]) => asignarValorCita(campo, valores[campo]));
}

function obtenerDatosCita() {
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
    version: 18,
    guardado_en: new Date().toISOString(),
    paciente,
    profesional: {},
    imc: obtenerImcCita(),
    bia: obtenerDatosBiaCita(),
    configuracion: {},
    macronutrientes: obtenerMacronutrientesCita(),
    horas_comida: obtenerHorasComidaCita(),
    alimentos_por_tiempo: obtenerAlimentosPorTiempoCita(),
    totales: obtenerTotalesCita()
  };
}

function obtenerDialogoGuardarCita() {
  let dialogo = document.getElementById("cita_guardar_dialogo");
  if (dialogo) return dialogo;

  dialogo = document.createElement("div");
  dialogo.id = "cita_guardar_dialogo";
  dialogo.className = "cita-confirm-overlay";
  dialogo.innerHTML = `
    <div class="cita-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="cita_guardar_titulo">
      <div class="cita-confirm-icon" aria-hidden="true">&#10003;</div>
      <div class="cita-confirm-content">
        <h4 id="cita_guardar_titulo">Guardar cita</h4>
        <p>Se guardara una copia de esta evaluacion para consultarla despues.</p>
        <div class="cita-confirm-actions">
          <button type="button" class="btn btn-outline-secondary cita-confirm-cancel">Cancelar</button>
          <button type="button" class="btn btn-success cita-confirm-accept">Guardar cita</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(dialogo);
  return dialogo;
}

function confirmarGuardarCita() {
  const dialogo = obtenerDialogoGuardarCita();
  const aceptar = dialogo.querySelector(".cita-confirm-accept");
  const cancelar = dialogo.querySelector(".cita-confirm-cancel");
  const titulo = dialogo.querySelector("#cita_guardar_titulo");
  const descripcion = dialogo.querySelector(".cita-confirm-content p");
  const editando = Boolean(citaEditandoId);

  if (titulo) titulo.textContent = editando ? "Actualizar cita" : "Guardar cita";
  if (descripcion) {
    descripcion.textContent = editando
      ? "Se reemplazaran los datos guardados de esta cita con la informacion actual de la calculadora."
      : "Se guardara una copia de esta evaluacion para consultarla despues.";
  }
  if (aceptar) aceptar.textContent = editando ? "Actualizar cita" : "Guardar cita";

  return new Promise(resolve => {
    const cerrar = resultado => {
      dialogo.classList.remove("is-open");
      document.removeEventListener("keydown", manejarTecla);
      aceptar.onclick = null;
      cancelar.onclick = null;
      dialogo.onclick = null;
      resolve(resultado);
    };

    const manejarTecla = event => {
      if (event.key === "Escape") cerrar(false);
    };

    aceptar.onclick = () => cerrar(true);
    cancelar.onclick = () => cerrar(false);
    dialogo.onclick = event => {
      if (event.target === dialogo) cerrar(false);
    };

    document.addEventListener("keydown", manejarTecla);
    dialogo.classList.add("is-open");
    setTimeout(() => aceptar.focus(), 0);
  });
}

async function guardarCita() {
  const client = window.supabaseClient;
  if (!client) return;

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    alert("Debes iniciar sesion para guardar la cita.");
    return;
  }

  const datos = obtenerDatosCita();
  datos.profesional = await obtenerProfesionalCita(sessionData.session);
  const pacienteSeleccionado = datos.paciente.paciente_id
    && typeof pacientes !== "undefined"
    && Array.isArray(pacientes)
    ? pacientes.find(item => item.id === datos.paciente.paciente_id)
    : null;
  if (!pacienteSeleccionado) {
    alert("Debes seleccionar un paciente registrado antes de guardar la cita.");
    return;
  }

  if (!(await confirmarGuardarCita())) return;

  const boton = document.getElementById("guardar_cita_btn");
  if (boton) boton.disabled = true;

  try {
    const filaCita = obtenerFilaCitaTablaUnica(datos);
    const respuestaGuardado = citaEditandoId
      ? await client
        .from("citas")
        .update({ ...filaCita, updated_at: new Date().toISOString() })
        .eq("id", citaEditandoId)
        .select("id")
        .single()
      : await client
        .from("citas")
        .insert(filaCita)
        .select("id")
        .single();
    const citaGuardada = respuestaGuardado.data;
    const error = respuestaGuardado.error;

    if (error) {
      alert(`No se pudo guardar la cita: ${error.message}`);
      return;
    }

    if (!citaGuardada || citaGuardada.id === null || citaGuardada.id === undefined) {
      alert("La cita se guardo, pero Supabase no devolvio su identificador.");
      return;
    }

    if (citaEditandoId) {
      const { error: eliminarAlimentosError } = await client
        .from("cita_alimentos")
        .delete()
        .eq("cita_id", citaGuardada.id);

      if (eliminarAlimentosError) {
        alert(`La cita se actualizo, pero no se pudieron reemplazar sus alimentos: ${eliminarAlimentosError.message}`);
        return;
      }
    }

    const filasAlimentos = obtenerFilasAlimentosRelacionalesCita(citaGuardada.id, datos.alimentos_por_tiempo);
    if (filasAlimentos.length) {
      const { error: alimentosError } = await client
        .from("cita_alimentos")
        .insert(filasAlimentos);

      if (alimentosError) {
        if (citaEditandoId) {
          alert(`La cita se actualizo, pero no se pudieron guardar sus alimentos: ${alimentosError.message}`);
          return;
        }
        await client
          .from("citas")
          .delete()
          .eq("id", citaGuardada.id);
        alert(`No se pudieron guardar los alimentos de la cita: ${alimentosError.message}`);
        return;
      }
    }

    const estabaEditando = Boolean(citaEditandoId);
    cancelarEdicionCita(false);
    await cargarCitas();
    if (boton) {
      boton.textContent = estabaEditando ? "Cita actualizada" : "Cita guardada";
      setTimeout(() => {
        boton.textContent = "Guardar como cita";
      }, 1800);
    }
  } catch (error) {
    alert(`No se pudo guardar la cita: ${error.message}`);
  } finally {
    if (boton) boton.disabled = false;
  }
}

function actualizarModoEdicionCita() {
  const guardarBtn = document.getElementById("guardar_cita_btn");
  const cancelarBtn = document.getElementById("cancelar_edicion_cita_btn");
  if (guardarBtn) guardarBtn.textContent = citaEditandoId ? "Actualizar cita" : "Guardar como cita";
  if (cancelarBtn) cancelarBtn.hidden = !citaEditandoId;
}

function cancelarEdicionCita(mostrarAviso = true) {
  const estabaEditando = Boolean(citaEditandoId);
  citaEditandoId = "";
  actualizarModoEdicionCita();
  if (mostrarAviso && estabaEditando) {
    alert("Se cancelo la edicion. Los datos cargados permanecen en la calculadora.");
  }
}

function asignarValorCita(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.value = valor === null || valor === undefined ? "" : valor;
}

function limpiarAlimentosCalculadoraCita() {
  document.querySelectorAll('#valores tbody[id^="valores_"]').forEach(tbody => {
    tbody.innerHTML = "";
  });
  alimentos_seleccionados = [];
  alimentos_seleccionados_en_orden = [];
  actualizarTotal(alimentos_seleccionados);
  calcular();
}

function cargarAlimentosCalculadoraCita(alimentosPorTiempo) {
  limpiarAlimentosCalculadoraCita();
  const hidratados = hidratarAlimentosPorTiempoCita(alimentosPorTiempo);

  obtenerTiemposCita().forEach(tiempo => {
    (hidratados[tiempo] || []).forEach(item => {
      const gramos = citaNumero(item.gramos);
      const factor = gramos > 0 ? gramos / 100 : 1;
      const alimentoBase = {
        id: item.alimento_id || item.id || null,
        nombre: item.nombre || "Alimento sin nombre"
      };
      CAMPOS_NUTRIENTES.forEach(([campo]) => {
        alimentoBase[campo] = factor > 0 ? citaNumero(item[campo]) / factor : citaNumero(item[campo]);
      });
      agregar(gramos, alimentoBase, tiempo);
    });
  });
}

function cargarCitaEnCalculadora(cita) {
  if (!cita || !cita.datos) return;
  const datos = cita.datos;
  const paciente = datos.paciente || {};
  const requerimiento = datos.totales && datos.totales.requerimiento
    ? datos.totales.requerimiento
    : {};

  asignarValorCita("calc_fecha", paciente.fecha_evaluacion || cita.fecha_cita || "");
  aplicarPacienteEnCalculadora(paciente.paciente_id || cita.paciente_id);
  asignarValorCita("calc_peso", paciente.peso);
  asignarValorCita("calc_estatura", paciente.estatura);
  asignarValorCita("calc_actividad", paciente.actividad);
  aplicarMedidasAntropometricas(paciente.medidas_antropometricas || {});
  aplicarDatosBiaCita(datos.bia);

  asignarValorCita("macro_peso_ideal", paciente.peso_ideal);
  const macroProteina = (datos.macronutrientes || []).find(item => citaNormalizar(item.nombre) === citaNormalizar("Proteinas"));
  const macroGrasa = (datos.macronutrientes || []).find(item => citaNormalizar(item.nombre) === citaNormalizar("Grasas"));
  asignarValorCita("macro_proteina_porcentaje", macroProteina ? macroProteina.porcentaje : 20);
  asignarValorCita("macro_grasa_porcentaje", macroGrasa ? macroGrasa.porcentaje : 30);

  CAMPOS_NUTRIENTES.forEach(([campo]) => {
    asignarValorCita(`input_${campo}_requerimiento`, requerimiento[campo]);
  });

  const horas = datos.horas_comida || {};
  obtenerTiemposCita().forEach(tiempo => {
    asignarValorCita(`hora_${tiempo.replace(/\s+/g, "_")}`, horas[tiempo] || "");
  });

  cargarAlimentosCalculadoraCita(datos.alimentos_por_tiempo || {});
  if (typeof actualizarIndiceMasaCorporal === "function") actualizarIndiceMasaCorporal();
  if (typeof actualizarRequerimientoMacronutrientes === "function") actualizarRequerimientoMacronutrientes();
  if (typeof calcular === "function") calcular();

  citaEditandoId = String(cita.id);
  actualizarModoEdicionCita();
}

function modificarCitaSeleccionada() {
  if (citasSeleccionadas.size !== 1) return;
  const id = Array.from(citasSeleccionadas)[0];
  const cita = citas.find(item => String(item.id) === String(id));
  if (!cita) return;

  cargarCitaEnCalculadora(cita);
  citasSeleccionadas.clear();
  renderCitasTabla();

  const enlaceInicio = document.getElementById("side-home-link");
  if (enlaceInicio && window.jQuery) window.jQuery(enlaceInicio).tab("show");
  window.location.hash = "#home";
  const tabInicial = document.querySelector('[data-calculator-section="inicial"]');
  if (tabInicial) tabInicial.click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function obtenerFechaIsoCita(cita) {
  const valor = String(cita && cita.fecha_cita ? cita.fecha_cita : "").trim();
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function obtenerCitasFiltradas() {
  const filtro = citaNormalizar(filtroCitas);
  const terminos = filtro.split(/\s+/).filter(Boolean);
  const fechaDesde = filtroCitasFechaDesde;
  const fechaHasta = filtroCitasFechaHasta;

  return citas.filter(cita => {
    const fechaCita = obtenerFechaIsoCita(cita);
    if (fechaDesde && (!fechaCita || fechaCita < fechaDesde)) return false;
    if (fechaHasta && (!fechaCita || fechaCita > fechaHasta)) return false;
    if (!terminos.length) return true;

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

function obtenerPaginasVisiblesCitas(totalPaginas) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, index) => index + 1);
  }

  const paginas = new Set([1, totalPaginas]);
  for (let pagina = paginaCitasActual - 1; pagina <= paginaCitasActual + 1; pagina++) {
    if (pagina > 1 && pagina < totalPaginas) paginas.add(pagina);
  }

  return Array.from(paginas).sort((a, b) => a - b);
}

function sincronizarSeleccionCitas() {
  const idsExistentes = new Set(citas.map(cita => String(cita.id)));
  citasSeleccionadas.forEach(id => {
    if (!idsExistentes.has(String(id))) citasSeleccionadas.delete(id);
  });
}

function obtenerIdsCitasFiltradas() {
  return obtenerCitasFiltradas()
    .map(cita => cita.id)
    .filter(id => id !== null && id !== undefined)
    .map(id => String(id));
}

function actualizarControlesSeleccionCitas() {
  sincronizarSeleccionCitas();

  const seleccionarBtn = document.getElementById("citas_seleccionar_todo");
  const eliminarBtn = document.getElementById("citas_eliminar");
  const modificarBtn = document.getElementById("citas_modificar");
  const totalSeleccionadas = citasSeleccionadas.size;
  const idsFiltradas = obtenerIdsCitasFiltradas();
  const todasFiltradasSeleccionadas = idsFiltradas.length > 0 && idsFiltradas.every(id => citasSeleccionadas.has(id));

  if (seleccionarBtn) {
    seleccionarBtn.disabled = idsFiltradas.length === 0;
    seleccionarBtn.textContent = todasFiltradasSeleccionadas ? "Quitar seleccion" : "Seleccionar todo";
  }

  if (eliminarBtn) {
    eliminarBtn.disabled = totalSeleccionadas === 0;
    eliminarBtn.textContent = totalSeleccionadas > 0 ? `Eliminar (${totalSeleccionadas})` : "Eliminar";
  }

  if (modificarBtn) modificarBtn.disabled = totalSeleccionadas !== 1;
}

function alternarSeleccionTodasCitas() {
  const idsFiltradas = obtenerIdsCitasFiltradas();
  if (!idsFiltradas.length) return;

  const todasFiltradasSeleccionadas = idsFiltradas.every(id => citasSeleccionadas.has(id));
  if (todasFiltradasSeleccionadas) {
    idsFiltradas.forEach(id => citasSeleccionadas.delete(id));
  } else {
    idsFiltradas.forEach(id => citasSeleccionadas.add(id));
  }

  renderCitasTabla();
}

function renderCitasPaginacion(totalFiltradas) {
  const contenedor = document.getElementById("citas_paginacion");
  if (!contenedor) return;

  if (!citas.length) {
    contenedor.innerHTML = "";
    return;
  }

  if (!totalFiltradas) {
    contenedor.innerHTML = '<span class="citas-pagination-info">0 resultados</span>';
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / CITAS_POR_PAGINA));
  paginaCitasActual = Math.min(Math.max(paginaCitasActual, 1), totalPaginas);
  const inicio = ((paginaCitasActual - 1) * CITAS_POR_PAGINA) + 1;
  const fin = Math.min(inicio + CITAS_POR_PAGINA - 1, totalFiltradas);
  const paginas = obtenerPaginasVisiblesCitas(totalPaginas);
  let paginaAnterior = 0;

  const botonesPagina = paginas.map(pagina => {
    const separador = paginaAnterior && pagina - paginaAnterior > 1
      ? '<span class="citas-pagination-ellipsis">...</span>'
      : "";
    paginaAnterior = pagina;
    return `${separador}<button type="button" class="btn btn-sm ${pagina === paginaCitasActual ? "btn-success" : "btn-outline-secondary"} citas-page-button" data-citas-page="${pagina}">${pagina}</button>`;
  }).join("");

  contenedor.innerHTML = `
    <span class="citas-pagination-info">Mostrando ${inicio}-${fin} de ${totalFiltradas} citas</span>
    <div class="citas-pagination-buttons">
      <button type="button" class="btn btn-outline-secondary btn-sm" data-citas-page="${paginaCitasActual - 1}" ${paginaCitasActual <= 1 ? "disabled" : ""}>Anterior</button>
      ${botonesPagina}
      <button type="button" class="btn btn-outline-secondary btn-sm" data-citas-page="${paginaCitasActual + 1}" ${paginaCitasActual >= totalPaginas ? "disabled" : ""}>Siguiente</button>
    </div>
  `;

  contenedor.querySelectorAll("[data-citas-page]").forEach(boton => {
    boton.addEventListener("click", () => {
      const pagina = parseInt(boton.dataset.citasPage, 10);
      if (!Number.isFinite(pagina)) return;
      paginaCitasActual = Math.min(Math.max(pagina, 1), totalPaginas);
      renderCitasTabla();
    });
  });
}

function renderCitasTabla() {
  const tbody = document.getElementById("citas_tbody");
  if (!tbody) return;

  if (!citas.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin citas guardadas.</td></tr>';
    renderCitasPaginacion(0);
    actualizarControlesSeleccionCitas();
    return;
  }

  const filtradas = obtenerCitasFiltradas();
  if (!filtradas.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin resultados para el filtro.</td></tr>';
    renderCitasPaginacion(0);
    actualizarControlesSeleccionCitas();
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / CITAS_POR_PAGINA));
  paginaCitasActual = Math.min(Math.max(paginaCitasActual, 1), totalPaginas);
  const inicio = (paginaCitasActual - 1) * CITAS_POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + CITAS_POR_PAGINA);

  tbody.innerHTML = visibles.map(cita => `
    <tr class="cita-row" data-cita-id="${citaEscape(cita.id)}">
      <td class="cita-selection-cell">
        <input type="checkbox" class="form-check-input cita-row-check" value="${citaEscape(cita.id)}" aria-label="Seleccionar cita de ${citaEscape(cita.paciente_nombre || "paciente")}" ${citasSeleccionadas.has(String(cita.id)) ? "checked" : ""}>
      </td>
      <td>${citaEscape(citaFormatearFecha(cita.fecha_cita))}</td>
      <td>${citaEscape(cita.paciente_nombre || "")}</td>
      <td>${citaEscape(cita.paciente_documento || "")}</td>
      <td>${citaEscape(citaFormatearFechaHora(cita.created_at))}</td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".cita-row-check").forEach(check => {
    check.addEventListener("click", event => event.stopPropagation());
    check.addEventListener("change", () => {
      const id = String(check.value);
      if (check.checked) {
        citasSeleccionadas.add(id);
      } else {
        citasSeleccionadas.delete(id);
      }
      actualizarControlesSeleccionCitas();
    });
  });

  tbody.querySelectorAll(".cita-row").forEach(row => {
    row.addEventListener("click", event => {
      if (event.target.closest(".cita-selection-cell")) return;
      const cita = citas.find(item => String(item.id) === row.dataset.citaId);
      if (cita) renderDetalleCita(cita);
    });
  });

  renderCitasPaginacion(filtradas.length);
  actualizarControlesSeleccionCitas();
}

async function cargarCitas() {
  const client = window.supabaseClient;
  if (!client) return;

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    citas = [];
    citasSeleccionadas.clear();
    renderCitasTabla();
    return;
  }

  const columnasCitas = [
    "id", "user_id", "paciente_id", "fecha_cita", "created_at", "cita_schema_version",
    "actividad", "actividad_texto", "profesional_user_id", "profesional_email",
    "profesional_nombre", "profesional_usuario", "profesional_telefono",
    "peso", "peso_ideal", "estatura_cm", "imc", "clasificacion_imc",
    "brazo_izquierdo", "brazo_derecho", "cintura", "abdomen_bajo", "cadera",
    "muslo_izquierdo", "muslo_derecho", "pantorrilla_izquierda", "pantorrilla_derecha",
    "observaciones", "req_energia_calculada", "req_proteina", "req_grasa_total",
    "bia_masa_muscular_kg", "bia_masa_muscular_brazo_izquierdo_kg",
    "bia_masa_muscular_brazo_derecho_kg", "bia_masa_muscular_tronco_kg",
    "bia_masa_muscular_pierna_izquierda_kg", "bia_masa_muscular_pierna_derecha_kg",
    "bia_masa_grasa_pct", "bia_masa_grasa_brazo_izquierdo_pct",
    "bia_masa_grasa_brazo_derecho_pct", "bia_masa_grasa_tronco_pct",
    "bia_masa_grasa_pierna_izquierda_pct", "bia_masa_grasa_pierna_derecha_pct",
    "bia_grasa_visceral_pct", "bia_agua_corporal_pct", "bia_geb_kcal",
    "bia_masa_osea_kg", "bia_edad_anios",
    "req_carbohidratos", "req_fibra", "req_ags", "req_agm", "req_agpi",
    "req_colesterol", "req_calcio", "req_fosforo", "req_hierro", "req_potasio",
    "req_sodio", "req_zinc", "req_vitamina_c", "req_vitamina_a", "req_folatos",
    "req_vitamina_b12", "macro_proteina_porcentaje", "macro_grasa_porcentaje",
    "hora_desayuno", "hora_media_manana", "hora_almuerzo", "hora_media_tarde",
    "hora_merienda", "hora_cena"
  ].join(",");

  let { data, error } = await client
    .from("citas")
    .select(columnasCitas)
    .order("fecha_cita", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    const detalle = document.getElementById("cita_detalle");
    if (detalle) detalle.innerHTML = `<div class="alert alert-warning">No se pudieron cargar las citas. Ejecuta el SQL del modelo recomendado y recarga la pagina. Detalle: ${citaEscape(error.message)}</div>`;
    return;
  }

  const idsCitas = (data || [])
    .map(cita => cita.id)
    .filter(id => id !== null && id !== undefined);
  const alimentosPorCita = new Map();

  if (idsCitas.length) {
    const { data: alimentosData, error: alimentosError } = await client
      .from("cita_alimentos")
      .select("cita_id,alimento_id,alimento_nombre,tiempo,gramos,orden")
      .in("cita_id", idsCitas)
      .order("cita_id", { ascending: true })
      .order("tiempo", { ascending: true })
      .order("orden", { ascending: true });

    if (alimentosError) {
      const detalle = document.getElementById("cita_detalle");
      if (detalle) detalle.innerHTML = `<div class="alert alert-warning">Las citas cargaron, pero no se pudieron cargar sus alimentos. Detalle: ${citaEscape(alimentosError.message)}</div>`;
    } else {
      (alimentosData || []).forEach(item => {
        const key = String(item.cita_id);
        if (!alimentosPorCita.has(key)) alimentosPorCita.set(key, []);
        alimentosPorCita.get(key).push(item);
      });
    }
  }

  citas = (data || []).map(cita => integrarDatosTablaUnicaCita({
    ...cita,
    cita_alimentos: alimentosPorCita.get(String(cita.id)) || []
  }));
  citasSeleccionadas.clear();
  renderCitasTabla();
  window.dispatchEvent(new CustomEvent("citas:loaded"));
}

async function eliminarCitasSeleccionadas() {
  if (!citasSeleccionadas.size) return;

  const confirmar = window.confirm("Está seguro?");
  if (!confirmar) return;

  const client = window.supabaseClient;
  if (!client) {
    alert("No hay conexion con Supabase.");
    return;
  }

  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    alert("Debes iniciar sesion para eliminar citas.");
    return;
  }

  const ids = Array.from(citasSeleccionadas);
  const eliminarBtn = document.getElementById("citas_eliminar");
  if (eliminarBtn) {
    eliminarBtn.disabled = true;
    eliminarBtn.textContent = "Eliminando...";
  }

  try {
    const { error } = await client
      .from("citas")
      .delete()
      .in("id", ids);

    if (error) {
      alert(`No se pudieron eliminar las citas: ${error.message}`);
      return;
    }

    citasSeleccionadas.clear();
    const detalle = document.getElementById("cita_detalle");
    if (detalle) detalle.innerHTML = "";
    await cargarCitas();
  } catch (error) {
    alert(`No se pudieron eliminar las citas: ${error.message}`);
  } finally {
    actualizarControlesSeleccionCitas();
  }
}

function tablaObjetoNutricional(titulo, filas, datos) {
  const campos = obtenerCamposNutrientesVisiblesCita(datos);

  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-primary">
          <tr>
            <th>${citaEscape(titulo)}</th>
            ${campos.map(([, label]) => `<th>${citaEscape(label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${filas.map(fila => `
            <tr>
              <td>${citaEscape(fila.nombre)}</td>
              ${campos.map(([campo]) => `<td>${citaFormatearNumero(fila[campo])}</td>`).join("")}
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

function renderTablaAlimentos(alimentosPorTiempo, horasComida, datos) {
  const filas = [];
  const campos = obtenerCamposNutrientesVisiblesCita(datos);
  const columnas = campos.length + 2;
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
          ${campos.map(([campo]) => `<td>${citaFormatearNumero(item[campo])}</td>`).join("")}
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
            ${campos.map(([, label]) => `<th>${citaEscape(label)}</th>`).join("")}
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

function renderizarSvgImcCitaDesdeDatos(imc) {
  const peso = citaNumero(imc && imc.peso);
  let estatura = citaNumero(imc && (imc.estatura_m || imc.estaturaMetros));
  if (estatura <= 0) estatura = citaNumero(imc && imc.estatura_cm);
  if (estatura > 3) estatura = estatura / 100;

  let valor = citaNumero(imc && imc.valor !== null && imc.valor !== undefined ? imc.valor : 0);
  if (valor <= 0 && peso > 0 && estatura > 0) {
    valor = peso / (estatura * estatura);
  }

  if (peso <= 0 || estatura <= 0 || valor <= 0) return "";

  const chart = {
    minPeso: 40,
    maxPeso: 130,
    minEstatura: 1.4,
    maxEstatura: 2,
    left: 62,
    top: 54,
    width: 548,
    height: 274
  };
  chart.right = chart.left + chart.width;
  chart.bottom = chart.top + chart.height;

  const bandas = [
    { label: "Delgadez", min: -Infinity, max: 18.5, color: "#ffffff", labelPeso: 55, labelEstatura: 1.76 },
    { label: "Normal", min: 18.5, max: 25, color: "#00ed19", labelPeso: 68, labelEstatura: 1.76 },
    { label: "Sobrepeso", min: 25, max: 30, color: "#fff200", labelPeso: 84, labelEstatura: 1.75 },
    { label: "Obesidad", min: 30, max: 35, color: "#ff9f1a", labelPeso: 100, labelEstatura: 1.74 },
    { label: "Obesidad clinica", min: 35, max: Infinity, color: "#ff1717", labelPeso: 116, labelEstatura: 1.74 }
  ];

  const obtenerX = valorPeso => chart.left + ((valorPeso - chart.minPeso) / (chart.maxPeso - chart.minPeso)) * chart.width;
  const obtenerY = valorEstatura => chart.bottom - ((valorEstatura - chart.minEstatura) / (chart.maxEstatura - chart.minEstatura)) * chart.height;
  const limitar = (numero, minimo, maximo) => Math.min(Math.max(numero, minimo), maximo);
  const puntoLimite = (limiteImc, valorEstatura) => {
    let valorPeso = limiteImc * valorEstatura * valorEstatura;
    if (limiteImc === -Infinity) valorPeso = chart.minPeso;
    if (limiteImc === Infinity) valorPeso = chart.maxPeso;
    return [obtenerX(valorPeso), obtenerY(valorEstatura)];
  };
  const crearPathBanda = (minImc, maxImc) => {
    const pasos = 56;
    const bordeSuperior = [];
    const bordeInferior = [];

    for (let i = 0; i <= pasos; i++) {
      const proporcion = i / pasos;
      const valorEstatura = chart.minEstatura + ((chart.maxEstatura - chart.minEstatura) * proporcion);
      bordeSuperior.push(puntoLimite(maxImc, valorEstatura));
      bordeInferior.unshift(puntoLimite(minImc, valorEstatura));
    }

    return bordeSuperior.concat(bordeInferior)
      .map((punto, index) => `${index === 0 ? "M" : "L"} ${punto[0].toFixed(2)} ${punto[1].toFixed(2)}`)
      .join(" ") + " Z";
  };
  const crearPathLinea = limiteImc => {
    const pasos = 56;
    const puntos = [];

    for (let i = 0; i <= pasos; i++) {
      const proporcion = i / pasos;
      const valorEstatura = chart.minEstatura + ((chart.maxEstatura - chart.minEstatura) * proporcion);
      puntos.push(puntoLimite(limiteImc, valorEstatura));
    }

    return puntos
      .map((punto, index) => `${index === 0 ? "M" : "L"} ${punto[0].toFixed(2)} ${punto[1].toFixed(2)}`)
      .join(" ");
  };

  const clipId = `cita_imc_plot_clip_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const marcadorX = limitar(obtenerX(peso), chart.left, chart.right);
  const marcadorY = limitar(obtenerY(estatura), chart.top, chart.bottom);
  const marcadorTexto = Number.isFinite(valor) ? valor.toFixed(1) : "";

  const gridPeso = [];
  for (let valorPeso = chart.minPeso; valorPeso <= chart.maxPeso; valorPeso += 10) {
    const x = obtenerX(valorPeso);
    gridPeso.push(`
      <line class="imc-grid-line" x1="${x.toFixed(2)}" y1="${chart.top}" x2="${x.toFixed(2)}" y2="${chart.bottom}"></line>
      <text class="imc-tick-label" x="${x.toFixed(2)}" y="${chart.bottom + 20}" text-anchor="middle">${valorPeso}</text>
    `);
  }

  const gridEstatura = [];
  for (let valorEstatura = chart.minEstatura; valorEstatura <= chart.maxEstatura + 0.001; valorEstatura += 0.1) {
    const estaturaTick = Number(valorEstatura.toFixed(1));
    const y = obtenerY(estaturaTick);
    gridEstatura.push(`
      <line class="imc-grid-line" x1="${chart.left}" y1="${y.toFixed(2)}" x2="${chart.right}" y2="${y.toFixed(2)}"></line>
      <text class="imc-tick-label" x="${chart.left - 10}" y="${(y + 4).toFixed(2)}" text-anchor="end">${estaturaTick.toFixed(2)}</text>
    `);
  }

  return `
    <svg class="imc-chart cita-imc-chart-svg" viewBox="0 0 680 390" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Indice de Masa Corporal">
      <defs>
        <clipPath id="${clipId}">
          <rect x="${chart.left}" y="${chart.top}" width="${chart.width}" height="${chart.height}"></rect>
        </clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        ${bandas.map(banda => `<path class="imc-band" d="${crearPathBanda(banda.min, banda.max)}" fill="${banda.color}"></path>`).join("")}
        ${[18.5, 25, 30, 35].map(limite => `<path class="imc-boundary" d="${crearPathLinea(limite)}"></path>`).join("")}
      </g>
      <g>
        ${gridPeso.join("")}
        ${gridEstatura.join("")}
      </g>
      <g>
        <rect class="imc-axis-line" x="${chart.left}" y="${chart.top}" width="${chart.width}" height="${chart.height}" fill="none"></rect>
        <text class="imc-axis-label" x="${chart.left + (chart.width / 2)}" y="31" text-anchor="middle">Indice de Masa Corporal (IMC)</text>
        <text class="imc-axis-label" x="${chart.left + (chart.width / 2)}" y="${chart.bottom + 54}" text-anchor="middle">Peso (kg)</text>
        <text class="imc-axis-label" x="22" y="${chart.top + (chart.height / 2)}" text-anchor="middle" transform="rotate(-90 22 ${chart.top + (chart.height / 2)})">Altura (m)</text>
      </g>
      <g>
        ${bandas.map(banda => {
          const x = obtenerX(banda.labelPeso);
          const y = obtenerY(banda.labelEstatura);
          return `<text class="imc-band-label" x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-55 ${x.toFixed(2)} ${y.toFixed(2)})">${citaEscape(banda.label)}</text>`;
        }).join("")}
      </g>
      <g class="imc-marker" transform="translate(${marcadorX.toFixed(2)} ${marcadorY.toFixed(2)})" visibility="visible">
        <line x1="-13" y1="0" x2="13" y2="0"></line>
        <line x1="0" y1="-13" x2="0" y2="13"></line>
        <circle r="9"></circle>
        <text x="15" y="-8">${citaEscape(marcadorTexto)}</text>
      </g>
    </svg>
  `;
}

function renderIndiceMasaCorporalCita(imc) {
  const datos = imc && imc.valido ? imc : null;
  const grafico = datos
    ? renderizarSvgImcCitaDesdeDatos(datos) || obtenerSvgSeguroCita(datos.grafico_svg)
    : "";

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

function renderDatosBiaCita(bia) {
  const datos = bia && typeof bia === "object" ? bia : {};
  const tieneDatos = CAMPOS_BIA_CITA.some(([campo]) => datos[campo] !== null && datos[campo] !== undefined && datos[campo] !== "");
  if (!tieneDatos) return '<p class="text-muted mb-0">Sin datos de bioimpedancia registrados.</p>';

  return `
    <div class="table-responsive">
      <table class="table table-sm table-bordered cita-medidas-table">
        <thead class="table-primary"><tr><th>Indicador</th><th>Valor</th></tr></thead>
        <tbody>
          ${CAMPOS_BIA_CITA.map(([campo, label, unidad]) => `
            <tr>
              <td>${citaEscape(label)}</td>
              <td>${datos[campo] !== null && datos[campo] !== undefined && datos[campo] !== ""
                ? `${citaFormatearNumero(datos[campo])} ${citaEscape(unidad)}`
                : ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function clonarDatosParaPdfCita(datos) {
  try {
    const copia = JSON.parse(JSON.stringify(datos || {}));
    return copia && typeof copia === "object" && !Array.isArray(copia) ? copia : {};
  } catch (error) {
    return datos && typeof datos === "object" && !Array.isArray(datos) ? { ...datos } : {};
  }
}

async function descargarPdfCitaGuardada(cita, boton) {
  if (!cita) return;
  if (typeof generarPDF !== "function") {
    alert("No se pudo cargar el generador de PDF.");
    return;
  }

  const datos = clonarDatosParaPdfCita(cita.datos);
  datos.paciente = datos.paciente || {};
  datos.profesional = datos.profesional || {};

  if (!datos.paciente.nombre) datos.paciente.nombre = cita.paciente_nombre || "";
  if (!datos.paciente.documento) datos.paciente.documento = cita.paciente_documento || "";
  if (!datos.paciente.fecha_evaluacion) datos.paciente.fecha_evaluacion = cita.fecha_cita || "";
  datos.imc = obtenerImcDesdeDatosCita(datos);
  datos.alimentos_por_tiempo = hidratarAlimentosPorTiempoCita(datos.alimentos_por_tiempo);
  datos.totales = hidratarTotalesCita(datos.totales, datos.alimentos_por_tiempo);

  const textoOriginal = boton ? boton.textContent : "";
  if (boton) {
    boton.disabled = true;
    boton.textContent = "Generando PDF...";
  }

  try {
    await generarPDF(datos);
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }
}

function renderDetalleCita(cita) {
  const detalle = document.getElementById("cita_detalle");
  if (!detalle) return;

  const datos = cita.datos || {};
  const paciente = datos.paciente || {};
  const profesional = datos.profesional || {};
  const imc = obtenerImcDesdeDatosCita(datos);
  const horasComida = datos.horas_comida || {};
  const alimentosPorTiempo = hidratarAlimentosPorTiempoCita(datos.alimentos_por_tiempo);
  const totales = hidratarTotalesCita(datos.totales, alimentosPorTiempo);
  const filasTotales = [];

  obtenerTiemposCita().forEach(tiempo => {
    filasTotales.push({ nombre: obtenerEtiquetaTiempoCita(tiempo, horasComida), ...(totales.subtotales ? totales.subtotales[tiempo] : {}) });
  });
  filasTotales.push({ nombre: "Total", ...(totales.total || {}) });
  filasTotales.push({ nombre: "Requerimiento", ...(totales.requerimiento || {}) });
  filasTotales.push({ nombre: "% Adecuaci\u00f3n", ...(totales.adecuacion || {}) });

  detalle.innerHTML = `
    <div class="card p-3 cita-detail-section">
      <div class="cita-detail-heading">
        <h5>Datos del paciente</h5>
        <button type="button" class="btn btn-danger btn-sm cita-download-pdf">Descargar PDF</button>
      </div>
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
      <h5>An&aacute;lisis de Bioimpedancia El&eacute;ctrica (BIA)</h5>
      ${renderDatosBiaCita(datos.bia)}
    </div>

    <div class="cita-detail-grid">
      <div class="card p-3 cita-detail-section cita-compact-card">
        <h5>Horarios de comida</h5>
        ${renderHorariosComidaCita(horasComida)}
      </div>

      <div class="card p-3 cita-detail-section cita-compact-card">
        <h5>Macronutrientes</h5>
        ${renderTablaMacronutrientes(datos.macronutrientes)}
      </div>
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Alimentos seleccionados</h5>
      ${renderTablaAlimentos(alimentosPorTiempo, horasComida, datos)}
    </div>

    <div class="card p-3 cita-detail-section">
      <h5>Totales, requerimiento y adecuaci&oacute;n</h5>
      ${tablaObjetoNutricional("Concepto", filasTotales, datos)}
    </div>
  `;

  const pdfBtn = detalle.querySelector(".cita-download-pdf");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => descargarPdfCitaGuardada(cita, pdfBtn));
  }
}

function obtenerPacientesConCitasEvolucion() {
  const mapa = new Map();
  citas.forEach(cita => {
    const id = String(cita.paciente_id || (cita.datos && cita.datos.paciente && cita.datos.paciente.paciente_id) || "");
    if (!id || mapa.has(id)) return;
    mapa.set(id, {
      id,
      nombre: cita.paciente_nombre || "Paciente",
      documento: cita.paciente_documento || ""
    });
  });
  return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function renderSelectorPacientesEvolucion() {
  const selector = document.getElementById("evolucion_paciente");
  if (!selector) return;
  const valorActual = selector.value;
  const opciones = obtenerPacientesConCitasEvolucion();
  selector.innerHTML = '<option value="">Selecciona un paciente</option>' + opciones.map(paciente => (
    `<option value="${citaEscape(paciente.id)}">${citaEscape(paciente.nombre)}${paciente.documento ? ` - ${citaEscape(paciente.documento)}` : ""}</option>`
  )).join("");
  if (opciones.some(paciente => paciente.id === valorActual)) selector.value = valorActual;
}

function obtenerSerieEvolucion(pacienteId, campo) {
  return citas
    .filter(cita => String(cita.paciente_id) === String(pacienteId))
    .map(cita => {
      const paciente = cita.datos && cita.datos.paciente ? cita.datos.paciente : {};
      const medidas = normalizarMedidasCita(paciente.medidas_antropometricas);
      const bia = cita.datos && cita.datos.bia ? cita.datos.bia : {};
      const valor = campo === "peso"
        ? citaNumeroOpcional(paciente.peso)
        : campo.startsWith("bia_")
          ? citaNumeroOpcional(bia[campo])
          : citaNumeroOpcional(medidas[campo]);
      return {
        fecha: obtenerFechaIsoCita(cita),
        etiqueta: citaFormatearFecha(cita.fecha_cita),
        valor
      };
    })
    .filter(punto => punto.fecha && punto.valor !== null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function renderGraficaEvolucion(serie, unidad, color) {
  if (!serie.length) {
    return '<div class="evolution-chart-empty">No existen datos registrados para esta variable.</div>';
  }

  const ancho = 760;
  const alto = 320;
  const margen = { izquierda: 62, derecha: 24, arriba: 25, abajo: 58 };
  const anchoGrafica = ancho - margen.izquierda - margen.derecha;
  const altoGrafica = alto - margen.arriba - margen.abajo;
  const valores = serie.map(punto => punto.valor);
  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);
  const amplitud = maximo - minimo;
  const relleno = amplitud > 0 ? amplitud * 0.15 : Math.max(Math.abs(maximo) * 0.08, 1);
  minimo = Math.max(0, minimo - relleno);
  maximo += relleno;
  const rango = maximo - minimo || 1;
  const x = indice => margen.izquierda + (serie.length === 1 ? anchoGrafica / 2 : (indice / (serie.length - 1)) * anchoGrafica);
  const y = valor => margen.arriba + altoGrafica - ((valor - minimo) / rango) * altoGrafica;
  const puntos = serie.map((punto, indice) => `${x(indice).toFixed(1)},${y(punto.valor).toFixed(1)}`).join(" ");
  const pasoEtiquetas = Math.max(1, Math.ceil(serie.length / 6));

  const lineasY = Array.from({ length: 5 }, (_, indice) => {
    const proporcion = indice / 4;
    const valor = maximo - (rango * proporcion);
    const posicionY = margen.arriba + (altoGrafica * proporcion);
    return `
      <line x1="${margen.izquierda}" y1="${posicionY}" x2="${ancho - margen.derecha}" y2="${posicionY}" stroke="#e3e9ec" />
      <text x="${margen.izquierda - 10}" y="${posicionY + 4}" text-anchor="end" fill="#66737c" font-size="12">${citaFormatearNumero(valor)} ${unidad}</text>
    `;
  }).join("");

  const etiquetasX = serie.map((punto, indice) => {
    if (indice % pasoEtiquetas !== 0 && indice !== serie.length - 1) return "";
    return `<text x="${x(indice)}" y="${alto - 24}" text-anchor="middle" fill="#66737c" font-size="12">${citaEscape(punto.etiqueta)}</text>`;
  }).join("");

  const circulos = serie.map((punto, indice) => `
    <circle cx="${x(indice)}" cy="${y(punto.valor)}" r="5" fill="#fff" stroke="${color}" stroke-width="3">
      <title>${citaEscape(punto.etiqueta)}: ${citaFormatearNumero(punto.valor)} ${unidad}</title>
    </circle>
  `).join("");

  return `
    <svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Gr&aacute;fica de evoluci&oacute;n">
      ${lineasY}
      <line x1="${margen.izquierda}" y1="${margen.arriba}" x2="${margen.izquierda}" y2="${alto - margen.abajo}" stroke="#9aa7af" />
      <line x1="${margen.izquierda}" y1="${alto - margen.abajo}" x2="${ancho - margen.derecha}" y2="${alto - margen.abajo}" stroke="#9aa7af" />
      <polyline points="${puntos}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${circulos}
      ${etiquetasX}
    </svg>
  `;
}

function renderCambioEvolucion(elemento, serie, unidad) {
  if (!elemento) return;
  if (!serie.length) {
    elemento.textContent = "Sin datos";
    return;
  }
  if (serie.length === 1) {
    elemento.textContent = `1 registro · ${citaFormatearNumero(serie[0].valor)} ${unidad}`;
    return;
  }
  const primero = serie[0].valor;
  const ultimo = serie[serie.length - 1].valor;
  const cambio = ultimo - primero;
  const signo = cambio > 0 ? "+" : "";
  elemento.textContent = `${citaFormatearNumero(primero)} → ${citaFormatearNumero(ultimo)} ${unidad} (${signo}${citaFormatearNumero(cambio)})`;
}

function renderEvolucionPaciente() {
  const selectorPaciente = document.getElementById("evolucion_paciente");
  const selectorMedida = document.getElementById("evolucion_medida");
  const selectorBia = document.getElementById("evolucion_bia");
  const estado = document.getElementById("evolucion_estado");
  const contenido = document.getElementById("evolucion_contenido");
  if (!selectorPaciente || !selectorMedida || !selectorBia || !estado || !contenido) return;

  const pacienteId = selectorPaciente.value;
  if (!pacienteId) {
    estado.hidden = false;
    estado.textContent = citas.length
      ? "Selecciona un paciente para consultar su evolucion."
      : "Todavia no existen citas con datos para mostrar.";
    contenido.hidden = true;
    return;
  }

  const campoMedida = selectorMedida.value;
  const nombreMedida = MEDIDAS_EVOLUCION[campoMedida] || "Medida corporal";
  const campoBia = selectorBia.value;
  const configuracionBia = CAMPOS_BIA_CITA.find(([campo]) => campo === campoBia) || [campoBia, "Indicador BIA", ""];
  const nombreBia = configuracionBia[1];
  const unidadBia = configuracionBia[2];
  const seriePeso = obtenerSerieEvolucion(pacienteId, "peso");
  const serieMedida = obtenerSerieEvolucion(pacienteId, campoMedida);
  const serieBia = obtenerSerieEvolucion(pacienteId, campoBia);
  estado.hidden = true;
  contenido.hidden = false;

  const titulo = document.getElementById("evolucion_medida_titulo");
  if (titulo) titulo.textContent = `Evolución de ${nombreMedida.toLowerCase()}`;
  const tituloBia = document.getElementById("evolucion_bia_titulo");
  if (tituloBia) tituloBia.textContent = `Evolución de ${nombreBia.toLowerCase()}`;
  document.getElementById("evolucion_peso_grafica").innerHTML = renderGraficaEvolucion(seriePeso, "kg", "#2563eb");
  document.getElementById("evolucion_medida_grafica").innerHTML = renderGraficaEvolucion(serieMedida, "cm", "#4caf50");
  document.getElementById("evolucion_bia_grafica").innerHTML = renderGraficaEvolucion(serieBia, unidadBia, "#7c3aed");
  renderCambioEvolucion(document.getElementById("evolucion_peso_cambio"), seriePeso, "kg");
  renderCambioEvolucion(document.getElementById("evolucion_medida_cambio"), serieMedida, "cm");
  renderCambioEvolucion(document.getElementById("evolucion_bia_cambio"), serieBia, unidadBia);
}

function configurarEvolucionPacientes() {
  const selectorPaciente = document.getElementById("evolucion_paciente");
  const selectorMedida = document.getElementById("evolucion_medida");
  const selectorBia = document.getElementById("evolucion_bia");
  const enlaceEvolucion = document.getElementById("side-evolucion-link");
  if (selectorPaciente) selectorPaciente.addEventListener("change", renderEvolucionPaciente);
  if (selectorMedida) selectorMedida.addEventListener("change", renderEvolucionPaciente);
  if (selectorBia) selectorBia.addEventListener("change", renderEvolucionPaciente);
  if (enlaceEvolucion) {
    enlaceEvolucion.addEventListener("click", () => {
      renderSelectorPacientesEvolucion();
      renderEvolucionPaciente();
    });
  }
  window.addEventListener("citas:loaded", () => {
    renderSelectorPacientesEvolucion();
    renderEvolucionPaciente();
  });
  renderSelectorPacientesEvolucion();
}

function configurarCitas() {
  const guardarBtn = document.getElementById("guardar_cita_btn");
  const recargarBtn = document.getElementById("citas_recargar");
  const filtro = document.getElementById("citas_filtro");
  const fechaDesde = document.getElementById("citas_fecha_desde");
  const fechaHasta = document.getElementById("citas_fecha_hasta");
  const limpiarBtn = document.getElementById("citas_limpiar");
  const seleccionarTodoBtn = document.getElementById("citas_seleccionar_todo");
  const modificarBtn = document.getElementById("citas_modificar");
  const eliminarBtn = document.getElementById("citas_eliminar");
  const cancelarEdicionBtn = document.getElementById("cancelar_edicion_cita_btn");
  const enlaceCitas = document.getElementById("side-citas-link");

  const actualizarFiltrosCitas = () => {
    paginaCitasActual = 1;
    citasSeleccionadas.clear();
    renderCitasTabla();
  };

  if (guardarBtn) guardarBtn.addEventListener("click", guardarCita);
  if (recargarBtn) recargarBtn.addEventListener("click", cargarCitas);
  if (seleccionarTodoBtn) seleccionarTodoBtn.addEventListener("click", alternarSeleccionTodasCitas);
  if (modificarBtn) modificarBtn.addEventListener("click", modificarCitaSeleccionada);
  if (eliminarBtn) eliminarBtn.addEventListener("click", eliminarCitasSeleccionadas);
  if (cancelarEdicionBtn) cancelarEdicionBtn.addEventListener("click", () => cancelarEdicionCita(true));
  if (enlaceCitas) {
    enlaceCitas.addEventListener("click", () => {
      citasSeleccionadas.clear();
      const detalle = document.getElementById("cita_detalle");
      if (detalle) detalle.innerHTML = "";
      renderCitasTabla();
    });
  }
  if (filtro) {
    filtro.addEventListener("input", event => {
      filtroCitas = event.target.value;
      actualizarFiltrosCitas();
    });
  }
  if (fechaDesde) {
    fechaDesde.addEventListener("change", event => {
      filtroCitasFechaDesde = event.target.value;
      actualizarFiltrosCitas();
    });
  }
  if (fechaHasta) {
    fechaHasta.addEventListener("change", event => {
      filtroCitasFechaHasta = event.target.value;
      actualizarFiltrosCitas();
    });
  }
  if (limpiarBtn) {
    limpiarBtn.addEventListener("click", () => {
      filtroCitas = "";
      filtroCitasFechaDesde = "";
      filtroCitasFechaHasta = "";
      paginaCitasActual = 1;
      citasSeleccionadas.clear();
      if (filtro) filtro.value = "";
      if (fechaDesde) fechaDesde.value = "";
      if (fechaHasta) fechaHasta.value = "";
      renderCitasTabla();
    });
  }

  window.addEventListener("auth:session-changed", cargarCitas);
  window.addEventListener("pacientes:loaded", () => {
    if (!citas.length) return;
    citas = citas.map(integrarDatosTablaUnicaCita);
    renderCitasTabla();
  });
  actualizarModoEdicionCita();
  configurarEvolucionPacientes();
  cargarCitas();
}

document.addEventListener("DOMContentLoaded", configurarCitas);
