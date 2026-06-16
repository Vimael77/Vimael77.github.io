const alimentos = [];
var alimentos_seleccionados = [];
var alimentos_seleccionados_en_orden = {};
var alimentos_total = {};
var alimentos_total_kc = {};
var alimentos_requerimiento = {};
var alimentos_adecuacion = {};
const baseGramos = 100;
let contadorFila = 0;
let contadorAlimento = 0;
let alimentoPendiente = null;
let pesoIdealEditadoManualmente = false;
let pesoIdealStorageScope = "anonimo";
let pesoIdealSesionActiva = null;
let pesoIdealGuardadoRemotoTimer = 0;
let medidasAntropometricasGuardadoRemotoTimer = 0;
let columnasAlimentosGuardadoRemotoTimer = 0;
let columnasAlimentosCambiosPendientes = false;
const PESO_IDEAL_STORAGE_PREFIX = "muyAlimentado:pesoIdeal";
const MEDIDAS_ANTROPOMETRICAS_STORAGE_PREFIX = "muyAlimentado:medidasAntropometricas";
const COLUMNAS_ALIMENTOS_STORAGE_PREFIX = "muyAlimentado:columnasAlimentosVisibles";
const MEDIDAS_ANTROPOMETRICAS_CAMPOS = [
  { id: "medida_brazo_izquierdo", key: "brazo_izquierdo" },
  { id: "medida_brazo_derecho", key: "brazo_derecho" },
  { id: "medida_abdomen", key: "abdomen" },
  { id: "medida_abdomen_bajo", key: "abdomen_bajo" },
  { id: "medida_muslo_izquierdo", key: "muslo_izquierdo" },
  { id: "medida_muslo_derecho", key: "muslo_derecho" },
  { id: "medida_pantorrilla_izquierda", key: "pantorrilla_izquierda" },
  { id: "medida_pantorrilla_derecha", key: "pantorrilla_derecha" }
];
const COLUMNAS_NUTRIENTES_ALIMENTOS = [
  { key: "energia_calculada", label: "Energía calculada", fija: true },
  { key: "proteina", label: "Proteína", fija: true },
  { key: "grasa_total", label: "Grasa total", fija: true },
  { key: "carbohidratos", label: "Carbohidratos", fija: true },
  { key: "fibra", label: "Fibra" },
  { key: "ags", label: "AGS" },
  { key: "agm", label: "AGM" },
  { key: "agpi", label: "AGPI" },
  { key: "colesterol", label: "Colesterol" },
  { key: "calcio", label: "Calcio" },
  { key: "fosforo", label: "Fósforo" },
  { key: "hierro", label: "Hierro" },
  { key: "potasio", label: "Potasio" },
  { key: "sodio", label: "Sodio" },
  { key: "zinc", label: "Zinc" },
  { key: "vitamina_c", label: "Vitamina C" },
  { key: "vitamina_a", label: "Vitamina A" },
  { key: "folatos", label: "Folatos" },
  { key: "vitamina_b12", label: "Vitamina B12" }
];
const COLUMNAS_ALIMENTOS_OPCIONALES = COLUMNAS_NUTRIENTES_ALIMENTOS.filter(function (columna) {
  return !columna.fija;
});
const COLUMNAS_ALIMENTOS_DEFAULT_VISIBLES = [
  "fibra",
  "colesterol",
  "calcio",
  "fosforo",
  "hierro",
  "potasio",
  "sodio"
];
let columnasAlimentosVisibles = new Set(COLUMNAS_ALIMENTOS_DEFAULT_VISIBLES);
window.alimentos_subtotales = {};
const tiemposComida = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda"];

const IMC_CHART = {
  minPeso: 40,
  maxPeso: 130,
  minEstatura: 1.4,
  maxEstatura: 2,
  left: 62,
  top: 54,
  width: 548,
  height: 274
};
IMC_CHART.right = IMC_CHART.left + IMC_CHART.width;
IMC_CHART.bottom = IMC_CHART.top + IMC_CHART.height;

const IMC_BANDAS = [
  { label: "Delgadez", min: -Infinity, max: 18.5, color: "#ffffff", labelPeso: 55, labelEstatura: 1.76 },
  { label: "Normal", min: 18.5, max: 25, color: "#00ed19", labelPeso: 68, labelEstatura: 1.76 },
  { label: "Sobrepeso", min: 25, max: 30, color: "#fff200", labelPeso: 84, labelEstatura: 1.75 },
  { label: "Obesidad", min: 30, max: 35, color: "#ff9f1a", labelPeso: 100, labelEstatura: 1.74 },
  { label: "Obesidad clinica", min: 35, max: Infinity, color: "#ff1717", labelPeso: 116, labelEstatura: 1.74 }
];

function obtenerFechaActualInput() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

function obtenerValorNumerico(id) {
  const elemento = document.getElementById(id);
  if (!elemento) return 0;

  const valor = (elemento.value || "").replace(",", ".");
  const numero = parseFloat(valor);
  return isNaN(numero) ? 0 : numero;
}

function actualizarTextoMacro(id, valor, unidad) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = `${valor.toFixed(2)} ${unidad}`;
}

function limitarValor(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function crearSvgElemento(tag, atributos, texto) {
  const elemento = document.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.keys(atributos || {}).forEach(function (nombre) {
    const valor = atributos[nombre];
    if (valor !== undefined && valor !== null) elemento.setAttribute(nombre, String(valor));
  });

  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function limpiarGrupoSvg(grupo) {
  if (!grupo) return;
  if (typeof grupo.replaceChildren === "function") {
    grupo.replaceChildren();
    return;
  }

  while (grupo.firstChild) {
    grupo.removeChild(grupo.firstChild);
  }
}

function obtenerXImc(peso) {
  return IMC_CHART.left + ((peso - IMC_CHART.minPeso) / (IMC_CHART.maxPeso - IMC_CHART.minPeso)) * IMC_CHART.width;
}

function obtenerYImc(estaturaMetros) {
  return IMC_CHART.bottom - ((estaturaMetros - IMC_CHART.minEstatura) / (IMC_CHART.maxEstatura - IMC_CHART.minEstatura)) * IMC_CHART.height;
}

function obtenerEstaturaMetrosImc() {
  const estatura = obtenerValorNumerico('calc_estatura');
  if (estatura <= 0) return 0;
  return estatura > 3 ? estatura / 100 : estatura;
}

function obtenerClasificacionImc(imc) {
  if (imc < 18.5) return "Delgadez";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidad";
  return "Obesidad clinica";
}

function obtenerIndiceMasaCorporalActual() {
  const peso = obtenerValorNumerico('calc_peso');
  const estaturaMetros = obtenerEstaturaMetrosImc();

  if (peso <= 0 || estaturaMetros <= 0) {
    return {
      valido: false,
      peso,
      estaturaMetros,
      imc: 0,
      clasificacion: ""
    };
  }

  const imc = peso / (estaturaMetros * estaturaMetros);

  return {
    valido: Number.isFinite(imc) && imc > 0,
    peso,
    estaturaMetros,
    imc,
    clasificacion: obtenerClasificacionImc(imc)
  };
}

function obtenerPuntoLimiteImc(limiteImc, estaturaMetros) {
  let peso = limiteImc * estaturaMetros * estaturaMetros;

  if (limiteImc === -Infinity) peso = IMC_CHART.minPeso;
  if (limiteImc === Infinity) peso = IMC_CHART.maxPeso;

  return [obtenerXImc(peso), obtenerYImc(estaturaMetros)];
}

function crearPathBandaImc(minImc, maxImc) {
  const pasos = 56;
  const bordeSuperior = [];
  const bordeInferior = [];

  for (let i = 0; i <= pasos; i++) {
    const proporcion = i / pasos;
    const estatura = IMC_CHART.minEstatura + ((IMC_CHART.maxEstatura - IMC_CHART.minEstatura) * proporcion);
    bordeSuperior.push(obtenerPuntoLimiteImc(maxImc, estatura));
    bordeInferior.unshift(obtenerPuntoLimiteImc(minImc, estatura));
  }

  return bordeSuperior.concat(bordeInferior)
    .map(function (punto, index) {
      return `${index === 0 ? "M" : "L"} ${punto[0].toFixed(2)} ${punto[1].toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function crearPathLineaImc(limiteImc) {
  const pasos = 56;
  const puntos = [];

  for (let i = 0; i <= pasos; i++) {
    const proporcion = i / pasos;
    const estatura = IMC_CHART.minEstatura + ((IMC_CHART.maxEstatura - IMC_CHART.minEstatura) * proporcion);
    puntos.push(obtenerPuntoLimiteImc(limiteImc, estatura));
  }

  return puntos
    .map(function (punto, index) {
      return `${index === 0 ? "M" : "L"} ${punto[0].toFixed(2)} ${punto[1].toFixed(2)}`;
    })
    .join(" ");
}

function renderizarGraficaIndiceMasaCorporal() {
  const chart = document.getElementById("imc_chart");
  if (!chart || chart.dataset.rendered === "1") return;

  const bandas = document.getElementById("imc_chart_bands");
  const grid = document.getElementById("imc_chart_grid");
  const axes = document.getElementById("imc_chart_axes");
  const labels = document.getElementById("imc_chart_labels");
  if (!bandas || !grid || !axes || !labels) return;

  limpiarGrupoSvg(bandas);
  limpiarGrupoSvg(grid);
  limpiarGrupoSvg(axes);
  limpiarGrupoSvg(labels);

  IMC_BANDAS.forEach(function (banda) {
    bandas.appendChild(crearSvgElemento("path", {
      class: "imc-band",
      d: crearPathBandaImc(banda.min, banda.max),
      fill: banda.color
    }));
  });

  [18.5, 25, 30, 35].forEach(function (limite) {
    bandas.appendChild(crearSvgElemento("path", {
      class: "imc-boundary",
      d: crearPathLineaImc(limite)
    }));
  });

  for (let peso = IMC_CHART.minPeso; peso <= IMC_CHART.maxPeso; peso += 10) {
    const x = obtenerXImc(peso);
    grid.appendChild(crearSvgElemento("line", {
      class: "imc-grid-line",
      x1: x,
      y1: IMC_CHART.top,
      x2: x,
      y2: IMC_CHART.bottom
    }));
    axes.appendChild(crearSvgElemento("text", {
      class: "imc-tick-label",
      x,
      y: IMC_CHART.bottom + 20,
      "text-anchor": "middle"
    }, String(peso)));
  }

  for (let estatura = IMC_CHART.minEstatura; estatura <= IMC_CHART.maxEstatura + 0.001; estatura += 0.1) {
    const y = obtenerYImc(estatura);
    grid.appendChild(crearSvgElemento("line", {
      class: "imc-grid-line",
      x1: IMC_CHART.left,
      y1: y,
      x2: IMC_CHART.right,
      y2: y
    }));
    axes.appendChild(crearSvgElemento("text", {
      class: "imc-tick-label",
      x: IMC_CHART.left - 10,
      y: y + 4,
      "text-anchor": "end"
    }, estatura.toFixed(2)));
  }

  axes.appendChild(crearSvgElemento("rect", {
    class: "imc-axis-line",
    x: IMC_CHART.left,
    y: IMC_CHART.top,
    width: IMC_CHART.width,
    height: IMC_CHART.height,
    fill: "none"
  }));
  axes.appendChild(crearSvgElemento("text", {
    class: "imc-axis-label",
    x: IMC_CHART.left + (IMC_CHART.width / 2),
    y: 31,
    "text-anchor": "middle"
  }, "Indice de Masa Corporal (IMC)"));
  axes.appendChild(crearSvgElemento("text", {
    class: "imc-axis-label",
    x: IMC_CHART.left + (IMC_CHART.width / 2),
    y: IMC_CHART.bottom + 54,
    "text-anchor": "middle"
  }, "Peso (kg)"));
  axes.appendChild(crearSvgElemento("text", {
    class: "imc-axis-label",
    x: 22,
    y: IMC_CHART.top + (IMC_CHART.height / 2),
    "text-anchor": "middle",
    transform: `rotate(-90 22 ${IMC_CHART.top + (IMC_CHART.height / 2)})`
  }, "Altura (m)"));

  IMC_BANDAS.forEach(function (banda) {
    const x = obtenerXImc(banda.labelPeso);
    const y = obtenerYImc(banda.labelEstatura);
    labels.appendChild(crearSvgElemento("text", {
      class: "imc-band-label",
      x,
      y,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      transform: `rotate(-55 ${x} ${y})`
    }, banda.label));
  });

  chart.dataset.rendered = "1";
}

function actualizarTextoImc(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
}

function actualizarIndiceMasaCorporal() {
  renderizarGraficaIndiceMasaCorporal();

  const datos = obtenerIndiceMasaCorporalActual();
  const marcador = document.getElementById("imc_marker");
  const marcadorTexto = document.getElementById("imc_marker_text");
  const nota = document.getElementById("imc_rango_grafica");

  if (!datos.valido) {
    actualizarTextoImc("imc_valor", "--");
    actualizarTextoImc("imc_clasificacion", "--");
    actualizarTextoImc("imc_peso_ref", "-- kg");
    actualizarTextoImc("imc_estatura_ref", "-- m");
    if (marcador) marcador.setAttribute("visibility", "hidden");
    if (nota) nota.textContent = "";
    return;
  }

  const xReal = obtenerXImc(datos.peso);
  const yReal = obtenerYImc(datos.estaturaMetros);
  const x = limitarValor(xReal, IMC_CHART.left, IMC_CHART.right);
  const y = limitarValor(yReal, IMC_CHART.top, IMC_CHART.bottom);
  const fueraDeRango = x !== xReal || y !== yReal;
  const edad = obtenerValorNumerico('calc_edad');
  const notas = [];

  actualizarTextoImc("imc_valor", datos.imc.toFixed(1));
  actualizarTextoImc("imc_clasificacion", datos.clasificacion);
  actualizarTextoImc("imc_peso_ref", `${datos.peso.toFixed(1)} kg`);
  actualizarTextoImc("imc_estatura_ref", `${datos.estaturaMetros.toFixed(2)} m`);

  if (marcador) {
    marcador.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    marcador.setAttribute("visibility", "visible");
  }

  if (marcadorTexto) marcadorTexto.textContent = datos.imc.toFixed(1);
  if (nota) {
    if (fueraDeRango) {
      notas.push("El punto esta ajustado al borde porque el valor esta fuera del rango visible de la grafica.");
    }

    if (edad > 0 && edad < 20) {
      notas.push("Para menores de 20 anos, interpreta el IMC con percentiles por edad y sexo.");
    }

    nota.textContent = notas.join(" ");
  }
}

function configurarEventosIndiceMasaCorporal() {
  ["calc_peso", "calc_estatura", "calc_edad"].forEach(function (id) {
    const elemento = document.getElementById(id);
    if (!elemento || elemento.dataset.imcConfigured === "1") return;

    elemento.addEventListener("input", actualizarIndiceMasaCorporal);
    elemento.dataset.imcConfigured = "1";
  });

  actualizarIndiceMasaCorporal();
}

function obtenerPesoIdealMacronutrientes() {
  const pesoIdeal = obtenerValorNumerico('macro_peso_ideal');
  return pesoIdeal > 0 ? Math.trunc(pesoIdeal) : 0;
}

function sincronizarPesoIdealConPesoActual(forzar = false) {
  const pesoInput = document.getElementById('calc_peso');
  const pesoIdealInput = document.getElementById('macro_peso_ideal');
  if (!pesoInput || !pesoIdealInput || (!forzar && pesoIdealEditadoManualmente)) return;

  const peso = obtenerValorNumerico('calc_peso');
  if (peso > 0) {
    pesoIdealInput.value = String(Math.round(peso));
    guardarPesoIdealPersistido();
  }
}

function normalizarInputPesoIdeal() {
  const pesoIdealInput = document.getElementById('macro_peso_ideal');
  if (!pesoIdealInput) return;

  const valor = pesoIdealInput.value.trim();
  if (!valor) return;

  const numero = Number(valor);
  if (Number.isFinite(numero)) {
    const entero = Math.trunc(Math.abs(numero));
    pesoIdealInput.value = entero > 0 ? String(entero) : "";
    return;
  }

  const digitos = valor.match(/\d+/);
  pesoIdealInput.value = digitos ? digitos[0] : "";
}

function establecerPesoIdealManual(valor) {
  const pesoIdealInput = document.getElementById("macro_peso_ideal");
  if (!pesoIdealInput) return;

  pesoIdealInput.value = valor == null ? "" : String(valor);
  normalizarInputPesoIdeal();
  pesoIdealEditadoManualmente = Boolean(pesoIdealInput.value);
  if (!pesoIdealEditadoManualmente) {
    sincronizarPesoIdealConPesoActual(true);
  }
  guardarPesoIdealPersistido();
  programarGuardarPesoIdealSupabase();
}

function obtenerClaveMedidasAntropometricasPersistidas() {
  return `${MEDIDAS_ANTROPOMETRICAS_STORAGE_PREFIX}:${pesoIdealStorageScope}`;
}

function normalizarNumeroMedidaAntropometrica(valor) {
  const numero = Number(String(valor || "").replace(",", "."));
  if (!Number.isFinite(numero) || numero <= 0) return null;
  return Number(numero.toFixed(1));
}

function formatearMedidaAntropometrica(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "";
  return Number.isInteger(numero) ? String(numero) : String(Number(numero.toFixed(1)));
}

function obtenerMedidasAntropometricas() {
  const medidas = {};

  MEDIDAS_ANTROPOMETRICAS_CAMPOS.forEach(function (campo) {
    const elemento = document.getElementById(campo.id);
    medidas[campo.key] = elemento ? normalizarNumeroMedidaAntropometrica(elemento.value) : null;
  });

  const observaciones = document.getElementById("medidas_observaciones");
  medidas.observaciones = observaciones ? observaciones.value.trim() : "";

  return medidas;
}

function medidasAntropometricasTieneContenido(medidas) {
  if (!medidas || typeof medidas !== "object") return false;

  const tieneMedidas = MEDIDAS_ANTROPOMETRICAS_CAMPOS.some(function (campo) {
    return normalizarNumeroMedidaAntropometrica(medidas[campo.key]) !== null;
  });

  return tieneMedidas || Boolean(String(medidas.observaciones || "").trim());
}

function aplicarMedidasAntropometricas(medidas) {
  const datos = medidas && typeof medidas === "object" ? medidas : {};

  MEDIDAS_ANTROPOMETRICAS_CAMPOS.forEach(function (campo) {
    const elemento = document.getElementById(campo.id);
    if (elemento) elemento.value = formatearMedidaAntropometrica(datos[campo.key]);
  });

  const observaciones = document.getElementById("medidas_observaciones");
  if (observaciones) observaciones.value = String(datos.observaciones || "");
}

function guardarMedidasAntropometricasPersistidas() {
  try {
    if (!window.localStorage) return;

    const medidas = obtenerMedidasAntropometricas();
    const clave = obtenerClaveMedidasAntropometricasPersistidas();

    if (medidasAntropometricasTieneContenido(medidas)) {
      window.localStorage.setItem(clave, JSON.stringify(medidas));
    } else {
      window.localStorage.removeItem(clave);
    }
  } catch (error) {
    // Las medidas deben seguir disponibles aunque el navegador bloquee localStorage.
  }
}

function cargarMedidasAntropometricasPersistidas() {
  try {
    if (!window.localStorage) return false;

    const valor = window.localStorage.getItem(obtenerClaveMedidasAntropometricasPersistidas());
    if (!valor) return false;

    const medidas = JSON.parse(valor);
    if (!medidas || typeof medidas !== "object") return false;

    aplicarMedidasAntropometricas(medidas);
    return true;
  } catch (error) {
    return false;
  }
}

function restaurarMedidasAntropometricasOLimpiar() {
  if (cargarMedidasAntropometricasPersistidas()) return true;

  aplicarMedidasAntropometricas({});
  return false;
}

function setMedidasAntropometricasEstado(mensaje, tipo) {
  const estado = document.getElementById("medidas_antropometricas_estado");
  if (!estado) return;

  estado.textContent = mensaje || "";
  estado.className = `ideal-save-status ${tipo || ""}`.trim();
}

function programarGuardarMedidasAntropometricasSupabase() {
  guardarMedidasAntropometricasPersistidas();
  setMedidasAntropometricasEstado("");

  if (medidasAntropometricasGuardadoRemotoTimer) {
    clearTimeout(medidasAntropometricasGuardadoRemotoTimer);
  }

  medidasAntropometricasGuardadoRemotoTimer = setTimeout(guardarMedidasAntropometricasSupabase, 600);
}

async function guardarMedidasAntropometricasSupabase() {
  medidasAntropometricasGuardadoRemotoTimer = 0;

  const client = window.supabaseClient;
  const userId = pesoIdealSesionActiva && pesoIdealSesionActiva.user
    ? pesoIdealSesionActiva.user.id
    : "";
  if (!client || !userId) return;

  const { error } = await client
    .from("profiles")
    .upsert({
      user_id: userId,
      medidas_antropometricas: obtenerMedidasAntropometricas()
    }, { onConflict: "user_id" });

  if (error) {
    console.warn("No se pudieron guardar las medidas antropometricas en Supabase.", error.message);
    setMedidasAntropometricasEstado("No se pudieron guardar las medidas en Supabase.", "error");
  }
}

async function cargarMedidasAntropometricasSupabase(session) {
  const client = window.supabaseClient;
  if (!client || !session || !session.user) return false;

  const { data, error } = await client
    .from("profiles")
    .select("medidas_antropometricas")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.warn("No se pudieron cargar las medidas antropometricas desde Supabase.", error.message);
    return false;
  }

  if (!data) {
    return false;
  }

  const medidas = data.medidas_antropometricas && typeof data.medidas_antropometricas === "object"
    ? data.medidas_antropometricas
    : {};

  aplicarMedidasAntropometricas(medidas);
  guardarMedidasAntropometricasPersistidas();
  setMedidasAntropometricasEstado("");
  return true;
}

function obtenerColumnasNutrientesKeys() {
  return COLUMNAS_NUTRIENTES_ALIMENTOS.map(function (columna) {
    return columna.key;
  });
}

function obtenerColumnasAlimentosVisiblesArray() {
  return COLUMNAS_ALIMENTOS_OPCIONALES
    .map(function (columna) { return columna.key; })
    .filter(function (key) { return columnasAlimentosVisibles.has(key); });
}

function normalizarColumnasAlimentosVisibles(valor) {
  const permitidas = new Set(COLUMNAS_ALIMENTOS_OPCIONALES.map(function (columna) {
    return columna.key;
  }));
  const origen = Array.isArray(valor) ? valor : [];
  const columnas = origen.filter(function (key) {
    return permitidas.has(key);
  });

  return new Set(columnas);
}

function usarColumnasAlimentosPredeterminadas() {
  columnasAlimentosVisibles = new Set(COLUMNAS_ALIMENTOS_DEFAULT_VISIBLES);
}

function obtenerClaveColumnasAlimentosPersistidas() {
  return `${COLUMNAS_ALIMENTOS_STORAGE_PREFIX}:${pesoIdealStorageScope}`;
}

function guardarColumnasAlimentosPersistidas() {
  try {
    if (!window.localStorage) return;
    window.localStorage.setItem(
      obtenerClaveColumnasAlimentosPersistidas(),
      JSON.stringify(obtenerColumnasAlimentosVisiblesArray())
    );
  } catch (error) {
    // La vista debe seguir funcionando aunque el navegador bloquee localStorage.
  }
}

function cargarColumnasAlimentosPersistidas() {
  try {
    if (!window.localStorage) return false;

    const valor = window.localStorage.getItem(obtenerClaveColumnasAlimentosPersistidas());
    if (!valor) return false;

    const columnas = JSON.parse(valor);
    columnasAlimentosVisibles = normalizarColumnasAlimentosVisibles(columnas);
    return true;
  } catch (error) {
    return false;
  }
}

function restaurarColumnasAlimentosOPredeterminadas() {
  if (cargarColumnasAlimentosPersistidas()) return true;
  usarColumnasAlimentosPredeterminadas();
  guardarColumnasAlimentosPersistidas();
  return false;
}

function setConfigColumnasMensaje(mensaje, tipo) {
  const elemento = document.getElementById("config_columnas_mensaje");
  if (!elemento) return;

  elemento.textContent = mensaje || "";
  elemento.className = `config-message ${tipo || ""}`.trim();
}

function obtenerColumnasAlimentosSeleccionadasConfig() {
  renderizarConfiguracionColumnasAlimentos();

  return COLUMNAS_ALIMENTOS_OPCIONALES
    .filter(function (columna) {
      const input = document.getElementById(`config_columna_${columna.key}`);
      return input && input.checked;
    })
    .map(function (columna) {
      return columna.key;
    });
}

function configurarBotonGuardarColumnasAlimentos() {
  const boton = document.getElementById("config_columnas_guardar");
  if (!boton || boton.dataset.configured === "1") return;

  boton.addEventListener("click", guardarConfiguracionColumnasAlimentos);
  boton.dataset.configured = "1";
}

function marcarCambiosPendientesColumnasAlimentos() {
  columnasAlimentosCambiosPendientes = true;
  setConfigColumnasMensaje("Cambios sin guardar. Presiona Guardar para aplicarlos.", "pending");
}

async function guardarConfiguracionColumnasAlimentos() {
  const boton = document.getElementById("config_columnas_guardar");

  try {
    if (boton) boton.disabled = true;
    setConfigColumnasMensaje("Guardando...", "pending");

    columnasAlimentosVisibles = normalizarColumnasAlimentosVisibles(obtenerColumnasAlimentosSeleccionadasConfig());
    columnasAlimentosCambiosPendientes = false;

    guardarColumnasAlimentosPersistidas();

    if (columnasAlimentosGuardadoRemotoTimer) {
      clearTimeout(columnasAlimentosGuardadoRemotoTimer);
      columnasAlimentosGuardadoRemotoTimer = 0;
    }

    aplicarVisibilidadColumnasAlimentos();

    const guardadoRemoto = await guardarColumnasAlimentosSupabase();
    if (guardadoRemoto === false) return;

    setConfigColumnasMensaje("Configuracion guardada.", "success");
  } catch (error) {
    console.warn("No se pudo guardar la configuracion de columnas.", error);
    setConfigColumnasMensaje("No se pudo guardar la configuracion.", "error");
  } finally {
    if (boton) boton.disabled = false;
  }
}

function esColumnaAlimentosVisible(key) {
  if (key === "nombre" || key === "gramos" || key === "etiqueta") return true;

  const columna = COLUMNAS_NUTRIENTES_ALIMENTOS.find(function (item) {
    return item.key === key;
  });

  if (!columna) return true;
  return columna.fija || columnasAlimentosVisibles.has(key);
}

function aplicarAtributosColumnasTabla(tabla, columnas) {
  if (!tabla) return;

  const aplicar = function (celdas) {
    Array.from(celdas).forEach(function (celda, index) {
      if (celda.colSpan > 1) return;
      const columna = columnas[index];
      if (columna) celda.dataset.foodCol = columna;
    });
  };

  aplicar(tabla.querySelectorAll("thead > th"));
  tabla.querySelectorAll("tr").forEach(function (fila) {
    aplicar(fila.children);
  });
}

function contarColumnasVisiblesSeleccionados() {
  const nutrientesVisibles = COLUMNAS_NUTRIENTES_ALIMENTOS.filter(function (columna) {
    return esColumnaAlimentosVisible(columna.key);
  }).length;
  return 2 + nutrientesVisibles;
}

function obtenerAnchoBaseColumnaAlimentos(columna, esTablaTotales) {
  if (columna === "nombre") return 320;
  if (columna === "etiqueta") return 300;
  if (columna === "gramos") return 86;
  return esTablaTotales ? 100 : 86;
}

function obtenerAnchoMinimoColumnasAlimentos(columnas, esTablaTotales) {
  return columnas.reduce(function (total, columna) {
    if (!esColumnaAlimentosVisible(columna)) return total;
    return total + obtenerAnchoBaseColumnaAlimentos(columna, esTablaTotales);
  }, 0);
}

function aplicarAnchosColumnasAlimentos(tabla, columnas, esTablaTotales) {
  if (!tabla) return;

  const anchoMinimo = obtenerAnchoMinimoColumnasAlimentos(columnas, esTablaTotales);
  const porcentajes = {};

  columnas.forEach(function (columna) {
    if (!esColumnaAlimentosVisible(columna) || anchoMinimo <= 0) return;
    porcentajes[columna] = (obtenerAnchoBaseColumnaAlimentos(columna, esTablaTotales) / anchoMinimo) * 100;
  });

  tabla.querySelectorAll("[data-food-col]").forEach(function (celda) {
    const porcentaje = porcentajes[celda.dataset.foodCol];
    celda.style.width = porcentaje ? `${porcentaje}%` : "";
  });
}

function actualizarAnchosTablasAlimentos(columnasLista, columnasSeleccionados, columnasTotales) {
  const lista = document.getElementById("lista");
  const valores = document.getElementById("valores");
  const totales = document.querySelector(".scrollable-div-totales table");
  const aplicarAnchoFlexible = function (tabla, anchoMinimo) {
    if (!tabla) return;
    tabla.style.width = "100%";
    tabla.style.minWidth = `${anchoMinimo}px`;
  };

  aplicarAnchoFlexible(lista, obtenerAnchoMinimoColumnasAlimentos(columnasLista, false));
  aplicarAnchoFlexible(valores, obtenerAnchoMinimoColumnasAlimentos(columnasSeleccionados, false));
  aplicarAnchoFlexible(totales, obtenerAnchoMinimoColumnasAlimentos(columnasTotales, true));

  aplicarAnchosColumnasAlimentos(lista, columnasLista, false);
  aplicarAnchosColumnasAlimentos(valores, columnasSeleccionados, false);
  aplicarAnchosColumnasAlimentos(totales, columnasTotales, true);
}

function aplicarVisibilidadColumnasAlimentos() {
  const columnasSeleccionados = ["nombre", "gramos"].concat(obtenerColumnasNutrientesKeys());
  const lista = document.getElementById("lista");
  const listaTieneGramos = lista && lista.querySelectorAll("thead th").length === columnasSeleccionados.length;
  const columnasLista = listaTieneGramos
    ? columnasSeleccionados
    : ["nombre"].concat(obtenerColumnasNutrientesKeys());
  const columnasTotales = ["etiqueta"].concat(obtenerColumnasNutrientesKeys());

  aplicarAtributosColumnasTabla(lista, columnasLista);
  aplicarAtributosColumnasTabla(document.getElementById("valores"), columnasSeleccionados);
  aplicarAtributosColumnasTabla(document.querySelector(".scrollable-div-totales table"), columnasTotales);

  document.querySelectorAll("[data-food-col]").forEach(function (elemento) {
    elemento.classList.toggle("food-column-hidden", !esColumnaAlimentosVisible(elemento.dataset.foodCol));
  });

  document.querySelectorAll("#valores tr.table-info td[colspan]").forEach(function (celda) {
    celda.colSpan = contarColumnasVisiblesSeleccionados();
  });

  actualizarAnchosTablasAlimentos(columnasLista, columnasSeleccionados, columnasTotales);
  sincronizarConfigColumnasUI();
}

function renderizarConfiguracionColumnasAlimentos() {
  const contenedor = document.getElementById("config_columnas_alimentos");
  configurarBotonGuardarColumnasAlimentos();
  if (!contenedor || contenedor.dataset.rendered === "1") return;

  COLUMNAS_ALIMENTOS_OPCIONALES.forEach(function (columna) {
    const label = document.createElement("label");
    label.className = "config-column-option";
    label.setAttribute("for", `config_columna_${columna.key}`);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `config_columna_${columna.key}`;
    input.value = columna.key;
    input.addEventListener("change", function () {
      marcarCambiosPendientesColumnasAlimentos();
    });

    const texto = document.createElement("span");
    texto.textContent = columna.label;

    label.appendChild(input);
    label.appendChild(texto);
    contenedor.appendChild(label);
  });

  contenedor.dataset.rendered = "1";
}

function sincronizarConfigColumnasUI(forzar = false) {
  renderizarConfiguracionColumnasAlimentos();
  if (columnasAlimentosCambiosPendientes && !forzar) return;

  COLUMNAS_ALIMENTOS_OPCIONALES.forEach(function (columna) {
    const input = document.getElementById(`config_columna_${columna.key}`);
    if (input) input.checked = columnasAlimentosVisibles.has(columna.key);
  });
}

function programarGuardarColumnasAlimentosSupabase() {
  setConfigColumnasMensaje("");

  if (columnasAlimentosGuardadoRemotoTimer) {
    clearTimeout(columnasAlimentosGuardadoRemotoTimer);
  }

  columnasAlimentosGuardadoRemotoTimer = setTimeout(guardarColumnasAlimentosSupabase, 600);
}

async function guardarColumnasAlimentosSupabase() {
  columnasAlimentosGuardadoRemotoTimer = 0;

  const client = window.supabaseClient;
  const userId = pesoIdealSesionActiva && pesoIdealSesionActiva.user
    ? pesoIdealSesionActiva.user.id
    : "";
  if (!client || !userId) return true;

  const { error } = await client
    .from("profiles")
    .upsert({
      user_id: userId,
      columnas_alimentos_visibles: obtenerColumnasAlimentosVisiblesArray()
    }, { onConflict: "user_id" });

  if (error) {
    console.warn("No se pudo guardar la configuración de columnas en Supabase.", error.message);
    setConfigColumnasMensaje("No se pudo guardar la configuración en Supabase.", "error");
    return false;
  }

  return true;
}

async function cargarColumnasAlimentosSupabase(session) {
  const client = window.supabaseClient;
  if (!client || !session || !session.user) return false;

  const { data, error } = await client
    .from("profiles")
    .select("columnas_alimentos_visibles")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.warn("No se pudo cargar la configuración de columnas desde Supabase.", error.message);
    return false;
  }

  if (!data || !Array.isArray(data.columnas_alimentos_visibles)) return false;

  columnasAlimentosVisibles = normalizarColumnasAlimentosVisibles(data.columnas_alimentos_visibles);
  guardarColumnasAlimentosPersistidas();
  aplicarVisibilidadColumnasAlimentos();
  setConfigColumnasMensaje("");
  return true;
}

function obtenerClavePesoIdealPersistido() {
  return `${PESO_IDEAL_STORAGE_PREFIX}:${pesoIdealStorageScope}`;
}

function leerPesoIdealPersistido() {
  try {
    const valor = window.localStorage ? window.localStorage.getItem(obtenerClavePesoIdealPersistido()) : "";
    const numero = Number(valor);

    if (!valor || !Number.isFinite(numero) || numero <= 0) {
      return "";
    }

    return String(Math.trunc(numero));
  } catch (error) {
    return "";
  }
}

function guardarPesoIdealPersistido() {
  try {
    if (!window.localStorage) return;

    const pesoIdeal = obtenerPesoIdealMacronutrientes();
    const clave = obtenerClavePesoIdealPersistido();

    if (pesoIdeal > 0) {
      window.localStorage.setItem(clave, String(pesoIdeal));
    } else {
      window.localStorage.removeItem(clave);
    }
  } catch (error) {
    // El calculo debe seguir funcionando aunque el navegador bloquee localStorage.
  }
}

function programarGuardarPesoIdealSupabase() {
  if (pesoIdealGuardadoRemotoTimer) {
    clearTimeout(pesoIdealGuardadoRemotoTimer);
  }

  pesoIdealGuardadoRemotoTimer = setTimeout(guardarPesoIdealSupabase, 500);
}

async function guardarPesoIdealSupabase() {
  pesoIdealGuardadoRemotoTimer = 0;

  const client = window.supabaseClient;
  const userId = pesoIdealSesionActiva && pesoIdealSesionActiva.user
    ? pesoIdealSesionActiva.user.id
    : "";
  if (!client || !userId) return;

  const pesoIdeal = obtenerPesoIdealMacronutrientes();
  const payload = {
    user_id: userId,
    peso_ideal: pesoIdeal > 0 ? pesoIdeal : null
  };

  const { error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.warn("No se pudo guardar el peso ideal en Supabase.", error.message);
  }
}

async function cargarPesoIdealSupabase(session) {
  const client = window.supabaseClient;
  if (!client || !session || !session.user) return false;

  const { data, error } = await client
    .from("profiles")
    .select("peso_ideal")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.warn("No se pudo cargar el peso ideal desde Supabase.", error.message);
    return false;
  }

  const pesoIdeal = data ? Number(data.peso_ideal) : 0;
  if (!Number.isFinite(pesoIdeal) || pesoIdeal <= 0) return false;

  const pesoIdealInput = document.getElementById("macro_peso_ideal");
  if (!pesoIdealInput) return false;

  pesoIdealInput.value = String(Math.trunc(pesoIdeal));
  pesoIdealEditadoManualmente = true;
  guardarPesoIdealPersistido();
  return true;
}

function cargarPesoIdealPersistido() {
  const valorPersistido = leerPesoIdealPersistido();
  if (!valorPersistido) return false;

  const pesoIdealInput = document.getElementById("macro_peso_ideal");
  if (!pesoIdealInput) return false;

  pesoIdealInput.value = valorPersistido;
  pesoIdealEditadoManualmente = true;
  return true;
}

function restaurarPesoIdealOSincronizar() {
  if (cargarPesoIdealPersistido()) return true;

  pesoIdealEditadoManualmente = false;
  sincronizarPesoIdealConPesoActual(true);
  return false;
}

async function actualizarScopePesoIdealPersistido(session) {
  const siguienteScope = session && session.user && session.user.id
    ? session.user.id
    : "anonimo";

  pesoIdealSesionActiva = session || null;

  pesoIdealStorageScope = siguienteScope;
  const cargadoSupabase = await cargarPesoIdealSupabase(session);
  if (!cargadoSupabase) {
    const cargadoLocal = restaurarPesoIdealOSincronizar();
    if (cargadoLocal && session && session.user) {
      programarGuardarPesoIdealSupabase();
    }
  }

  const medidasCargadasSupabase = await cargarMedidasAntropometricasSupabase(session);
  if (!medidasCargadasSupabase) {
    const medidasCargadasLocal = restaurarMedidasAntropometricasOLimpiar();
    if (medidasCargadasLocal && session && session.user) {
      programarGuardarMedidasAntropometricasSupabase();
    }
  }

  const columnasCargadasSupabase = await cargarColumnasAlimentosSupabase(session);
  if (!columnasCargadasSupabase) {
    const columnasCargadasLocal = restaurarColumnasAlimentosOPredeterminadas();
    aplicarVisibilidadColumnasAlimentos();
    if (columnasCargadasLocal && session && session.user) {
      programarGuardarColumnasAlimentosSupabase();
    }
  }

  actualizarRequerimientoMacronutrientes();
}

function establecerPorcentajesMacronutrientes(proteina, grasa) {
  const proteinaInput = document.getElementById('macro_proteina_porcentaje');
  const grasaInput = document.getElementById('macro_grasa_porcentaje');
  const proteinaValor = proteina === undefined || proteina === null ? "" : proteina;
  const grasaValor = grasa === undefined || grasa === null ? "" : grasa;
  const proteinaNumero = parseFloat(proteinaValor.toString().replace(",", "."));
  const grasaNumero = parseFloat(grasaValor.toString().replace(",", "."));

  if (proteinaInput && !isNaN(proteinaNumero)) proteinaInput.value = proteinaNumero.toFixed(2);
  if (grasaInput && !isNaN(grasaNumero)) grasaInput.value = grasaNumero.toFixed(2);
}

function inferirPorcentajesMacronutrientesDesdeRequerimiento() {
  const energia = obtenerValorNumerico('input_energia_calculada_requerimiento');
  const gramosProteina = obtenerValorNumerico('input_proteina_requerimiento');
  const gramosGrasa = obtenerValorNumerico('input_grasa_requerimiento');

  if (energia <= 0) return;

  establecerPorcentajesMacronutrientes(
    (gramosProteina * 4 / energia) * 100,
    (gramosGrasa * 9 / energia) * 100
  );
}

function actualizarRequerimientoMacronutrientes() {
  sincronizarPesoIdealConPesoActual(false);
  const energia = obtenerValorNumerico('input_energia_calculada_requerimiento');
  const pesoIdeal = obtenerPesoIdealMacronutrientes();
  const porcentajeProteina = obtenerValorNumerico('macro_proteina_porcentaje');
  const porcentajeGrasa = obtenerValorNumerico('macro_grasa_porcentaje');
  const porcentajeCarbohidratos = 100 - porcentajeProteina - porcentajeGrasa;

  const kcalProteina = energia * (porcentajeProteina / 100);
  const kcalGrasa = energia * (porcentajeGrasa / 100);
  const kcalCarbohidratos = energia * (porcentajeCarbohidratos / 100);
  const gramosProteina = kcalProteina / 4;
  const gramosGrasa = kcalGrasa / 9;
  const gramosCarbohidratos = kcalCarbohidratos / 4;

  const carbohidratosPorcentaje = document.getElementById('macro_carbohidratos_porcentaje');
  if (carbohidratosPorcentaje) {
    carbohidratosPorcentaje.textContent = `${porcentajeCarbohidratos.toFixed(2)}%`;
  }

  actualizarTextoMacro('macro_proteina_kcal', kcalProteina, 'kcal');
  actualizarTextoMacro('macro_grasa_kcal', kcalGrasa, 'kcal');
  actualizarTextoMacro('macro_carbohidratos_kcal', kcalCarbohidratos, 'kcal');
  actualizarTextoMacro('macro_proteina_gramos', gramosProteina, 'g');
  actualizarTextoMacro('macro_grasa_gramos', gramosGrasa, 'g');
  actualizarTextoMacro('macro_carbohidratos_gramos', gramosCarbohidratos, 'g');
  actualizarTextoMacro('macro_proteina_gkg', pesoIdeal > 0 ? gramosProteina / pesoIdeal : 0, 'g/kg');
  actualizarTextoMacro('macro_grasa_gkg', pesoIdeal > 0 ? gramosGrasa / pesoIdeal : 0, 'g/kg');
  actualizarTextoMacro('macro_carbohidratos_gkg', pesoIdeal > 0 ? gramosCarbohidratos / pesoIdeal : 0, 'g/kg');

  const porcentajeInvalido = porcentajeProteina < 0 || porcentajeGrasa < 0 || porcentajeCarbohidratos < 0;
  const error = document.getElementById('macro_porcentaje_error');
  if (error) error.style.display = porcentajeInvalido ? 'block' : 'none';

  if (porcentajeInvalido || energia <= 0) return;

  const reqProtInput = document.getElementById('input_proteina_requerimiento');
  const reqGrasaInput = document.getElementById('input_grasa_requerimiento');
  const reqCarbInput = document.getElementById('input_carbohidratos_requerimiento');

  if (reqProtInput) reqProtInput.value = gramosProteina.toFixed(2);
  if (reqGrasaInput) reqGrasaInput.value = gramosGrasa.toFixed(2);
  if (reqCarbInput) reqCarbInput.value = gramosCarbohidratos.toFixed(2);

  calcular();
}

function configurarEventosMacronutrientes() {
  [
    'macro_proteina_porcentaje',
    'macro_grasa_porcentaje',
    'input_energia_calculada_requerimiento'
  ].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.addEventListener('input', actualizarRequerimientoMacronutrientes);
  });

  const pesoInput = document.getElementById('calc_peso');
  const pesoIdealInput = document.getElementById('macro_peso_ideal');

  if (pesoInput) {
    pesoInput.addEventListener('input', function () {
      sincronizarPesoIdealConPesoActual(false);
      if (!pesoIdealEditadoManualmente) {
        programarGuardarPesoIdealSupabase();
      }
      actualizarRequerimientoMacronutrientes();
    });
  }

  if (pesoIdealInput) {
    pesoIdealInput.addEventListener('input', function () {
      normalizarInputPesoIdeal();
      pesoIdealEditadoManualmente = Boolean(pesoIdealInput.value);
      guardarPesoIdealPersistido();
      programarGuardarPesoIdealSupabase();
      actualizarRequerimientoMacronutrientes();
    });
  }

  restaurarPesoIdealOSincronizar();
}

function configurarEventosMedidasAntropometricas() {
  const ids = MEDIDAS_ANTROPOMETRICAS_CAMPOS.map(function (campo) {
    return campo.id;
  }).concat("medidas_observaciones");

  ids.forEach(function (id) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.addEventListener("input", programarGuardarMedidasAntropometricasSupabase);
  });

  restaurarMedidasAntropometricasOLimpiar();
}

function inicializarIconosLucide() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function formatearFechaNombreArchivo(fechaValor) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let fecha = fechaValor || obtenerFechaActualInput();
  let partes = fecha.split("-");

  if (partes.length !== 3) {
    partes = obtenerFechaActualInput().split("-");
  }

  const anio = partes[0];
  const mes = parseInt(partes[1], 10) - 1;
  const dia = partes[2].padStart(2, "0");

  return `${dia} ${meses[mes] || meses[0]} ${anio}`;
}

function limpiarNombreArchivo(valor) {
  const nombre = (valor || "").trim().replace(/[<>:"/\\|?*]+/g, "");
  return nombre || "Paciente";
}

function obtenerNombreArchivoDescarga(extension) {
  const nombre = limpiarNombreArchivo(document.getElementById('calc_nombre') ? document.getElementById('calc_nombre').value : "");
  const fecha = formatearFechaNombreArchivo(document.getElementById('calc_fecha') ? document.getElementById('calc_fecha').value : "");

  return `${nombre} ${fecha}.${extension}`;
}

function obtenerTiempoDesdeTbody(tbody) {
  if (!tbody || !tbody.id || !tbody.id.startsWith("valores_")) return "Desayuno";
  return tbody.id.replace("valores_", "").replace(/_/g, " ");
}

function obtenerSlugTiempo(tiempo) {
  return String(tiempo || "Desayuno").trim().replace(/\s+/g, "_");
}

function obtenerIdTbodyTiempo(tiempo) {
  return "valores_" + obtenerSlugTiempo(tiempo);
}

function obtenerAlimentoSeleccionadoPorId(id) {
  return alimentos_seleccionados.find(function (item) {
    return item[0] + "" === id + "";
  });
}

function actualizarTiemposDesdeTabla() {
  document.querySelectorAll('#valores tbody[id^="valores_"] tr[id]').forEach(function (fila) {
    var datosAlimento = obtenerAlimentoSeleccionadoPorId(fila.id);
    if (datosAlimento) {
      datosAlimento[1].tiempo = obtenerTiempoDesdeTbody(fila.parentElement);
    }
  });
}

function configurarOrdenamientoTbody(valores_tbody) {
  if (!valores_tbody || valores_tbody.dataset.sortableInitialized) return;
  if (typeof Sortable === "undefined" || typeof Sortable.create !== "function") return;

  Sortable.create(valores_tbody, {
    animation: 150,
    dragClass: "drag",
    group: "alimentos-seleccionados",
    emptyInsertThreshold: 30,
    onEnd: function () {
      actualizarTiemposDesdeTabla();
      actualizarTotal(alimentos_seleccionados);
      calcular();
    }
  });

  valores_tbody.dataset.sortableInitialized = "true";
}

function inicializarOrdenamientoSeleccionados() {
  tiemposComida.forEach(function (tiempo) {
    configurarOrdenamientoTbody(document.getElementById(obtenerIdTbodyTiempo(tiempo)));
  });
}
//Descarga alimentos

function total_kilocalorias() {

  alimentos_total_kc['gramos'] = "";
  alimentos_total_kc['nombre'] = "Total Kilocalorias";
  alimentos_total_kc['energia_calculada'] = "";
  alimentos_total_kc['proteina'] = alimentos_total['proteina'] * 4
  alimentos_total_kc['grasa_total'] = alimentos_total['grasa_total'] * 9
  alimentos_total_kc['carbohidratos'] = alimentos_total['carbohidratos'] * 4

}

const ordenDeseado = ["nombre", "gramos"].concat(obtenerColumnasNutrientesKeys());

function descargar() {
  nuevoOrden();
  total_kilocalorias();
  let info = [];
  
  info.push({ "Tiempo de Comida": "Paciente Info", "nombre": "" });
  info.push({ "Tiempo de Comida": "Identificacion", "nombre": document.getElementById('calc_id') ? document.getElementById('calc_id').value : "" });
  info.push({ "Tiempo de Comida": "Fecha", "nombre": document.getElementById('calc_fecha') ? document.getElementById('calc_fecha').value : "" });
  info.push({ "Tiempo de Comida": "NombrePaciente", "nombre": document.getElementById('calc_nombre') ? document.getElementById('calc_nombre').value : "" });
  info.push({ "Tiempo de Comida": "Peso", "nombre": document.getElementById('calc_peso') ? document.getElementById('calc_peso').value : "" });
  info.push({ "Tiempo de Comida": "PesoIdeal", "nombre": document.getElementById('macro_peso_ideal') ? document.getElementById('macro_peso_ideal').value : "" });
  info.push({ "Tiempo de Comida": "Estatura", "nombre": document.getElementById('calc_estatura') ? document.getElementById('calc_estatura').value : "" });
  info.push({ "Tiempo de Comida": "Edad", "nombre": document.getElementById('calc_edad') ? document.getElementById('calc_edad').value : "" });
  info.push({ "Tiempo de Comida": "Genero", "nombre": document.getElementById('calc_genero') ? document.getElementById('calc_genero').value : "" });
  info.push({ "Tiempo de Comida": "Actividad", "nombre": document.getElementById('calc_actividad') ? document.getElementById('calc_actividad').value : "" });
  info.push({
    "Tiempo de Comida": "Macronutrientes",
    "nombre": "Porcentajes",
    "macro_proteina_porcentaje": obtenerValorNumerico('macro_proteina_porcentaje'),
    "macro_grasa_porcentaje": obtenerValorNumerico('macro_grasa_porcentaje'),
    "macro_carbohidratos_porcentaje": 100 - obtenerValorNumerico('macro_proteina_porcentaje') - obtenerValorNumerico('macro_grasa_porcentaje')
  });
  info.push({}); // spacing
  
  let itemsPorTiempo = { "Desayuno": [], "Media Mañana": [], "Almuerzo": [], "Media Tarde": [], "Merienda": [] };
  
  for (const clave in alimentos_seleccionados_en_orden) {
    let item = alimentos_seleccionados_en_orden[clave];
    let aux_info = { "Tiempo de Comida": item.tiempo || "Desayuno" };
    for (let i = 0; i < ordenDeseado.length; i++) {
        aux_info[ordenDeseado[i]] = item[ordenDeseado[i]];
    }
    let tiempo = item.tiempo || "Desayuno";
    if (itemsPorTiempo[tiempo]) {
       itemsPorTiempo[tiempo].push(aux_info);
    }
  }

  const tiempos = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda"];
  for (let t of tiempos) {
    if (itemsPorTiempo[t].length > 0) {
      for (let item of itemsPorTiempo[t]) {
        info.push(item);
      }
      if (window.alimentos_subtotales && window.alimentos_subtotales[t]) {
        let sub_row = { "Tiempo de Comida": "Subtotal " + t, "nombre": "" };
        Object.assign(sub_row, window.alimentos_subtotales[t]);
        info.push(sub_row);
        info.push({}); // Empty spacing row
      }
    }
  }

  let total_row = { "Tiempo de Comida": "TOTAL" };
  Object.assign(total_row, alimentos_total);
  info.push(total_row);

  let kc_row = { "Tiempo de Comida": "" };
  Object.assign(kc_row, alimentos_total_kc);
  info.push(kc_row);

  let req_row = { "Tiempo de Comida": "" };
  Object.assign(req_row, alimentos_requerimiento);
  info.push(req_row);

  let adec_row = { "Tiempo de Comida": "" };
  Object.assign(adec_row, alimentos_adecuacion);
  info.push(adec_row);

  (async () => {
    const worksheet = XLSX.utils.json_to_sheet(info);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    let filename = obtenerNombreArchivoDescarga("xlsx");
    XLSX.writeFile(workbook, filename, { compression: true });
  })();
}

function nuevoOrden() {
  actualizarTiemposDesdeTabla();
  // Mantenemos el destino como arreglo para asegurar orden correcto y permitir repetidos
  alimentos_seleccionados_en_orden = [];

  var tabla = document.getElementById("valores");
  var filas = tabla.getElementsByTagName("tr");

  for (var i = 0; i < filas.length; i++) {
    var idFila = filas[i].id;

    if (idFila) {
      // Buscamos en el array 'alimentos_seleccionados' el sub-array 
      // cuyo primer elemento (índice 0) sea el identificador de fila (codigo_producto).
      var datosAlimento = alimentos_seleccionados.find(function (item) {
        return item[0] + "" === idFila + "";
      });
      // Si lo encontramos, lo agregamos a la lista ordenada
      if (datosAlimento) {
        alimentos_seleccionados_en_orden.push(datosAlimento[1]);
      }
    }
  }
}

// Buscar alimentos y mostrarlos en una lista
function calcular() {
  const energia_calculada_T = parseFloat(document.getElementById('energia_calculada_total').textContent);
  const proteina_T = parseFloat(document.getElementById('proteina_total').textContent);
  const grasa_T = parseFloat(document.getElementById('grasa_total').textContent);
  const carbohidratos_T = parseFloat(document.getElementById('carbohidratos_total').textContent);
  const fibra_T = parseFloat(document.getElementById('fibra_total').textContent);
  const ags_T = parseFloat(document.getElementById('ags_total').textContent);
  const agm_T = parseFloat(document.getElementById('agm_total').textContent);
  const agpi_T = parseFloat(document.getElementById('agpi_total').textContent);
  const colesterol_T = parseFloat(document.getElementById('colesterol_total').textContent);
  const calcio_T = parseFloat(document.getElementById('calcio_total').textContent);
  const fosforo_T = parseFloat(document.getElementById('fosforo_total').textContent);
  const hierro_T = parseFloat(document.getElementById('hierro_total').textContent);
  const potasio_T = parseFloat(document.getElementById('potasio_total').textContent);
  const sodio_T = parseFloat(document.getElementById('sodio_total').textContent);
  const zinc_T = parseFloat(document.getElementById('zinc_total').textContent);
  const vitamina_c_T = parseFloat(document.getElementById('vitamina_c_total').textContent);
  const vitamina_a_T = parseFloat(document.getElementById('vitamina_a_total').textContent);
  const folatos_T = parseFloat(document.getElementById('folatos_total').textContent);
  const vitamina_b12_T = parseFloat(document.getElementById('vitamina_b12_total').textContent);

  alimentos_total['gramos'] = "";
  alimentos_total['nombre'] = "Total";
  alimentos_total['energia_calculada'] = energia_calculada_T;
  alimentos_total['proteina'] = proteina_T;
  alimentos_total['grasa_total'] = grasa_T;
  alimentos_total['carbohidratos'] = carbohidratos_T;
  alimentos_total['fibra'] = fibra_T;
  alimentos_total['ags'] = ags_T;
  alimentos_total['agm'] = agm_T;
  alimentos_total['agpi'] = agpi_T;
  alimentos_total['colesterol'] = colesterol_T;
  alimentos_total['calcio'] = calcio_T;
  alimentos_total['fosforo'] = fosforo_T;
  alimentos_total['hierro'] = hierro_T;
  alimentos_total['potasio'] = potasio_T;
  alimentos_total['sodio'] = sodio_T;
  alimentos_total['zinc'] = zinc_T;
  alimentos_total['vitamina_c'] = vitamina_c_T;
  alimentos_total['vitamina_a'] = vitamina_a_T;
  alimentos_total['folatos'] = folatos_T;
  alimentos_total['vitamina_b12'] = vitamina_b12_T;


  const energia_calculada_R = parseFloat(document.getElementById('input_energia_calculada_requerimiento').value);
  const proteina_R = parseFloat(document.getElementById('input_proteina_requerimiento').value);
  const grasa_R = parseFloat(document.getElementById('input_grasa_requerimiento').value);
  const carbohidratos_R = parseFloat(document.getElementById('input_carbohidratos_requerimiento').value);
  const fibra_R = parseFloat(document.getElementById('input_fibra_requerimiento').value);
  const ags_R = parseFloat(document.getElementById("input_ags_requerimiento").value);
  const agm_R = parseFloat(document.getElementById("input_agm_requerimiento").value);
  const agpi_R = parseFloat(document.getElementById("input_agpi_requerimiento").value);
  const colesterol_R = parseFloat(document.getElementById("input_colesterol_requerimiento").value);
  const calcio_R = parseFloat(document.getElementById("input_calcio_requerimiento").value);
  const fosforo_R = parseFloat(document.getElementById("input_fosforo_requerimiento").value);
  const hierro_R = parseFloat(document.getElementById("input_hierro_requerimiento").value);
  const potasio_R = parseFloat(document.getElementById("input_potasio_requerimiento").value);
  const sodio_R = parseFloat(document.getElementById("input_sodio_requerimiento").value);
  const zinc_R = parseFloat(document.getElementById("input_zinc_requerimiento").value);
  const vitamina_c_R = parseFloat(document.getElementById("input_vitamina_c_requerimiento").value);
  const vitamina_a_R = parseFloat(document.getElementById("input_vitamina_a_requerimiento").value);
  const folatos_R = parseFloat(document.getElementById("input_folatos_requerimiento").value);
  const vitamina_b12_R = parseFloat(document.getElementById("input_vitamina_b12_requerimiento").value);


  alimentos_requerimiento['gramos'] = "";
  alimentos_requerimiento['nombre'] = "Requerimiento";
  alimentos_requerimiento['energia_calculada'] = energia_calculada_R;
  alimentos_requerimiento['proteina'] = (proteina_R);
  alimentos_requerimiento['grasa_total'] = (grasa_R);
  alimentos_requerimiento['carbohidratos'] = (carbohidratos_R);
  alimentos_requerimiento['fibra'] = (fibra_R);
  alimentos_requerimiento['ags'] = (ags_R);
  alimentos_requerimiento['agm'] = (agm_R);
  alimentos_requerimiento['agpi'] = (agpi_R);
  alimentos_requerimiento['colesterol'] = (colesterol_R);
  alimentos_requerimiento['calcio'] = (calcio_R);
  alimentos_requerimiento['fosforo'] = (fosforo_R);
  alimentos_requerimiento['hierro'] = (hierro_R);
  alimentos_requerimiento['potasio'] = (potasio_R);
  alimentos_requerimiento['sodio'] = (sodio_R);
  alimentos_requerimiento['zinc'] = (zinc_R);
  alimentos_requerimiento['vitamina_c'] = (vitamina_c_R);
  alimentos_requerimiento['vitamina_a'] = (vitamina_a_R);
  alimentos_requerimiento['folatos'] = (folatos_R);
  alimentos_requerimiento['vitamina_b12'] = (vitamina_b12_R);


  var energia_calculada_A = document.getElementById('adecuacion_energia_calculada');
  var proteina_A = document.getElementById('adecuacion_proteina');
  var grasa_A = document.getElementById('adecuacion_grasa');
  var carbohidratos_A = document.getElementById('adecuacion_carbohidratos');
  var fibra_A = document.getElementById('adecuacion_fibra');
  var ags_A = document.getElementById('adecuacion_ags');
  var agm_A = document.getElementById('adecuacion_agm');
  var agpi_A = document.getElementById('adecuacion_agpi');
  var colesterol_A = document.getElementById('adecuacion_colesterol');
  var calcio_A = document.getElementById('adecuacion_calcio');
  var fosforo_A = document.getElementById('adecuacion_fosforo');
  var hierro_A = document.getElementById('adecuacion_hierro');
  var potasio_A = document.getElementById('adecuacion_potasio');
  var sodio_A = document.getElementById('adecuacion_sodio');
  var zinc_A = document.getElementById('adecuacion_zinc');
  var vitamina_c_A = document.getElementById('adecuacion_vitamina_c');
  var vitamina_a_A = document.getElementById('adecuacion_vitamina_a');
  var folatos_A = document.getElementById('adecuacion_folatos');
  var vitamina_b12_A = document.getElementById('adecuacion_vitamina_b12');


  energia_calculada_A.textContent = (100 * energia_calculada_T / energia_calculada_R).toFixed(2) + '%';
  proteina_A.textContent = (100 * proteina_T / proteina_R).toFixed(2) + '%';
  grasa_A.textContent = (100 * grasa_T / grasa_R).toFixed(2) + '%';
  carbohidratos_A.textContent = (100 * carbohidratos_T / carbohidratos_R).toFixed(2) + '%';
  fibra_A.textContent = (100 * fibra_T / fibra_R).toFixed(2) + '%';
  ags_A.textContent = (100 * ags_T / ags_R).toFixed(2) + '%';
  agm_A.textContent = (100 * agm_T / agm_R).toFixed(2) + '%';
  agpi_A.textContent = (100 * agpi_T / agpi_R).toFixed(2) + '%';
  colesterol_A.textContent = (100 * colesterol_T / colesterol_R).toFixed(2) + '%';
  calcio_A.textContent = (100 * calcio_T / calcio_R).toFixed(2) + '%';
  fosforo_A.textContent = (100 * fosforo_T / fosforo_R).toFixed(2) + '%';
  hierro_A.textContent = (100 * hierro_T / hierro_R).toFixed(2) + '%';
  potasio_A.textContent = (100 * potasio_T / potasio_R).toFixed(2) + '%';
  sodio_A.textContent = (100 * sodio_T / sodio_R).toFixed(2) + '%';
  zinc_A.textContent = (100 * zinc_T / zinc_R).toFixed(2) + '%';
  vitamina_c_A.textContent = (100 * vitamina_c_T / vitamina_c_R).toFixed(2) + '%';
  vitamina_a_A.textContent = (100 * vitamina_a_T / vitamina_a_R).toFixed(2) + '%';
  folatos_A.textContent = (100 * folatos_T / folatos_R).toFixed(2) + '%';
  vitamina_b12_A.textContent = (100 * vitamina_b12_T / vitamina_b12_R).toFixed(2) + '%';


  alimentos_adecuacion['gramos'] = "";
  alimentos_adecuacion['nombre'] = "Porcentaje de Adecuación";
  alimentos_adecuacion['energia_calculada'] = parseFloat(energia_calculada_A.textContent);
  alimentos_adecuacion['proteina'] = parseFloat(proteina_A.textContent);
  alimentos_adecuacion['grasa_total'] = parseFloat(grasa_A.textContent);
  alimentos_adecuacion['carbohidratos'] = parseFloat(carbohidratos_A.textContent);
  alimentos_adecuacion['fibra'] = parseFloat(fibra_A.textContent);
  alimentos_adecuacion['ags'] = parseFloat(ags_A.textContent);
  alimentos_adecuacion['agm'] = parseFloat(agm_A.textContent);
  alimentos_adecuacion['agpi'] = parseFloat(agpi_A.textContent);
  alimentos_adecuacion['colesterol'] = parseFloat(colesterol_A.textContent);
  alimentos_adecuacion['calcio'] = parseFloat(calcio_A.textContent);
  alimentos_adecuacion['fosforo'] = parseFloat(fosforo_A.textContent);
  alimentos_adecuacion['hierro'] = parseFloat(hierro_A.textContent);
  alimentos_adecuacion['potasio'] = parseFloat(potasio_A.textContent);
  alimentos_adecuacion['sodio'] = parseFloat(sodio_A.textContent);
  alimentos_adecuacion['zinc'] = parseFloat(zinc_A.textContent);
  alimentos_adecuacion['vitamina_c'] = parseFloat(vitamina_c_A.textContent);
  alimentos_adecuacion['vitamina_a'] = parseFloat(vitamina_a_A.textContent);
  alimentos_adecuacion['folatos'] = parseFloat(folatos_A.textContent);
  alimentos_adecuacion['vitamina_b12'] = parseFloat(vitamina_b12_A.textContent);
}

let nutrientesActivos = [];

function toggleFiltro(btn) {
  const nutriente = btn.getAttribute('data-nutriente');
  
  if (nutrientesActivos.includes(nutriente)) {
    // Si ya está activo, lo quitamos por completo
    nutrientesActivos = [];
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-primary');
  } else {
    // Apagamos todos los botones visualmente primero
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    botonesFiltro.forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-outline-primary');
    });

    // Registramos este como el único filtro activo
    nutrientesActivos = [nutriente];
    btn.classList.remove('btn-outline-primary');
    btn.classList.add('btn-primary');
  }
  
  // Refrescamos la búsqueda
  buscar();
}

function buscar() {
  const busqueda = document.getElementById('busqueda').value;
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  lista.classList.add('table', 'table-striped', 'table-hover', 'table-sm', 'custom-width-table');

  const th_nombre = document.createElement('th');
  const th_energia_calculada = document.createElement('th');
  const th_proteina = document.createElement('th');
  const th_grasa_total = document.createElement('th');
  const th_carbohidratos = document.createElement('th');
  const th_fibra = document.createElement('th');
  const th_ags = document.createElement('th');
  const th_agm = document.createElement('th');
  const th_agpi = document.createElement('th');
  const th_colesterol = document.createElement('th');
  const th_calcio = document.createElement('th');
  const th_fosforo = document.createElement('th');
  const th_hierro = document.createElement('th');
  const th_potasio = document.createElement('th');
  const th_sodio = document.createElement('th');
  const th_zinc = document.createElement('th');
  const th_vitamina_c = document.createElement('th');
  const th_vitamina_a = document.createElement('th');
  const th_folatos = document.createElement('th');
  const th_vitamina_b12 = document.createElement('th');

  //Se agregan clases a cada uno de los componentes.
  th_nombre.classList.add('ancho-alimento');
  th_energia_calculada.classList.add('ancho-celda');
  th_proteina.classList.add('ancho-celda');
  th_grasa_total.classList.add('ancho-celda');
  th_carbohidratos.classList.add('ancho-celda');
  th_fibra.classList.add('ancho-celda');
  th_ags.classList.add('ancho-celda');
  th_agm.classList.add('ancho-celda');
  th_agpi.classList.add('ancho-celda');
  th_colesterol.classList.add('ancho-celda');
  th_calcio.classList.add('ancho-celda');
  th_fosforo.classList.add('ancho-celda');
  th_hierro.classList.add('ancho-celda');
  th_potasio.classList.add('ancho-celda');
  th_sodio.classList.add('ancho-celda');
  th_zinc.classList.add('ancho-celda');
  th_vitamina_c.classList.add('ancho-celda');
  th_vitamina_a.classList.add('ancho-celda');
  th_folatos.classList.add('ancho-celda');
  th_vitamina_b12.classList.add('ancho-celda');

  //
  th_nombre.textContent = "Nombre";
  th_energia_calculada.textContent = "Energía calculada";
  th_proteina.textContent = "Proteína";
  th_grasa_total.textContent = "Grasa total";
  th_carbohidratos.textContent = "Carbohidratos";
  th_fibra.textContent = "Fibra";
  th_ags.textContent = "AGS";
  th_agm.textContent = "AGM";
  th_agpi.textContent = "AGPI";
  th_colesterol.textContent = "Colesterol";
  th_calcio.textContent = "Calcio";
  th_fosforo.textContent = "Fosforo";
  th_hierro.textContent = "Hierro";
  th_potasio.textContent = "Potasio";
  th_sodio.textContent = "Sodio";
  th_zinc.textContent = "Zinc";
  th_vitamina_c.textContent = "Vitamina C";
  th_vitamina_a.textContent = "Vitamina A";
  th_folatos.textContent = "Folatos";
  th_vitamina_b12.textContent = "Vitamina B12";


  const encabezado = document.createElement('thead');
  encabezado.classList.add('table-primary');

  encabezado.appendChild(th_nombre);
  encabezado.appendChild(th_energia_calculada);
  encabezado.appendChild(th_proteina);
  encabezado.appendChild(th_grasa_total);
  encabezado.appendChild(th_carbohidratos);
  encabezado.appendChild(th_fibra);
  encabezado.appendChild(th_ags);
  encabezado.appendChild(th_agm);
  encabezado.appendChild(th_agpi);
  encabezado.appendChild(th_colesterol);
  encabezado.appendChild(th_calcio);
  encabezado.appendChild(th_fosforo);
  encabezado.appendChild(th_hierro);
  encabezado.appendChild(th_potasio);
  encabezado.appendChild(th_sodio);
  encabezado.appendChild(th_zinc);
  encabezado.appendChild(th_vitamina_c);
  encabezado.appendChild(th_vitamina_a);
  encabezado.appendChild(th_folatos);
  encabezado.appendChild(th_vitamina_b12);


  lista.appendChild(encabezado);

  const tbody = document.createElement('tbody');

  let resultados = [];

  for (let i = 0; i < alimentos.length; i++) {
    if (alimentos[i].nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      let sumarNutrientes = 0;
      let cumpleFiltro = true;

      // Si hay filtros aplicados, verificamos la métrica
      if (nutrientesActivos.length > 0) {
        for (let nutriente of nutrientesActivos) {
          // Algunos valores pueden ser cadena vacía, '-' o venir en string
          let valor = parseFloat(alimentos[i][nutriente]) || 0;
          
          // El alimento DEBE tener todos los nutrientes seleccionados (> 0)
          if (valor <= 0) {
            cumpleFiltro = false;
          }
          
          sumarNutrientes += valor;
        }
      }

      if (cumpleFiltro) {
        resultados.push({
          alimento: alimentos[i],
          metrica: sumarNutrientes
        });
      }
    }
  }

  // Si hay filtros, ordenamos con la métrica sumada de mayor a menor
  if (nutrientesActivos.length > 0) {
    resultados.sort((a, b) => b.metrica - a.metrica);
  }

  for (let iter = 0; iter < resultados.length; iter++) {
    let alim = resultados[iter].alimento;

    const td_nombre = document.createElement('td');
    const td_energia_calculada = document.createElement('td');
    const td_proteina = document.createElement('td');
    const td_grasa_total = document.createElement('td');
    const td_carbohidratos = document.createElement('td');
    const td_fibra = document.createElement('td');
    const td_ags = document.createElement('td');
    const td_agm = document.createElement('td');
    const td_agpi = document.createElement('td');
    const td_colesterol = document.createElement('td');
    const td_calcio = document.createElement('td');
    const td_fosforo = document.createElement('td');
    const td_hierro = document.createElement('td');
    const td_potasio = document.createElement('td');
    const td_sodio = document.createElement('td');
    const td_zinc = document.createElement('td');
    const td_vitamina_c = document.createElement('td');
    const td_vitamina_a = document.createElement('td');
    const td_folatos = document.createElement('td');
    const td_vitamina_b12 = document.createElement('td');

    td_nombre.textContent = alim.nombre;
    td_energia_calculada.textContent = alim.energia_calculada;
    td_proteina.textContent = alim.proteina;
    td_grasa_total.textContent = alim.grasa_total;
    td_carbohidratos.textContent = alim.carbohidratos;
    td_fibra.textContent = alim.fibra;
    td_ags.textContent = alim.ags;
    td_agm.textContent = alim.agm;
    td_agpi.textContent = alim.agpi;
    td_colesterol.textContent = alim.colesterol;
    td_calcio.textContent = alim.calcio;
    td_fosforo.textContent = alim.fosforo;
    td_hierro.textContent = alim.hierro;
    td_potasio.textContent = alim.potasio;
    td_sodio.textContent = alim.sodio;
    td_zinc.textContent = alim.zinc;
    td_vitamina_c.textContent = alim.vitamina_c;
    td_vitamina_a.textContent = alim.vitamina_a;
    td_folatos.textContent = alim.folatos;
    td_vitamina_b12.textContent = alim.vitamina_b12;

    const fila = document.createElement('tr');

    fila.addEventListener('click', () => abrirModalTiempo(alim));

    fila.appendChild(td_nombre);
    fila.appendChild(td_energia_calculada);
    fila.appendChild(td_proteina);
    fila.appendChild(td_grasa_total);
    fila.appendChild(td_carbohidratos);
    fila.appendChild(td_fibra);
    fila.appendChild(td_ags);
    fila.appendChild(td_agm);
    fila.appendChild(td_agpi);
    fila.appendChild(td_colesterol);
    fila.appendChild(td_calcio);
    fila.appendChild(td_fosforo);
    fila.appendChild(td_hierro);
    fila.appendChild(td_potasio);
    fila.appendChild(td_sodio);
    fila.appendChild(td_zinc);
    fila.appendChild(td_vitamina_c);
    fila.appendChild(td_vitamina_a);
    fila.appendChild(td_folatos);
    fila.appendChild(td_vitamina_b12);

    tbody.append(fila);
  }

  lista.appendChild(tbody);
  aplicarAtributosColumnasTabla(lista, ["nombre"].concat(obtenerColumnasNutrientesKeys()));
  aplicarVisibilidadColumnasAlimentos();

}

//De lo que se observa, esto es para agregar un elemento cuando se lo carga desde un archivo excel.
function agregarAlimentos(gramos, nombreAlimento, tiempoComida = "Desayuno") {
  for (let i = 0; i < alimentos.length; i++) {
    if (alimentos[i].nombre === nombreAlimento) {
      agregar(gramos, alimentos[i], tiempoComida);
      break;
    }
  }
}

function calculoActualizarValores(alimento, id, inputGramos, factor, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
  ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12) {

  var valor_nombre = alimento.nombre;
  var valor_energia_calculada = parseFloat(alimento.energia_calculada);
  var valor_proteina = parseFloat(alimento.proteina);
  var valor_grasa_total = parseFloat(alimento.grasa_total);
  var valor_carbohidratos = parseFloat(alimento.carbohidratos);
  var valor_fibra = parseFloat(alimento.fibra);
  var valor_ags = parseFloat(alimento.ags);
  var valor_agm = parseFloat(alimento.agm);
  var valor_agpi = parseFloat(alimento.agpi);
  var valor_colesterol = parseFloat(alimento.colesterol);
  var valor_calcio = parseFloat(alimento.calcio);
  var valor_fosforo = parseFloat(alimento.fosforo);
  var valor_hierro = parseFloat(alimento.hierro);
  var valor_potasio = parseFloat(alimento.potasio);
  var valor_sodio = parseFloat(alimento.sodio);
  var valor_zinc = parseFloat(alimento.zinc);
  var valor_vitamina_c = parseFloat(alimento.vitamina_c);
  var valor_vitamina_a = parseFloat(alimento.vitamina_a);
  var valor_folatos = parseFloat(alimento.folatos);
  var valor_vitamina_b12 = parseFloat(alimento.vitamina_b12);

  for (const clave in alimentos_seleccionados) {
    codigo_producto = alimentos_seleccionados[clave][0];
    if (id === codigo_producto + "") {
      console.log("***valor_nombre: " + valor_nombre);
      alimentos_seleccionados[clave][1].nombre = valor_nombre;
      alimentos_seleccionados[clave][1].gramos = inputGramos;
      alimentos_seleccionados[clave][1].energia_calculada = factor * valor_energia_calculada;
      alimentos_seleccionados[clave][1].proteina = factor * valor_proteina;
      alimentos_seleccionados[clave][1].grasa_total = factor * valor_grasa_total;
      alimentos_seleccionados[clave][1].carbohidratos = factor * valor_carbohidratos;
      alimentos_seleccionados[clave][1].fibra = factor * valor_fibra;
      alimentos_seleccionados[clave][1].ags = factor * valor_ags;
      alimentos_seleccionados[clave][1].agm = factor * valor_agm;
      alimentos_seleccionados[clave][1].agpi = factor * valor_agpi;
      alimentos_seleccionados[clave][1].colesterol = factor * valor_colesterol;
      alimentos_seleccionados[clave][1].calcio = factor * valor_calcio;
      alimentos_seleccionados[clave][1].fosforo = factor * valor_fosforo;
      alimentos_seleccionados[clave][1].hierro = factor * valor_hierro;
      alimentos_seleccionados[clave][1].potasio = factor * valor_potasio;
      alimentos_seleccionados[clave][1].sodio = factor * valor_sodio;
      alimentos_seleccionados[clave][1].zinc = factor * valor_zinc;
      alimentos_seleccionados[clave][1].vitamina_c = factor * valor_vitamina_c;
      alimentos_seleccionados[clave][1].vitamina_a = factor * valor_vitamina_a;
      alimentos_seleccionados[clave][1].folatos = factor * valor_folatos;
      alimentos_seleccionados[clave][1].vitamina_b12 = factor * valor_vitamina_b12;
      break;
    }
  }

  //Elementos html para cada fila en los elementos seleccionados, se están enviando como parámetros.
  energia_calculada.textContent = (valor_energia_calculada * factor).toFixed(2);
  proteina.textContent = (valor_proteina * factor).toFixed(2);
  grasa_total.textContent = (valor_grasa_total * factor).toFixed(2);
  carbohidratos.textContent = (valor_carbohidratos * factor).toFixed(2);
  fibra.textContent = (valor_fibra * factor).toFixed(2);
  ags.textContent = (valor_ags * factor).toFixed(2);
  agm.textContent = (valor_agm * factor).toFixed(2);
  agpi.textContent = (valor_agpi * factor).toFixed(2);
  colesterol.textContent = (valor_colesterol * factor).toFixed(2);
  calcio.textContent = (valor_calcio * factor).toFixed(2);
  fosforo.textContent = (valor_fosforo * factor).toFixed(2);
  hierro.textContent = (valor_hierro * factor).toFixed(2);
  potasio.textContent = (valor_potasio * factor).toFixed(2);
  sodio.textContent = (valor_sodio * factor).toFixed(2);
  zinc.textContent = (valor_zinc * factor).toFixed(2);
  vitamina_c.textContent = (valor_vitamina_c * factor).toFixed(2);
  vitamina_a.textContent = (valor_vitamina_a * factor).toFixed(2);
  folatos.textContent = (valor_folatos * factor).toFixed(2);
  vitamina_b12.textContent = (valor_vitamina_b12 * factor).toFixed(2);

  actualizarTotal(alimentos_seleccionados);
  calcular();
}


function actualizarValores(event, alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
  ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12) {
  var inputGramos = 0;

  if (isNaN(event.target.value) || event.target.value === "" || parseFloat(event.target.value) < 0) {
    inputGramos = 0;
  } else {
    inputGramos = parseFloat(event.target.value);
  }
  if (event === null) {
    inputGramos = 0;
  }

  var factor = inputGramos / 100;

  calculoActualizarValores(alimento, event.target.id, inputGramos, factor, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
    ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12);

}
function eliminar(alimento, id) {
  var respuesta = confirm('¿Estás seguro de eliminar el alimento?');
  if (respuesta) {
    for (const clave in alimentos_seleccionados) {
      if (id + "" === alimentos_seleccionados[clave][0] + "") {
        var row = document.getElementById(id);
        row.remove();
        alimentos_seleccionados.splice(clave, 1);
        break;
      }
    }
    //delete alimentos_seleccionados[alimento];
    actualizarTotal(alimentos_seleccionados);
    calcular();
  }
}
function abrirModalTiempo(alimento) {
  if (!alimento) return;
  alimentoPendiente = alimento;
  const nombreModal = document.getElementById('modalAlimentoName');
  if (nombreModal) nombreModal.textContent = alimento.nombre;
  mostrarModalTiempo();
}

function limpiarRestosModalTiempo() {
  if (document.querySelector(".modal.show")) return;

  document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
    backdrop.remove();
  });

  document.body.classList.remove("modal-open");
  document.body.style.paddingRight = "";
}

function cerrarPanelTiempoClickFuera(event) {
  const panel = document.getElementById("mealSelectionModal");
  if (!panel || panel.hidden || panel.contains(event.target)) return;
  cerrarModalTiempo();
}

function cerrarPanelTiempoConEscape(event) {
  if (event.key === "Escape") cerrarModalTiempo();
}

function activarCierrePanelTiempo() {
  document.removeEventListener("mousedown", cerrarPanelTiempoClickFuera);
  document.removeEventListener("keydown", cerrarPanelTiempoConEscape);

  window.setTimeout(function () {
    document.addEventListener("mousedown", cerrarPanelTiempoClickFuera);
    document.addEventListener("keydown", cerrarPanelTiempoConEscape);
  }, 0);
}

function desactivarCierrePanelTiempo() {
  document.removeEventListener("mousedown", cerrarPanelTiempoClickFuera);
  document.removeEventListener("keydown", cerrarPanelTiempoConEscape);
}

function mostrarModalTiempo() {
  const panel = document.getElementById("mealSelectionModal");
  if (!panel) return;

  limpiarRestosModalTiempo();
  panel.hidden = false;
  panel.setAttribute("aria-hidden", "false");
  panel.classList.add("is-open");
  activarCierrePanelTiempo();
}

function cerrarModalTiempo() {
  const panel = document.getElementById("mealSelectionModal");
  if (!panel) return;

  panel.classList.remove("is-open");
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  alimentoPendiente = null;
  desactivarCierrePanelTiempo();
  limpiarRestosModalTiempo();
}

function seleccionarTiempo(tiempo) {
  const alimento = alimentoPendiente;
  cerrarModalTiempo();

  if (!alimento) return;

  try {
    agregar(baseGramos, alimento, tiempo);
  } catch (error) {
    console.error("No se pudo agregar el alimento.", error);
    alert("No se pudo agregar el alimento. Revisa la consola para ver el detalle.");
  }
}

// agregar un alimento a la tabla de valores nutricionales
function agregar(valorGramos, alimento, tiempo = "Desayuno") {
  let tiempoSeleccionado = tiempo || "Desayuno";
  let valores_tbody = document.getElementById(obtenerIdTbodyTiempo(tiempoSeleccionado));

  if (!valores_tbody && tiempoSeleccionado !== "Desayuno") {
    console.warn(`No se encontro la tabla para ${tiempoSeleccionado}. Se usara Desayuno.`);
    tiempoSeleccionado = "Desayuno";
    valores_tbody = document.getElementById(obtenerIdTbodyTiempo(tiempoSeleccionado));
  }

  if (!valores_tbody) {
    throw new Error("No se encontro la tabla de alimentos seleccionados.");
  }

  configurarOrdenamientoTbody(valores_tbody);

  const encabezado = document.getElementById("encabezado_valores");
  if (encabezado) encabezado.classList.add('table-primary');


  //Crea una fila y le agrega un id.
  const fila = document.createElement('tr');
  //fila.id = alimento.nombre;
  fila.id = contadorFila;
  //fila.setAttribute('data-id', contador);
  let valor_enviar = contadorFila
  fila.addEventListener('dblclick', () => eliminar(contadorFila, valor_enviar));

  const nombre = document.createElement('td');
  nombre.textContent = alimento.nombre;

  fila.appendChild(nombre);

  //Colocamos un elemento input en el td
  const gramos = document.createElement('td');
  const campoTexto = document.createElement('input');
  campoTexto.type = 'text';
  campoTexto.style.maxWidth = "80px";
  campoTexto.value = valorGramos;
  campoTexto.id = contadorFila;
  contadorFila++;
  campoTexto.addEventListener('input', (event) => actualizarValores(event,
    alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
    ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc,
    vitamina_c, vitamina_a, folatos, vitamina_b12));

  gramos.appendChild(campoTexto);
  fila.appendChild(gramos);

  const energia_calculada = document.createElement('td');
  energia_calculada.textContent = alimento.energia_calculada;
  fila.appendChild(energia_calculada);

  const proteina = document.createElement('td');
  proteina.textContent = alimento.proteina;
  fila.appendChild(proteina);

  const grasa_total = document.createElement('td');
  grasa_total.textContent = alimento.grasa_total;
  fila.appendChild(grasa_total);

  const carbohidratos = document.createElement('td');
  carbohidratos.textContent = alimento.carbohidratos;
  fila.appendChild(carbohidratos);

  const fibra = document.createElement('td');
  fibra.textContent = alimento.fibra;
  fila.appendChild(fibra);

  const ags = document.createElement('td');
  ags.textContent = alimento.ags;
  fila.appendChild(ags);

  const agm = document.createElement('td');
  agm.textContent = alimento.fibra;
  fila.appendChild(agm);

  const agpi = document.createElement('td');
  agpi.textContent = alimento.agm;
  fila.appendChild(agpi);

  const colesterol = document.createElement('td');
  colesterol.textContent = alimento.colesterol;
  fila.appendChild(colesterol);

  const calcio = document.createElement('td');
  calcio.textContent = alimento.calcio;
  fila.appendChild(calcio);

  const fosforo = document.createElement('td');
  fosforo.textContent = alimento.fosforo;
  fila.appendChild(fosforo);

  const hierro = document.createElement('td');
  hierro.textContent = alimento.hierro;
  fila.appendChild(hierro);

  const potasio = document.createElement('td');
  potasio.textContent = alimento.potasio;
  fila.appendChild(potasio);

  const sodio = document.createElement('td');
  sodio.textContent = alimento.sodio;
  fila.appendChild(sodio);

  const zinc = document.createElement('td');
  zinc.textContent = alimento.zinc;
  fila.appendChild(zinc);

  const vitamina_c = document.createElement('td');
  vitamina_c.textContent = alimento.vitamina_c;
  fila.appendChild(vitamina_c);

  const vitamina_a = document.createElement('td');
  vitamina_a.textContent = alimento.vitamina_a;
  fila.appendChild(vitamina_a);

  const folatos = document.createElement('td');
  folatos.textContent = alimento.folatos;
  fila.appendChild(folatos);

  const vitamina_b12 = document.createElement('td');
  vitamina_b12.textContent = alimento.vitamina_b12;
  fila.appendChild(vitamina_b12);

  const columnasSeleccionados = ["nombre", "gramos"].concat(obtenerColumnasNutrientesKeys());
  Array.from(fila.children).forEach(function (celda, index) {
    if (columnasSeleccionados[index]) celda.dataset.foodCol = columnasSeleccionados[index];
  });

  valores_tbody.appendChild(fila);
  aplicarVisibilidadColumnasAlimentos();

  let alimentoCopia = { ...alimento };
  alimentoCopia.tiempo = tiempoSeleccionado;

  alimentos_seleccionados.push(Object.assign({}, [contadorAlimento, alimentoCopia]));
  contadorAlimento++;

  var factorInicial = valorGramos / 100;
  calculoActualizarValores(alimento, campoTexto.id, valorGramos, factorInicial, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
    ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12);

  //}

  actualizarTotal(alimentos_seleccionados);
  calcular();
}

function actualizarTotal(alimentos_seleccionados) {
  const tiempos = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda"];
  const props = ["energia_calculada", "proteina", "grasa_total", "carbohidratos", "fibra", "ags", "agm", "agpi", "colesterol", "calcio", "fosforo", "hierro", "potasio", "sodio", "zinc", "vitamina_c", "vitamina_a", "folatos", "vitamina_b12"];
  
  let subtotales = {};
  let totales_globales = {};
  props.forEach(p => totales_globales[p] = 0.0);
  
  tiempos.forEach(t => {
    subtotales[t] = {};
    props.forEach(p => subtotales[t][p] = 0.0);
  });

  for (const clave in alimentos_seleccionados) {
    let item = alimentos_seleccionados[clave][1];
    let t = item.tiempo || "Desayuno";
    // Check if time is valid falling back to Desayuno
    if(!subtotales[t]) t = "Desayuno";
    
    props.forEach(p => {
      let val = parseFloat(item[p]) || 0;
      totales_globales[p] += val;
      subtotales[t][p] += val;
    });
  }

  // Update Global Totals in UI
  props.forEach(p => {
    let el = document.getElementById(p + "_total");
    if(p === "grasa_total") el = document.getElementById("grasa_total"); // because id is just grasa_total in HTML
    if(el) el.textContent = totales_globales[p].toFixed(2);
  });
  
  // Save Subtotals globally for Excel export
  window.alimentos_subtotales = subtotales;

  // Update Subtotals in UI
  tiempos.forEach(t => {
    props.forEach((p, idx) => {
      let el_id = "sub_" + obtenerSlugTiempo(t) + "_" + idx;
      let el = document.getElementById(el_id);
      if (el) el.textContent = subtotales[t][p].toFixed(2);
    });
  });
}

function calcularReqEnergia() {
  const peso = parseFloat(document.getElementById('calc_peso').value) || 0;
  const estatura = parseFloat(document.getElementById('calc_estatura').value) || 0;
  const edad = parseFloat(document.getElementById('calc_edad').value) || 0;
  const genero = document.getElementById('calc_genero').value;
  const actividad = parseFloat(document.getElementById('calc_actividad').value) || 1.2;
  actualizarIndiceMasaCorporal();

  if (peso <= 0 || estatura <= 0 || edad <= 0) {
    alert("Por favor, ingrese valores válidos para peso, estatura y edad.");
    return;
  }

  let harris = 0;
  let mifflin = 0;
  let oms = 0;

  // 1. Harris-Benedict (revised)
  if (genero === 'M') {
    harris = 88.362 + (13.397 * peso) + (4.799 * estatura) - (5.677 * edad);
  } else {
    harris = 447.593 + (9.247 * peso) + (3.098 * estatura) - (4.330 * edad);
  }
  harris = harris * actividad;

  // 2. Mifflin-St Jeor
  if (genero === 'M') {
    mifflin = (10 * peso) + (6.25 * estatura) - (5 * edad) + 5;
  } else {
    mifflin = (10 * peso) + (6.25 * estatura) - (5 * edad) - 161;
  }
  mifflin = mifflin * actividad;

  // 3. OMS / FAO (1985)
  let bmr_oms = 0;
  if (genero === 'M') {
    if (edad >= 18 && edad <= 30) {
      bmr_oms = (15.3 * peso) + 679;
    } else if (edad > 30 && edad <= 60) {
      bmr_oms = (11.6 * peso) + 879;
    } else if (edad > 60) {
      bmr_oms = (13.5 * peso) + 487;
    } else {
      bmr_oms = (17.5 * peso) + 651; // approx para menores
    }
  } else {
    if (edad >= 18 && edad <= 30) {
      bmr_oms = (14.7 * peso) + 496;
    } else if (edad > 30 && edad <= 60) {
      bmr_oms = (8.7 * peso) + 829;
    } else if (edad > 60) {
      bmr_oms = (10.5 * peso) + 596;
    } else {
      bmr_oms = (12.2 * peso) + 746; // approx para menores
    }
  }
  oms = bmr_oms * actividad;

  // Limpiar y mostrar los resultados
  document.getElementById('res_harris').textContent = harris.toFixed(2);
  document.getElementById('res_mifflin').textContent = mifflin.toFixed(2);
  document.getElementById('res_oms').textContent = oms.toFixed(2);

  document.getElementById('resultados_calc').style.display = 'block';

  // Calcular el promedio e inyectarlo en la celda de Requerimientos Totales
  let promedio = (harris + mifflin + oms) / 3;
  document.getElementById('res_promedio').textContent = promedio.toFixed(2);
  
  const reqInput = document.getElementById('input_energia_calculada_requerimiento');
  if (reqInput) {
    reqInput.value = promedio.toFixed(2);
    
    actualizarRequerimientoMacronutrientes();
  }
}

function generarPDF() {
  const nombre = document.getElementById('calc_nombre').value || "Paciente";
  const id = document.getElementById('calc_id').value || "N/A";
  const fecha = document.getElementById('calc_fecha').value || "N/A";
  const peso = document.getElementById('calc_peso').value || "";
  const estatura = document.getElementById('calc_estatura').value || "";
  const edad = document.getElementById('calc_edad').value || "";
  
  const reqEnergia = document.getElementById('input_energia_calculada_requerimiento').value || "0";
  const adecEnergia = document.getElementById('adecuacion_energia_calculada').textContent || "0%";
  const adecProt = document.getElementById('adecuacion_proteina').textContent || "0%";
  const adecGrasa = document.getElementById('adecuacion_grasa').textContent || "0%";
  const adecCarb = document.getElementById('adecuacion_carbohidratos').textContent || "0%";

  // Custom helper to parse percentage safely
  const parsePct = (str) => {
    let val = parseFloat(str);
    if (isNaN(val)) return 0;
    if (val > 100) return 100;
    return val;
  };

  let html = `
    <div style="padding: 24px; background-color: #ffffff; font-family: Arial, sans-serif; color: #333;">
      <div style="text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="color: #4CAF50; margin: 0;">Reporte Nutricional</h1>
        <p style="margin: 5px 0; color: #777;">Plan de Alimentación y Requerimientos</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
        <h4 style="margin-top:0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Datos del Paciente</h4>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 4px;"><strong>Nombre:</strong> ${nombre}</td>
            <td style="padding: 4px;"><strong>Identificación:</strong> ${id}</td>
          </tr>
          <tr>
            <td style="padding: 4px;"><strong>Fecha:</strong> ${fecha}</td>
            <td style="padding: 4px;"><strong>Edad:</strong> ${edad} años</td>
          </tr>
          <tr>
            <td style="padding: 4px;"><strong>Peso:</strong> ${peso} kg</td>
            <td style="padding: 4px;"><strong>Estatura:</strong> ${estatura} cm</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h4 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Adecuación de Requerimientos</h4>
        
        <div style="margin-bottom: 15px;">
          <div style="display:flex; justify-content: space-between; font-size: 14px; margin-bottom:3px;">
            <span><strong>Energía (Kcal):</strong> Sugerida ${parseFloat(reqEnergia).toFixed(2)} Kcal</span>
            <span>${adecEnergia}</span>
          </div>
          <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${parsePct(adecEnergia)}%; background: #007bff;"></div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="display:flex; justify-content: space-between; font-size: 14px; margin-bottom:3px;">
            <span><strong>Proteína:</strong></span>
            <span>${adecProt}</span>
          </div>
          <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${parsePct(adecProt)}%; background: #28a745;"></div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="display:flex; justify-content: space-between; font-size: 14px; margin-bottom:3px;">
            <span><strong>Grasa Total:</strong></span>
            <span>${adecGrasa}</span>
          </div>
          <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${parsePct(adecGrasa)}%; background: #ffc107;"></div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div style="display:flex; justify-content: space-between; font-size: 14px; margin-bottom:3px;">
            <span><strong>Carbohidratos:</strong></span>
            <span>${adecCarb}</span>
          </div>
          <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${parsePct(adecCarb)}%; background: #dc3545;"></div>
          </div>
        </div>
      </div>

      <div>
        <h4 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Detalle de Comidas Seleccionadas</h4>
  `;

  nuevoOrden();
  let itemsPorTiempo = { "Desayuno": [], "Media Mañana": [], "Almuerzo": [], "Media Tarde": [], "Merienda": [] };
  
  for (const clave in alimentos_seleccionados_en_orden) {
    let item = alimentos_seleccionados_en_orden[clave];
    let tiempo = item.tiempo || "Desayuno";
    if (itemsPorTiempo[tiempo]) {
       itemsPorTiempo[tiempo].push(item);
    }
  }

  const tiempos = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda"];
  for (let t of tiempos) {
    if (itemsPorTiempo[t].length > 0) {
      html += `
        <div class="pdf-meal-section" style="margin-bottom: 15px; page-break-inside: avoid; break-inside: avoid;">
          <h5 style="background-color: #f1f1f1; padding: 5px; margin: 0; color: #333;">${t}</h5>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 4px;">Alimento</th>
                <th style="text-align: right; padding: 4px; width: 100px;">Gramos</th>
                <th style="text-align: right; padding: 4px; width: 100px;">Kcal</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      for (let item of itemsPorTiempo[t]) {
        html += `
          <tr>
            <td style="padding: 4px; border-bottom: 1px solid #eee;">${item.nombre}</td>
            <td style="text-align: right; padding: 4px; border-bottom: 1px solid #eee;">${item.gramos} g</td>
            <td style="text-align: right; padding: 4px; border-bottom: 1px solid #eee;">${parseFloat(item.energia_calculada).toFixed(2)}</td>
          </tr>
        `;
      }
      
      if (window.alimentos_subtotales && window.alimentos_subtotales[t]) {
         let subKcal = parseFloat(window.alimentos_subtotales[t]["energia_calculada"]).toFixed(2);
         html += `
          <tr>
            <td style="padding: 4px; font-weight: bold; text-align: right;" colspan="2">Subtotal ${t}:</td>
            <td style="text-align: right; padding: 4px; font-weight: bold;">${subKcal} Kcal</td>
          </tr>
         `;
      }
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }
  }

  html += `</div></div>`; // Close the detailing div, and the wrapper div.
  
  var opt = {
    margin:       [10, 10, 10, 10],
    filename:     obtenerNombreArchivoDescarga("pdf"),
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'], avoid: ['.pdf-meal-section'] }
  };

  html2pdf().set(opt).from(html).save().catch(err => {
    console.error("Error generando PDF", err);
  });
}

let celdaFilaAlimentos = null;
let rafFilaAlimentos = 0;

function crearGuiaAlimentos(id, className) {
  let guia = document.getElementById(id);
  if (!guia) {
    guia = document.createElement("div");
    guia.id = id;
    guia.className = className;
    document.body.appendChild(guia);
  }

  return guia;
}

function obtenerGuiasFilaAlimentos() {
  return [
    crearGuiaAlimentos("food-row-guide-top", "food-row-guide"),
    crearGuiaAlimentos("food-row-guide-bottom", "food-row-guide")
  ];
}

function posicionarGuiaFila(guia, y, left, width, limiteSuperior, limiteInferior, ocultarSiTocaLimite = false) {
  if (y < limiteSuperior || y > limiteInferior || (ocultarSiTocaLimite && y <= limiteSuperior + 2)) {
    guia.style.display = "none";
    return;
  }

  guia.style.display = "block";
  guia.style.left = `${left}px`;
  guia.style.top = `${y}px`;
  guia.style.width = `${width}px`;
}

function actualizarGuiasFilaAlimentos() {
  rafFilaAlimentos = 0;

  if (!celdaFilaAlimentos) return;

  const tabla = celdaFilaAlimentos.closest("#lista, #valores");
  const contenedor = tabla ? tabla.closest(".scrollable-div") : null;
  if (!tabla || !contenedor) {
    limpiarResaltadoCruceAlimentos();
    return;
  }

  const tablaRect = tabla.getBoundingClientRect();
  const contenedorRect = contenedor.getBoundingClientRect();
  const filaRect = celdaFilaAlimentos.parentElement.getBoundingClientRect();
  const headerRect = tabla.tHead ? tabla.tHead.getBoundingClientRect() : null;
  const top = Math.max(contenedorRect.top, headerRect ? headerRect.bottom : tablaRect.top);
  const bottom = Math.min(contenedorRect.bottom, tablaRect.bottom);
  const height = bottom - top;
  const left = Math.max(contenedorRect.left, tablaRect.left);
  const right = Math.min(contenedorRect.right, tablaRect.right);
  const width = right - left;

  if (height <= 0 || width <= 0) {
    limpiarResaltadoCruceAlimentos();
    return;
  }

  const [superior, inferior] = obtenerGuiasFilaAlimentos();
  posicionarGuiaFila(superior, Math.max(filaRect.top, top), left, width, top, bottom, true);
  posicionarGuiaFila(inferior, Math.min(filaRect.bottom, bottom), left, width, top, bottom);
}

function solicitarActualizacionGuiasFila() {
  if (!rafFilaAlimentos) {
    rafFilaAlimentos = requestAnimationFrame(actualizarGuiasFilaAlimentos);
  }
}

function limpiarEncabezadoAlimentos() {
  document.querySelectorAll("#lista th.food-header-highlight, #valores th.food-header-highlight").forEach(function (th) {
    th.classList.remove("food-header-highlight");
  });
}

function resaltarEncabezadoAlimentos(tabla, columna) {
  limpiarEncabezadoAlimentos();

  const encabezado = tabla.tHead ? tabla.tHead.querySelectorAll("th")[columna] : null;
  if (encabezado) encabezado.classList.add("food-header-highlight");
}

function limpiarResaltadoCruceAlimentos() {
  celdaFilaAlimentos = null;
  limpiarEncabezadoAlimentos();
  document.querySelectorAll("#food-column-guide-left, #food-column-guide-right").forEach(function (guia) {
    guia.style.display = "none";
  });
  obtenerGuiasFilaAlimentos().forEach(function (guia) {
    guia.style.display = "none";
  });
}

function configurarResaltadoCruceAlimentos() {
  document.querySelectorAll("#lista, #valores").forEach(function (tabla) {
    tabla.classList.add("food-crosshair");

    tabla.addEventListener("pointermove", function (event) {
      const celda = event.target.closest("tbody td");
      if (!celda || !tabla.contains(celda) || celda.colSpan > 1) {
        limpiarResaltadoCruceAlimentos();
        return;
      }

      celdaFilaAlimentos = celda;
      resaltarEncabezadoAlimentos(tabla, celda.cellIndex);
      solicitarActualizacionGuiasFila();
    });

    tabla.addEventListener("pointerleave", function () {
      limpiarResaltadoCruceAlimentos();
    });
  });

  document.addEventListener("scroll", solicitarActualizacionGuiasFila, true);
  window.addEventListener("resize", solicitarActualizacionGuiasFila);
}

window.addEventListener("auth:session-changed", function (event) {
  actualizarScopePesoIdealPersistido(event.detail ? event.detail.session : null);
});

// Limpiar el formulario cuando la página se recarga o se abre
document.addEventListener('DOMContentLoaded', function() {
  inicializarOrdenamientoSeleccionados();
  configurarResaltadoCruceAlimentos();

  const nombre = document.getElementById('calc_nombre');
  const id = document.getElementById('calc_id');
  const fecha = document.getElementById('calc_fecha');
  const peso = document.getElementById('calc_peso');
  const estatura = document.getElementById('calc_estatura');
  const edad = document.getElementById('calc_edad');
  const genero = document.getElementById('calc_genero');
  const actividad = document.getElementById('calc_actividad');
  
  if (nombre) nombre.value = '';
  if (id) id.value = '';
  if (fecha) fecha.value = obtenerFechaActualInput();
  if (peso) peso.value = '70';
  if (estatura) estatura.value = '170';
  if (edad) edad.value = '30';
  if (genero) genero.value = 'M';
  if (actividad) actividad.value = '1.55';

  const macroProteina = document.getElementById('macro_proteina_porcentaje');
  const macroGrasa = document.getElementById('macro_grasa_porcentaje');
  if (macroProteina) macroProteina.value = '20';
  if (macroGrasa) macroGrasa.value = '30';

  // Limpiar requerimientos de la tabla de totales (restablecer a 1 por defecto)
  const reqInputs = document.querySelectorAll('input[id$="_requerimiento"]');
  reqInputs.forEach(input => {
    input.value = '1';
  });
  
  // Ocultar resultados de la calculadora anterior
  const resDiv = document.getElementById('resultados_calc');
  if (resDiv) resDiv.style.display = 'none';
  
  // Recalcular para blanquear porcentajes
  restaurarColumnasAlimentosOPredeterminadas();
  renderizarConfiguracionColumnasAlimentos();
  aplicarVisibilidadColumnasAlimentos();
  configurarEventosIndiceMasaCorporal();
  configurarEventosMacronutrientes();
  configurarEventosMedidasAntropometricas();
  inicializarIconosLucide();
  actualizarRequerimientoMacronutrientes();
});
