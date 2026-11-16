(function () {
  "use strict";

  const STORAGE_KEY = "muyAlimentado:sistemaEquivalentes:v1";
  // El archivo fuente usa cuartos de equivalente en la mayor parte del plan,
  // pero también contiene cantidades como 1,33. La edición admite centésimas
  // y la distribución automática conserva cuartos cuando el total lo permite.
  const STEP_EQUIVALENTE = 0.01;
  const STEP_DISTRIBUCION = 0.25;
  const TOLERANCIA = 0.001;

  const GRUPOS_EQUIVALENTES = [
    { id: "cereal_sin_grasa", grupo: "Cereales, tubérculos y plátanos", subgrupo: "Sin grasa", tipo: "cereal", proteina: 2, grasa: 0, carbohidrato: 15 },
    { id: "lacteo_descremado", grupo: "Lácteos", subgrupo: "Descremados", tipo: "lacteo", proteina: 8, grasa: 2, carbohidrato: 12 },
    { id: "lacteo_semidescremado", grupo: "Lácteos", subgrupo: "Semidescremados", tipo: "lacteo", proteina: 8, grasa: 4, carbohidrato: 12 },
    { id: "lacteo_entero", grupo: "Lácteos", subgrupo: "Enteros", tipo: "lacteo", proteina: 9, grasa: 8, carbohidrato: 12 },
    { id: "queso_semidescremado", grupo: "Quesos", subgrupo: "Semidescremado", tipo: "queso", proteina: 7, grasa: 3, carbohidrato: 1 },
    { id: "queso_descremado", grupo: "Quesos", subgrupo: "Descremado", tipo: "queso", proteina: 7, grasa: 1, carbohidrato: 1 },
    { id: "leguminosa_seca", grupo: "Leguminosas", subgrupo: "Secas", tipo: "leguminosa", proteina: 8, grasa: 1, carbohidrato: 20 },
    { id: "verdura_libre", grupo: "Verduras y hortalizas", subgrupo: "Libres", tipo: "verdura", proteina: 2, grasa: 0, carbohidrato: 4 },
    { id: "verdura_baja_cho", grupo: "Verduras y hortalizas", subgrupo: "Bajas en CHO", tipo: "verdura", proteina: 1, grasa: 0, carbohidrato: 5 },
    { id: "animal_muy_bajo", grupo: "Alimentos de origen animal", subgrupo: "Muy bajos en grasa", tipo: "animal", proteina: 7, grasa: 1, carbohidrato: 0 },
    { id: "animal_bajo", grupo: "Alimentos de origen animal", subgrupo: "Bajos en grasa", tipo: "animal", proteina: 7, grasa: 3, carbohidrato: 0 },
    { id: "animal_moderado", grupo: "Alimentos de origen animal", subgrupo: "Moderados en grasa", tipo: "animal", proteina: 7, grasa: 5, carbohidrato: 0 },
    { id: "animal_alto", grupo: "Alimentos de origen animal", subgrupo: "Altos en grasa", tipo: "animal", proteina: 7, grasa: 8, carbohidrato: 0 },
    { id: "grasa_sin_proteina", grupo: "Aceites y grasas", subgrupo: "Sin proteína", tipo: "grasa", proteina: 0, grasa: 5, carbohidrato: 0 },
    { id: "grasa_con_proteina", grupo: "Aceites y grasas", subgrupo: "Con proteína", tipo: "grasa", proteina: 3, grasa: 5, carbohidrato: 3 },
    { id: "azucar_sin_grasa", grupo: "Azúcares", subgrupo: "Sin grasa", tipo: "azucar", proteina: 0, grasa: 0, carbohidrato: 10 },
    { id: "azucar_con_grasa", grupo: "Azúcares", subgrupo: "Con grasa", tipo: "azucar", proteina: 0, grasa: 5, carbohidrato: 10 },
    { id: "fruta", grupo: "Frutas", subgrupo: "—", tipo: "fruta", proteina: 1, grasa: 0, carbohidrato: 10 }
  ];

  const EQUIVALENTES_EJEMPLO = {
    cereal_sin_grasa: 8,
    lacteo_descremado: 1,
    lacteo_semidescremado: 1,
    lacteo_entero: 0,
    queso_semidescremado: 1,
    queso_descremado: 0,
    leguminosa_seca: 1,
    verdura_libre: 2.5,
    verdura_baja_cho: 0.5,
    animal_muy_bajo: 5,
    animal_bajo: 0,
    animal_moderado: 2,
    animal_alto: 0,
    grasa_sin_proteina: 6,
    grasa_con_proteina: 1,
    azucar_sin_grasa: 0,
    azucar_con_grasa: 0,
    fruta: 5
  };

  const PRESETS_COMIDAS = {
    4: [
      { nombre: "Desayuno", hora: "09:00" },
      { nombre: "Almuerzo", hora: "13:00" },
      { nombre: "Media tarde", hora: "17:00" },
      { nombre: "Merienda", hora: "20:00" }
    ],
    5: [
      { nombre: "Desayuno", hora: "07:00" },
      { nombre: "Media mañana", hora: "10:30" },
      { nombre: "Almuerzo", hora: "13:30" },
      { nombre: "Media tarde", hora: "17:00" },
      { nombre: "Cena", hora: "20:00" }
    ],
    6: [
      { nombre: "Desayuno", hora: "06:30" },
      { nombre: "Media mañana", hora: "09:30" },
      { nombre: "Almuerzo", hora: "13:00" },
      { nombre: "Media tarde", hora: "16:00" },
      { nombre: "Merienda", hora: "19:00" },
      { nombre: "Cena", hora: "20:00" }
    ]
  };

  const PESOS_BASE = {
    4: [0.23, 0.35, 0.15, 0.27],
    5: [0.22, 0.10, 0.33, 0.12, 0.23],
    6: [0.20, 0.10, 0.30, 0.10, 0.20, 0.10]
  };

  const MASCARAS_POR_TIPO = {
    cereal: { 4: [1, 1, 1, 1], 5: [1, 1, 1, 1, 1], 6: [1, 1, 1, 1, 1, 1] },
    lacteo: { 4: [1, 0, 1, 0], 5: [1, 1, 0, 1, 0], 6: [1, 1, 0, 1, 0, 1] },
    queso: { 4: [1, 0, 1, 0], 5: [1, 1, 0, 1, 0], 6: [1, 1, 0, 1, 0, 1] },
    leguminosa: { 4: [0, 1, 0, 1], 5: [0, 0, 1, 0, 1], 6: [0, 0, 1, 0, 1, 0] },
    verdura: { 4: [0.2, 1, 0, 1], 5: [0.2, 0, 1, 0, 1], 6: [0.2, 0, 1, 0, 1, 0] },
    animal: { 4: [0.7, 1, 0, 1], 5: [0.7, 0, 1, 0, 1], 6: [0.7, 0, 1, 0, 1, 0] },
    grasa: { 4: [1, 1, 0.5, 1], 5: [1, 0.5, 1, 0.5, 1], 6: [1, 0.5, 1, 0.5, 1, 0.5] },
    azucar: { 4: [1, 1, 1, 1], 5: [1, 1, 1, 1, 1], 6: [1, 1, 1, 1, 1, 1] },
    fruta: { 4: [1, 1, 1, 1], 5: [1, 1, 1, 1, 1], 6: [1, 1, 1, 1, 1, 1] }
  };

  const formatoNumero = new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  let estado = crearEstadoInicial();
  let temporizadorGuardado = 0;

  function crearEstadoInicial() {
    return {
      objetivos: { energia: 1900, pesoIdeal: 64, proteinaPct: 21, grasaPct: 28 },
      equivalentes: Object.assign({}, EQUIVALENTES_EJEMPLO),
      comidas: PRESETS_COMIDAS[4].map(copiarComida),
      distribucion: {}
    };
  }

  function copiarComida(comida) {
    return { nombre: comida.nombre, hora: comida.hora };
  }

  function numeroSeguro(valor, respaldo) {
    const normalizado = typeof valor === "string" ? valor.replace(",", ".") : valor;
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : (respaldo === undefined ? 0 : respaldo);
  }

  function limitarNoNegativo(valor) {
    return Math.max(0, numeroSeguro(valor));
  }

  function redondearPaso(valor, paso) {
    return Math.max(0, Math.round(limitarNoNegativo(valor) / paso) * paso);
  }

  function escaparHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function textoExcelSeguro(valor) {
    const texto = String(valor === undefined || valor === null ? "" : valor);
    return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  }

  function formatear(valor, decimales) {
    const numero = numeroSeguro(valor);
    if (typeof decimales === "number") return numero.toFixed(decimales);
    return formatoNumero.format(numero);
  }

  function energiaDeMacros(proteina, grasa, carbohidrato) {
    return proteina * 4 + grasa * 9 + carbohidrato * 4;
  }

  function calcularObjetivos(datos) {
    const energia = numeroSeguro(datos.energia);
    const pesoIdeal = numeroSeguro(datos.pesoIdeal);
    const proteinaPct = numeroSeguro(datos.proteinaPct);
    const grasaPct = numeroSeguro(datos.grasaPct);
    const carbohidratoPct = 100 - proteinaPct - grasaPct;
    const valido = energia > 0 && pesoIdeal > 0 && proteinaPct >= 0 && grasaPct >= 0 &&
      proteinaPct <= 100 && grasaPct <= 100 && carbohidratoPct >= 0;
    const proteinaKcal = valido ? energia * proteinaPct / 100 : 0;
    const grasaKcal = valido ? energia * grasaPct / 100 : 0;
    const carbohidratoKcal = valido ? energia * carbohidratoPct / 100 : 0;
    return {
      valido, energia, pesoIdeal, proteinaPct, grasaPct, carbohidratoPct,
      proteina: proteinaKcal / 4,
      grasa: grasaKcal / 9,
      carbohidrato: carbohidratoKcal / 4,
      proteinaKcal, grasaKcal, carbohidratoKcal
    };
  }

  function calcularTotales(equivalentes) {
    return GRUPOS_EQUIVALENTES.reduce(function (total, grupo) {
      const cantidad = limitarNoNegativo(equivalentes[grupo.id]);
      total.proteina += cantidad * grupo.proteina;
      total.grasa += cantidad * grupo.grasa;
      total.carbohidrato += cantidad * grupo.carbohidrato;
      total.equivalentes += cantidad;
      return total;
    }, { proteina: 0, grasa: 0, carbohidrato: 0, equivalentes: 0 });
  }

  function calcularAporteGrupo(grupo, cantidad) {
    const equivalentes = limitarNoNegativo(cantidad);
    const proteina = grupo.proteina * equivalentes;
    const grasa = grupo.grasa * equivalentes;
    const carbohidrato = grupo.carbohidrato * equivalentes;
    return { proteina, grasa, carbohidrato, energia: energiaDeMacros(proteina, grasa, carbohidrato) };
  }

  function leerObjetivosFormulario() {
    return {
      energia: numeroSeguro(document.getElementById("equiv_energia").value),
      pesoIdeal: numeroSeguro(document.getElementById("equiv_peso_ideal").value),
      proteinaPct: numeroSeguro(document.getElementById("equiv_proteina_pct").value),
      grasaPct: numeroSeguro(document.getElementById("equiv_grasa_pct").value)
    };
  }

  function aplicarObjetivosFormulario() {
    document.getElementById("equiv_energia").value = estado.objetivos.energia;
    document.getElementById("equiv_peso_ideal").value = estado.objetivos.pesoIdeal;
    document.getElementById("equiv_proteina_pct").value = estado.objetivos.proteinaPct;
    document.getElementById("equiv_grasa_pct").value = estado.objetivos.grasaPct;
  }

  function obtenerObjetivos() {
    return calcularObjetivos(leerObjetivosFormulario());
  }

  function mensajeObjetivos(objetivos) {
    if (objetivos.energia <= 0) return "Ingresa una energía diaria mayor que cero.";
    if (objetivos.pesoIdeal <= 0) return "Ingresa un peso ideal mayor que cero.";
    if (objetivos.proteinaPct < 0 || objetivos.proteinaPct > 100 || objetivos.grasaPct < 0 || objetivos.grasaPct > 100) {
      return "Los porcentajes deben estar entre 0 y 100.";
    }
    if (objetivos.carbohidratoPct < 0) return "La suma de proteínas y grasas no puede superar 100%.";
    return "";
  }

  function renderizarObjetivos() {
    const objetivos = obtenerObjetivos();
    document.getElementById("equiv_carbohidrato_pct").value = formatear(Math.max(0, objetivos.carbohidratoPct), 1);
    document.getElementById("equiv_objetivo_error").textContent = mensajeObjetivos(objetivos);
    const macros = [
      { nombre: "Proteínas", porcentaje: objetivos.proteinaPct, kcal: objetivos.proteinaKcal, gramos: objetivos.proteina, divisor: 7, clase: "proteina" },
      { nombre: "Grasas", porcentaje: objetivos.grasaPct, kcal: objetivos.grasaKcal, gramos: objetivos.grasa, divisor: 5, clase: "grasa" },
      { nombre: "Carbohidratos", porcentaje: Math.max(0, objetivos.carbohidratoPct), kcal: objetivos.carbohidratoKcal, gramos: objetivos.carbohidrato, divisor: 15, clase: "carbohidrato" }
    ];
    document.getElementById("equiv_objetivos_resumen").innerHTML = macros.map(function (macro) {
      const gKg = objetivos.pesoIdeal > 0 ? macro.gramos / objetivos.pesoIdeal : 0;
      const raciones = Math.ceil(macro.gramos / macro.divisor);
      return `
        <div class="equivalentes-macro-card equivalentes-macro-card--${macro.clase}">
          <div class="equivalentes-macro-card-top"><span>${macro.nombre}</span><strong>${formatear(macro.porcentaje, 1)}%</strong></div>
          <strong class="equivalentes-macro-value">${formatear(macro.gramos, 2)} g</strong>
          <div class="equivalentes-macro-meta">
            <span>${formatear(macro.kcal, 0)} kcal</span><span>${formatear(gKg, 2)} g/kg</span><span>${raciones} rac. orientativas</span>
          </div>
        </div>`;
    }).join("");
    return objetivos;
  }

  function renderizarFilasGrupos() {
    const body = document.getElementById("equiv_grupos_body");
    let grupoAnterior = "";
    body.innerHTML = GRUPOS_EQUIVALENTES.map(function (grupo) {
      const esInicio = grupo.grupo !== grupoAnterior;
      grupoAnterior = grupo.grupo;
      const cantidad = limitarNoNegativo(estado.equivalentes[grupo.id]);
      return `
        <tr class="${esInicio ? "equivalentes-group-start" : ""}" data-equivalent-row="${grupo.id}">
          <th scope="row" class="equivalentes-group-name">${escaparHtml(grupo.grupo)}</th>
          <td><span class="equivalentes-subgroup">${escaparHtml(grupo.subgrupo)}</span><small>${formatear(grupo.proteina)} P · ${formatear(grupo.grasa)} G · ${formatear(grupo.carbohidrato)} CHO</small></td>
          <td class="text-center"><input type="number" class="form-control form-control-sm equivalentes-count-input"
            min="0" step="${STEP_EQUIVALENTE}" value="${cantidad}" data-equivalent-input="${grupo.id}"
            aria-label="Equivalentes de ${escaparHtml(grupo.grupo)}, ${escaparHtml(grupo.subgrupo)}"></td>
          <td class="text-end" data-aporte="proteina">0 g</td><td class="text-end" data-aporte="grasa">0 g</td>
          <td class="text-end" data-aporte="carbohidrato">0 g</td><td class="text-end" data-aporte="energia">0 kcal</td>
        </tr>`;
    }).join("");
    actualizarCalculosGrupos();
  }

  function claseAdecuacion(porcentaje) {
    if (!Number.isFinite(porcentaje)) return "equiv-adequacy-neutral";
    if (porcentaje >= 90 && porcentaje <= 110) return "equiv-adequacy-ok";
    if (porcentaje < 90) return "equiv-adequacy-warning";
    return "equiv-adequacy-over";
  }

  function actualizarCalculosGrupos() {
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const fila = document.querySelector(`[data-equivalent-row="${grupo.id}"]`);
      if (!fila) return;
      const aporte = calcularAporteGrupo(grupo, estado.equivalentes[grupo.id]);
      fila.querySelector('[data-aporte="proteina"]').textContent = `${formatear(aporte.proteina)} g`;
      fila.querySelector('[data-aporte="grasa"]').textContent = `${formatear(aporte.grasa)} g`;
      fila.querySelector('[data-aporte="carbohidrato"]').textContent = `${formatear(aporte.carbohidrato)} g`;
      fila.querySelector('[data-aporte="energia"]').textContent = `${formatear(aporte.energia)} kcal`;
    });
    const totales = calcularTotales(estado.equivalentes);
    const energia = energiaDeMacros(totales.proteina, totales.grasa, totales.carbohidrato);
    document.getElementById("equiv_grupos_foot").innerHTML = `
      <tr><th scope="row" colspan="2">Total del plan</th><td class="text-center"><strong>${formatear(totales.equivalentes)}</strong></td>
      <td class="text-end"><strong>${formatear(totales.proteina)} g</strong></td><td class="text-end"><strong>${formatear(totales.grasa)} g</strong></td>
      <td class="text-end"><strong>${formatear(totales.carbohidrato)} g</strong></td><td class="text-end"><strong>${formatear(energia)} kcal</strong></td></tr>`;
    renderizarAdecuacion(totales, energia);
    actualizarResumenDistribucion();
  }

  function renderizarAdecuacion(totales, energia) {
    const objetivos = renderizarObjetivos();
    const items = [
      { nombre: "Energía", valor: energia, objetivo: objetivos.energia, unidad: "kcal" },
      { nombre: "Proteínas", valor: totales.proteina, objetivo: objetivos.proteina, unidad: "g" },
      { nombre: "Grasas", valor: totales.grasa, objetivo: objetivos.grasa, unidad: "g" },
      { nombre: "Carbohidratos", valor: totales.carbohidrato, objetivo: objetivos.carbohidrato, unidad: "g" }
    ];
    document.getElementById("equiv_adecuacion_resumen").innerHTML = items.map(function (item) {
      const porcentaje = item.objetivo > 0 ? item.valor / item.objetivo * 100 : (item.valor === 0 ? 100 : Infinity);
      const textoPorcentaje = Number.isFinite(porcentaje) ? `${formatear(porcentaje, 1)}%` : "—";
      return `<div class="equivalentes-adequacy-card ${claseAdecuacion(porcentaje)}"><span>${item.nombre}</span><strong>${textoPorcentaje}</strong>
        <small>${formatear(item.valor)} de ${formatear(item.objetivo)} ${item.unidad}</small></div>`;
    }).join("");
  }

  function sugerirEquivalentes() {
    const objetivos = obtenerObjetivos();
    if (!objetivos.valido) {
      establecerMensaje(mensajeObjetivos(objetivos) || "Revisa el objetivo antes de generar una sugerencia.", "error");
      return;
    }
    const sugeridos = {};
    GRUPOS_EQUIVALENTES.forEach(function (grupo) { sugeridos[grupo.id] = 0; });
    sugeridos.lacteo_descremado = 1;
    sugeridos.lacteo_semidescremado = 1;
    sugeridos.queso_semidescremado = 1;
    sugeridos.leguminosa_seca = 1;
    sugeridos.verdura_libre = 2.5;
    sugeridos.verdura_baja_cho = 0.5;
    sugeridos.animal_moderado = 2;
    sugeridos.grasa_con_proteina = 1;
    sugeridos.cereal_sin_grasa = Math.max(0, Math.round(objetivos.carbohidrato / 2 / 15));
    let totales = calcularTotales(sugeridos);
    sugeridos.animal_muy_bajo = Math.max(0, Math.round((objetivos.proteina - totales.proteina) / 7));
    totales = calcularTotales(sugeridos);
    sugeridos.grasa_sin_proteina = redondearPaso((objetivos.grasa - totales.grasa) / 5, 0.5);
    totales = calcularTotales(sugeridos);
    sugeridos.fruta = redondearPaso((objetivos.carbohidrato - totales.carbohidrato) / 10, 0.5);
    estado.equivalentes = sugeridos;
    renderizarFilasGrupos();
    distribuirAutomaticamente(false);
    programarGuardado();
    establecerMensaje("Sugerencia aplicada. Ajusta los subgrupos según el criterio clínico y revisa la adecuación.", "success");
  }

  function pesosParaGrupo(grupo, cantidadComidas) {
    const base = PESOS_BASE[cantidadComidas] || PESOS_BASE[4];
    const mascarasTipo = MASCARAS_POR_TIPO[grupo.tipo] || MASCARAS_POR_TIPO.cereal;
    const mascara = mascarasTipo[cantidadComidas] || mascarasTipo[4];
    const combinados = base.map(function (peso, indice) { return peso * (mascara[indice] || 0); });
    const suma = combinados.reduce(function (total, valor) { return total + valor; }, 0);
    return suma <= 0 ? base.slice() : combinados.map(function (valor) { return valor / suma; });
  }

  function distribuirUnidades(total, pesos, paso) {
    const unidad = paso || STEP_EQUIVALENTE;
    const unidades = Math.max(0, Math.round(limitarNoNegativo(total) / unidad));
    const sumaPesos = pesos.reduce(function (suma, peso) { return suma + Math.max(0, numeroSeguro(peso)); }, 0);
    if (!unidades || !sumaPesos) return pesos.map(function () { return 0; });
    const calculados = pesos.map(function (peso, indice) {
      const exacto = unidades * Math.max(0, numeroSeguro(peso)) / sumaPesos;
      return { indice, entero: Math.floor(exacto), residuo: exacto - Math.floor(exacto) };
    });
    let asignadas = calculados.reduce(function (suma, item) { return suma + item.entero; }, 0);
    calculados.slice().sort(function (a, b) { return b.residuo - a.residuo || a.indice - b.indice; }).forEach(function (item) {
      if (asignadas < unidades) { calculados[item.indice].entero += 1; asignadas += 1; }
    });
    return calculados.map(function (item) { return item.entero * unidad; });
  }

  function distribuirAutomaticamente(mostrarMensaje) {
    const cantidadComidas = estado.comidas.length;
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const total = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const unidadesDeCuarto = total / STEP_DISTRIBUCION;
      const admiteCuartos = Math.abs(unidadesDeCuarto - Math.round(unidadesDeCuarto)) <= TOLERANCIA;
      const paso = admiteCuartos ? STEP_DISTRIBUCION : STEP_EQUIVALENTE;
      estado.distribucion[grupo.id] = distribuirUnidades(total, pesosParaGrupo(grupo, cantidadComidas), paso);
    });
    renderizarEstructuraDistribucion();
    programarGuardado();
    if (mostrarMensaje !== false) establecerMensaje("Los equivalentes se distribuyeron sin alterar el total diario. Puedes ajustar cada comida manualmente.", "success");
  }

  function normalizarDistribucion() {
    const cantidad = estado.comidas.length;
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const actual = Array.isArray(estado.distribucion[grupo.id]) ? estado.distribucion[grupo.id] : [];
      estado.distribucion[grupo.id] = Array.from({ length: cantidad }, function (_, indice) { return limitarNoNegativo(actual[indice]); });
    });
  }

  function renderizarConfiguracionComidas() {
    document.getElementById("equiv_comidas_config").innerHTML = estado.comidas.map(function (comida, indice) {
      return `<div class="equivalentes-meal-card"><span class="equivalentes-meal-number">${indice + 1}</span>
        <label for="equiv_comida_nombre_${indice}">Comida</label>
        <input type="text" id="equiv_comida_nombre_${indice}" class="form-control form-control-sm" value="${escaparHtml(comida.nombre)}" data-meal-field="nombre" data-meal-index="${indice}" maxlength="40">
        <label for="equiv_comida_hora_${indice}">Hora</label>
        <input type="time" id="equiv_comida_hora_${indice}" class="form-control form-control-sm" value="${escaparHtml(comida.hora)}" data-meal-field="hora" data-meal-index="${indice}"></div>`;
    }).join("");
  }

  function renderizarEstructuraDistribucion() {
    normalizarDistribucion();
    const head = document.getElementById("equiv_distribucion_head");
    const body = document.getElementById("equiv_distribucion_body");
    head.innerHTML = `<tr><th scope="col">Grupo</th><th scope="col">Subgrupo</th>
      ${estado.comidas.map(function (comida, indice) { return `<th scope="col" class="text-center"><span data-meal-heading="${indice}">${escaparHtml(comida.nombre || `Comida ${indice + 1}`)}</span><small>${escaparHtml(comida.hora)}</small></th>`; }).join("")}
      <th scope="col" class="text-center">Asignado / requerido</th><th scope="col">Estado</th></tr>`;
    let grupoAnterior = "";
    body.innerHTML = GRUPOS_EQUIVALENTES.map(function (grupo) {
      const esInicio = grupo.grupo !== grupoAnterior;
      grupoAnterior = grupo.grupo;
      return `<tr class="${esInicio ? "equivalentes-group-start" : ""}" data-distribution-row="${grupo.id}">
        <th scope="row" class="equivalentes-group-name">${escaparHtml(grupo.grupo)}</th><td>${escaparHtml(grupo.subgrupo)}</td>
        ${estado.comidas.map(function (_, indice) {
          const valor = limitarNoNegativo(estado.distribucion[grupo.id][indice]);
          return `<td class="text-center"><input type="number" class="form-control form-control-sm equivalentes-allocation-input" min="0" step="${STEP_EQUIVALENTE}" value="${valor}"
            data-allocation-group="${grupo.id}" data-allocation-meal="${indice}" aria-label="${escaparHtml(grupo.grupo)}, ${escaparHtml(grupo.subgrupo)}, ${escaparHtml(estado.comidas[indice].nombre)}"></td>`;
        }).join("")}<td class="text-center" data-distribution-sum></td><td data-distribution-status></td></tr>`;
    }).join("");
    renderizarPieDistribucion();
    actualizarResumenDistribucion();
  }

  function totalesPorComida() {
    return estado.comidas.map(function (_, indiceComida) {
      return GRUPOS_EQUIVALENTES.reduce(function (total, grupo) {
        const cantidad = limitarNoNegativo((estado.distribucion[grupo.id] || [])[indiceComida]);
        total.proteina += cantidad * grupo.proteina;
        total.grasa += cantidad * grupo.grasa;
        total.carbohidrato += cantidad * grupo.carbohidrato;
        return total;
      }, { proteina: 0, grasa: 0, carbohidrato: 0 });
    });
  }

  function renderizarPieDistribucion() {
    const etiquetas = [
      { key: "energia", label: "Energía", unidad: "kcal" },
      { key: "proteina", label: "Proteínas", unidad: "g" },
      { key: "grasa", label: "Grasas", unidad: "g" },
      { key: "carbohidrato", label: "Carbohidratos", unidad: "g" },
      { key: "relacion", label: "Relación CHO/P", unidad: "" }
    ];
    document.getElementById("equiv_distribucion_foot").innerHTML = etiquetas.map(function (item) {
      return `<tr class="equivalentes-distribution-summary-row"><th scope="row" colspan="2">${item.label}</th>
        ${estado.comidas.map(function (_, indice) { return `<td class="text-center" data-meal-total="${item.key}" data-meal-total-index="${indice}">0${item.unidad ? ` ${item.unidad}` : ""}</td>`; }).join("")}
        <td colspan="2"></td></tr>`;
    }).join("");
  }

  function estadoDistribucion(asignado, requerido) {
    const diferencia = asignado - requerido;
    if (Math.abs(diferencia) <= TOLERANCIA) return { clase: "equiv-distribution-ok", texto: "Completo" };
    if (diferencia < 0) return { clase: "equiv-distribution-warning", texto: `Faltan ${formatear(Math.abs(diferencia))}` };
    return { clase: "equiv-distribution-over", texto: `Excede ${formatear(diferencia)}` };
  }

  function actualizarResumenDistribucion() {
    const body = document.getElementById("equiv_distribucion_body");
    if (!body) return;
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const fila = body.querySelector(`[data-distribution-row="${grupo.id}"]`);
      if (!fila) return;
      const asignado = (estado.distribucion[grupo.id] || []).reduce(function (suma, valor) { return suma + limitarNoNegativo(valor); }, 0);
      const requerido = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const estadoFila = estadoDistribucion(asignado, requerido);
      fila.querySelector("[data-distribution-sum]").textContent = `${formatear(asignado)} / ${formatear(requerido)}`;
      const celdaEstado = fila.querySelector("[data-distribution-status]");
      celdaEstado.className = estadoFila.clase;
      celdaEstado.textContent = estadoFila.texto;
    });
    totalesPorComida().forEach(function (total, indice) {
      const energia = energiaDeMacros(total.proteina, total.grasa, total.carbohidrato);
      const relacion = total.proteina > 0 ? total.carbohidrato / total.proteina : null;
      const valores = {
        energia: `${formatear(energia)} kcal`, proteina: `${formatear(total.proteina)} g`, grasa: `${formatear(total.grasa)} g`,
        carbohidrato: `${formatear(total.carbohidrato)} g`, relacion: relacion === null ? "—" : formatear(relacion, 2)
      };
      Object.keys(valores).forEach(function (key) {
        const celda = document.querySelector(`[data-meal-total="${key}"][data-meal-total-index="${indice}"]`);
        if (celda) celda.textContent = valores[key];
      });
    });
  }

  function cambiarCantidadComidas(nuevaCantidad) {
    const cantidad = Math.min(6, Math.max(4, Math.round(numeroSeguro(nuevaCantidad, 4))));
    if (cantidad === estado.comidas.length) return;
    estado.comidas = PRESETS_COMIDAS[cantidad].map(copiarComida);
    renderizarConfiguracionComidas();
    distribuirAutomaticamente(false);
    establecerMensaje(`Se aplicaron los horarios sugeridos para ${cantidad} comidas y se redistribuyeron los equivalentes sin cambiar el total diario.`, "info");
  }

  function cargarDesdeCalculadora() {
    const campoEnergia = document.getElementById("input_energia_calculada_requerimiento");
    const campoPeso = document.getElementById("macro_peso_ideal");
    const campoProteina = document.getElementById("macro_proteina_porcentaje");
    const campoGrasa = document.getElementById("macro_grasa_porcentaje");
    const energia = campoEnergia && campoEnergia.value.trim() ? numeroSeguro(campoEnergia.value, NaN) : NaN;
    const pesoIdeal = campoPeso && campoPeso.value.trim() ? numeroSeguro(campoPeso.value, NaN) : NaN;
    const proteinaPct = campoProteina && campoProteina.value.trim() ? numeroSeguro(campoProteina.value, NaN) : NaN;
    const grasaPct = campoGrasa && campoGrasa.value.trim() ? numeroSeguro(campoGrasa.value, NaN) : NaN;
    if (!Number.isFinite(energia) || energia <= 1) {
      establecerMensaje("Primero define un requerimiento de energía válido en la Calculadora.", "error");
      return;
    }
    if (!Number.isFinite(pesoIdeal) || pesoIdeal <= 0) {
      establecerMensaje("Define un peso ideal válido en la distribución de macronutrientes de la Calculadora.", "error");
      return;
    }
    if (!Number.isFinite(proteinaPct) || !Number.isFinite(grasaPct) || proteinaPct < 0 || grasaPct < 0 || proteinaPct + grasaPct > 100) {
      establecerMensaje("Revisa los porcentajes de proteínas y grasas en la Calculadora antes de importarlos.", "error");
      return;
    }
    document.getElementById("equiv_energia").value = energia;
    document.getElementById("equiv_peso_ideal").value = pesoIdeal;
    document.getElementById("equiv_proteina_pct").value = proteinaPct;
    document.getElementById("equiv_grasa_pct").value = grasaPct;
    actualizarObjetivosDesdeFormulario();
    establecerMensaje("Datos cargados desde la Calculadora. Usa «Sugerir equivalentes» si deseas recalcular las raciones.", "success");
  }

  function actualizarObjetivosDesdeFormulario() {
    estado.objetivos = leerObjetivosFormulario();
    renderizarObjetivos();
    actualizarCalculosGrupos();
    programarGuardado();
  }

  function establecerMensaje(texto, tipo) {
    const mensaje = document.getElementById("equiv_mensaje");
    if (!mensaje) return;
    mensaje.textContent = texto || "";
    mensaje.className = `equivalentes-message${texto ? " is-visible" : ""}${tipo ? ` equivalentes-message--${tipo}` : ""}`;
  }

  function programarGuardado() {
    window.clearTimeout(temporizadorGuardado);
    temporizadorGuardado = window.setTimeout(guardarEstado, 180);
  }

  function guardarEstado() {
    try {
      estado.objetivos = leerObjetivosFormulario();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (error) { console.warn("No se pudo guardar el sistema de equivalentes.", error); }
  }

  function estadoGuardadoValido(datos) {
    return datos && typeof datos === "object" && datos.objetivos && datos.equivalentes &&
      Array.isArray(datos.comidas) && datos.comidas.length >= 4 && datos.comidas.length <= 6;
  }

  function cargarEstado() {
    try {
      const guardado = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (!estadoGuardadoValido(guardado)) return false;
      estado = crearEstadoInicial();
      estado.objetivos = Object.assign({}, estado.objetivos, guardado.objetivos);
      estado.equivalentes = Object.assign({}, estado.equivalentes, guardado.equivalentes);
      estado.comidas = guardado.comidas.map(function (comida, indice) {
        const respaldo = (PRESETS_COMIDAS[guardado.comidas.length] || PRESETS_COMIDAS[4])[indice];
        return { nombre: String(comida.nombre || respaldo.nombre), hora: String(comida.hora || respaldo.hora) };
      });
      estado.distribucion = guardado.distribucion && typeof guardado.distribucion === "object" ? guardado.distribucion : {};
      normalizarDistribucion();
      return true;
    } catch (_error) { return false; }
  }

  function reiniciarSistema() {
    if (!window.confirm("¿Reiniciar el sistema de equivalentes y recuperar el ejemplo de 1900 kcal?")) return;
    estado = crearEstadoInicial();
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* Sin almacenamiento disponible. */ }
    aplicarObjetivosFormulario();
    document.getElementById("equiv_num_comidas").value = "4";
    renderizarFilasGrupos();
    renderizarConfiguracionComidas();
    distribuirAutomaticamente(false);
    guardarEstado();
    establecerMensaje("Sistema reiniciado con el ejemplo base de 1900 kcal y 4 comidas.", "success");
  }

  function filasExportacionObjetivos(objetivos) {
    return [
      ["CUADRO DIETOSINTÉTICO DE ENERGÍA Y NUTRIENTES"], ["Energía diaria", objetivos.energia, "kcal"], ["Peso ideal", objetivos.pesoIdeal, "kg"], [],
      ["Macronutriente", "Porcentaje", "Kcal", "Gramos", "Raciones orientativas", "g/kg"],
      ["Proteínas", objetivos.proteinaPct / 100, objetivos.proteinaKcal, objetivos.proteina, Math.ceil(objetivos.proteina / 7), objetivos.proteina / objetivos.pesoIdeal],
      ["Grasas", objetivos.grasaPct / 100, objetivos.grasaKcal, objetivos.grasa, Math.ceil(objetivos.grasa / 5), objetivos.grasa / objetivos.pesoIdeal],
      ["Carbohidratos", objetivos.carbohidratoPct / 100, objetivos.carbohidratoKcal, objetivos.carbohidrato, Math.ceil(objetivos.carbohidrato / 15), objetivos.carbohidrato / objetivos.pesoIdeal],
      ["Total", 1, objetivos.energia, objetivos.proteina + objetivos.grasa + objetivos.carbohidrato]
    ];
  }

  function exportarExcel() {
    const objetivos = obtenerObjetivos();
    if (!objetivos.valido) { establecerMensaje(mensajeObjetivos(objetivos) || "Revisa el objetivo antes de exportar.", "error"); return; }
    if (!window.XLSX || !window.XLSX.utils) {
      establecerMensaje("No se pudo cargar la herramienta de Excel. Revisa la conexión e inténtalo nuevamente.", "error"); return;
    }
    const totales = calcularTotales(estado.equivalentes);
    const filasEquivalentes = [["SISTEMA DE EQUIVALENTES"], [], ["Grupo", "Subgrupo", "Equivalentes", "P por equivalente", "G por equivalente", "CHO por equivalente", "Proteínas", "Grasas", "Carbohidratos", "Energía"]];
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const cantidad = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const aporte = calcularAporteGrupo(grupo, cantidad);
      filasEquivalentes.push([grupo.grupo, grupo.subgrupo, cantidad, grupo.proteina, grupo.grasa, grupo.carbohidrato, aporte.proteina, aporte.grasa, aporte.carbohidrato, aporte.energia]);
    });
    filasEquivalentes.push([], ["TOTAL", "", totales.equivalentes, "", "", "", totales.proteina, totales.grasa, totales.carbohidrato, energiaDeMacros(totales.proteina, totales.grasa, totales.carbohidrato)]);
    filasEquivalentes.push(["% ADECUACIÓN", "", "", "", "", "", objetivos.proteina > 0 ? totales.proteina / objetivos.proteina : 0,
      objetivos.grasa > 0 ? totales.grasa / objetivos.grasa : 0, objetivos.carbohidrato > 0 ? totales.carbohidrato / objetivos.carbohidrato : 0,
      objetivos.energia > 0 ? energiaDeMacros(totales.proteina, totales.grasa, totales.carbohidrato) / objetivos.energia : 0]);
    const encabezadoDistribucion = ["Grupo", "Subgrupo"].concat(estado.comidas.map(function (comida) { return textoExcelSeguro(`${comida.hora} ${comida.nombre}`); }), ["Asignado", "Requerido", "% cumplimiento"]);
    const filasDistribucion = [["DISTRIBUCIÓN POR TIEMPOS DE COMIDA"], [], encabezadoDistribucion];
    GRUPOS_EQUIVALENTES.forEach(function (grupo) {
      const valores = estado.distribucion[grupo.id] || [];
      const asignado = valores.reduce(function (suma, valor) { return suma + limitarNoNegativo(valor); }, 0);
      const requerido = limitarNoNegativo(estado.equivalentes[grupo.id]);
      filasDistribucion.push([grupo.grupo, grupo.subgrupo].concat(valores, [asignado, requerido, requerido > 0 ? asignado / requerido : (asignado === 0 ? 1 : 0)]));
    });
    filasDistribucion.push([], ["Resumen por comida"], ["Indicador", "Unidad"].concat(estado.comidas.map(function (comida) { return textoExcelSeguro(comida.nombre); })));
    const porComida = totalesPorComida();
    [
      { nombre: "Energía", unidad: "kcal", valor: function (t) { return energiaDeMacros(t.proteina, t.grasa, t.carbohidrato); } },
      { nombre: "Proteínas", unidad: "g", valor: function (t) { return t.proteina; } },
      { nombre: "Grasas", unidad: "g", valor: function (t) { return t.grasa; } },
      { nombre: "Carbohidratos", unidad: "g", valor: function (t) { return t.carbohidrato; } },
      { nombre: "Relación CHO/P", unidad: "", valor: function (t) { return t.proteina > 0 ? t.carbohidrato / t.proteina : ""; } }
    ].forEach(function (indicador) { filasDistribucion.push([indicador.nombre, indicador.unidad].concat(porComida.map(indicador.valor))); });
    const libro = window.XLSX.utils.book_new();
    const hojaObjetivos = window.XLSX.utils.aoa_to_sheet(filasExportacionObjetivos(objetivos));
    const hojaEquivalentes = window.XLSX.utils.aoa_to_sheet(filasEquivalentes);
    const hojaDistribucion = window.XLSX.utils.aoa_to_sheet(filasDistribucion);
    hojaObjetivos["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 12 }];
    hojaEquivalentes["!cols"] = [{ wch: 34 }, { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 }];
    hojaDistribucion["!cols"] = [{ wch: 34 }, { wch: 22 }].concat(estado.comidas.map(function () { return { wch: 18 }; }), [{ wch: 12 }, { wch: 12 }, { wch: 18 }]);
    window.XLSX.utils.book_append_sheet(libro, hojaObjetivos, "Objetivos");
    window.XLSX.utils.book_append_sheet(libro, hojaEquivalentes, "Equivalentes");
    window.XLSX.utils.book_append_sheet(libro, hojaDistribucion, "Distribución");
    const fecha = new Date();
    const nombreFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
    window.XLSX.writeFile(libro, `Sistema_Equivalentes_${nombreFecha}.xlsx`);
    establecerMensaje("Archivo Excel generado con objetivos, equivalentes y distribución.", "success");
  }

  function configurarEventos() {
    ["equiv_energia", "equiv_peso_ideal", "equiv_proteina_pct", "equiv_grasa_pct"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", actualizarObjetivosDesdeFormulario);
    });
    document.getElementById("equiv_grupos_body").addEventListener("input", function (event) {
      const input = event.target.closest("[data-equivalent-input]");
      if (!input) return;
      estado.equivalentes[input.dataset.equivalentInput] = limitarNoNegativo(input.value);
      actualizarCalculosGrupos(); programarGuardado();
    });
    document.getElementById("equiv_grupos_body").addEventListener("change", function (event) {
      const input = event.target.closest("[data-equivalent-input]");
      if (!input) return;
      const valor = redondearPaso(input.value, STEP_EQUIVALENTE);
      input.value = valor; estado.equivalentes[input.dataset.equivalentInput] = valor;
      actualizarCalculosGrupos(); programarGuardado();
    });
    document.getElementById("equiv_distribucion_body").addEventListener("input", function (event) {
      const input = event.target.closest("[data-allocation-group]");
      if (!input) return;
      const grupo = input.dataset.allocationGroup;
      const indice = Number(input.dataset.allocationMeal);
      estado.distribucion[grupo][indice] = limitarNoNegativo(input.value);
      actualizarResumenDistribucion(); programarGuardado();
    });
    document.getElementById("equiv_distribucion_body").addEventListener("change", function (event) {
      const input = event.target.closest("[data-allocation-group]");
      if (!input) return;
      const grupo = input.dataset.allocationGroup;
      const indice = Number(input.dataset.allocationMeal);
      const valor = redondearPaso(input.value, STEP_EQUIVALENTE);
      input.value = valor; estado.distribucion[grupo][indice] = valor;
      actualizarResumenDistribucion(); programarGuardado();
    });
    document.getElementById("equiv_comidas_config").addEventListener("input", function (event) {
      const campo = event.target.closest("[data-meal-field]");
      if (!campo) return;
      const indice = Number(campo.dataset.mealIndex);
      estado.comidas[indice][campo.dataset.mealField] = campo.value;
      const encabezado = document.querySelector(`[data-meal-heading="${indice}"]`);
      if (encabezado && campo.dataset.mealField === "nombre") encabezado.textContent = campo.value || `Comida ${indice + 1}`;
      if (campo.dataset.mealField === "hora") {
        const hora = encabezado ? encabezado.parentElement.querySelector("small") : null;
        if (hora) hora.textContent = campo.value;
      }
      programarGuardado();
    });
    document.getElementById("equiv_num_comidas").addEventListener("change", function (event) { cambiarCantidadComidas(event.target.value); });
    document.getElementById("equiv_cargar_calculadora").addEventListener("click", cargarDesdeCalculadora);
    document.getElementById("equiv_sugerir").addEventListener("click", sugerirEquivalentes);
    document.getElementById("equiv_distribuir").addEventListener("click", function () { distribuirAutomaticamente(true); });
    document.getElementById("equiv_exportar").addEventListener("click", exportarExcel);
    document.getElementById("equiv_reiniciar").addEventListener("click", reiniciarSistema);
  }

  function inicializarEquivalentes() {
    if (!document.getElementById("equivalentes")) return;
    const teniaEstado = cargarEstado();
    aplicarObjetivosFormulario();
    document.getElementById("equiv_num_comidas").value = String(estado.comidas.length);
    renderizarFilasGrupos();
    renderizarConfiguracionComidas();
    if (teniaEstado && Object.keys(estado.distribucion).length) renderizarEstructuraDistribucion();
    else distribuirAutomaticamente(false);
    configurarEventos();
    if (window.lucide) window.lucide.createIcons();
  }

  window.SistemaEquivalentes = {
    grupos: GRUPOS_EQUIVALENTES.map(function (grupo) { return Object.assign({}, grupo); }),
    calcularObjetivos,
    calcularTotales,
    distribuirUnidades
  };

  document.addEventListener("DOMContentLoaded", inicializarEquivalentes);
})();
