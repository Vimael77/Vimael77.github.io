// Lógica para generar la dieta semanal basada en el knapsack heurístico
// y funciones auxiliares para la interfaz del generador.

/**
 * Calcula los macros totales pre-calculados de una receta basándose en 'alimentos'
 */
function calcularMacrosReceta(receta) {
    let macros = { energia: 0, proteina: 0, grasa: 0, carbohidratos: 0 };
    if (!receta.ingredientes) return macros;
    
    receta.ingredientes.forEach(ing => {
        // Buscar el alimento en la base de datos principal
        let alimentoRef = alimentos.find(a => a.nombre === ing.nombre);
        if (alimentoRef) {
            let factor = ing.gramos / 100;
            macros.energia += (parseFloat(alimentoRef.energia_calculada) || 0) * factor;
            macros.proteina += (parseFloat(alimentoRef.proteina) || 0) * factor;
            macros.grasa += (parseFloat(alimentoRef.grasa_total) || 0) * factor;
            macros.carbohidratos += (parseFloat(alimentoRef.carbohidratos) || 0) * factor;
        }
    });
    return macros;
}

/**
 * Distribuye los macros requeridos en "buckets" (tiempos de comida)
 * numComidas: 3, 4, o 5
 * entrenaEn: 'Mañana', 'Tarde', 'Noche', 'No entrena'
 */
function distribuirMacrosPorTiempo(reqEnergia, reqProt, reqGrasa, reqCarb, numComidas, entrenaEn) {
    let distribucion = {};
    let tiempos = [];
    
    if (numComidas === 3) tiempos = ["Desayuno", "Almuerzo", "Merienda"];
    if (numComidas === 4) tiempos = ["Desayuno", "Almuerzo", "Media Tarde", "Merienda"];
    if (numComidas === 5) tiempos = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda"];

    // Proteína se distribuye linealmente (igual en todas las comidas)
    let protPorComida = reqProt / numComidas;

    // Asignación base:
    tiempos.forEach(t => {
        distribucion[t] = {
            proteina: protPorComida,
            carbohidratos: 0,
            grasa: 0,
            energia: 0
        };
    });

    // Criterios cualitativos para Carbos y Grasas según entrenamiento
    // Mapeo simple:
    // Si entrena en la Mañana -> Desayuno y Media Mañana son peri-entreno (altos en carb, bajos en grasa)
    // Si entrena en la Tarde -> Almuerzo y Media Tarde peri-entreno
    // Si entrena en la Noche -> Merienda peri-entreno
    // Si No entrena -> Distribución más lineal

    let pesosCarb = {};
    let pesosGrasa = {};

    tiempos.forEach(t => {
        pesosCarb[t] = 1;
        pesosGrasa[t] = 1;
    });

    if (entrenaEn !== 'No entrena') {
        if (entrenaEn === 'Mañana') {
            pesosCarb["Desayuno"] = 2;
            if(pesosCarb["Media Mañana"]) pesosCarb["Media Mañana"] = 1.5;
            pesosGrasa["Merienda"] = 2; // Lejos del entreno
        } else if (entrenaEn === 'Tarde') {
            pesosCarb["Almuerzo"] = 2;
            if(pesosCarb["Media Tarde"]) pesosCarb["Media Tarde"] = 1.5;
            pesosGrasa["Desayuno"] = 2;
        } else if (entrenaEn === 'Noche') {
            pesosCarb["Merienda"] = 2;
            if(pesosCarb["Media Tarde"]) pesosCarb["Media Tarde"] = 1.5;
            pesosGrasa["Desayuno"] = 2;
        }
    }

    let sumaPesosCarb = Object.values(pesosCarb).reduce((a,b)=>a+b, 0);
    let sumaPesosGrasa = Object.values(pesosGrasa).reduce((a,b)=>a+b, 0);

    tiempos.forEach(t => {
        distribucion[t].carbohidratos = reqCarb * (pesosCarb[t] / sumaPesosCarb);
        distribucion[t].grasa = reqGrasa * (pesosGrasa[t] / sumaPesosGrasa);
        // Calorías estimadas del bucket:
        distribucion[t].energia = (distribucion[t].proteina * 4) + (distribucion[t].carbohidratos * 4) + (distribucion[t].grasa * 9);
    });

    return { tiempos, distribucion };
}

/**
 * Algoritmo Heurístico (Emparejamiento / Knapsack)
 * Para un bucket específico, buscar una receta principal y añadir guarniciones si es necesario.
 */
function generarComidaParaBucket(bucketTarget, tipoComida) {
    let todas = obtenerTodasLasRecetas();
    // Precalcular macros
    todas.forEach(r => r.macrosCalc = calcularMacrosReceta(r));

    // Filtrar recetas que sean algo afines al tipo de comida (heurística simple)
    // O permitir cualquiera si no hay suficientes
    let posibles = todas.filter(r => r.tipo === tipoComida || r.tipo === 'Cualquiera');
    if (posibles.length === 0) posibles = todas; // Fallback

    // Elegir una receta aleatoria (para dar variedad a la semana)
    let recetaElegida = posibles[Math.floor(Math.random() * posibles.length)];
    
    // Si no hay receta, retornar vacío
    if (!recetaElegida) return [];

    // Clonar para no alterar la original
    let comidaFinal = JSON.parse(JSON.stringify(recetaElegida.ingredientes));
    let macrosActuales = { ...recetaElegida.macrosCalc };

    // Comparar con el target y añadir guarniciones si faltan más de 15g de Carbohidratos
    let faltanCarbos = bucketTarget.carbohidratos - macrosActuales.carbohidratos;
    if (faltanCarbos > 15) {
        // Añadir una guarnición de carbohidratos
        let guarnsCarb = guarniciones_db.filter(g => g.tipo === 'carbohidrato');
        if (guarnsCarb.length > 0) {
            let guarnElegida = guarnsCarb[Math.floor(Math.random() * guarnsCarb.length)];
            // Buscar macros en la base de alimentos
            let refAlim = alimentos.find(a => a.nombre === guarnElegida.nombre);
            if (refAlim) {
                let factor = guarnElegida.gramos_porcion / 100;
                let carbGuarn = (parseFloat(refAlim.carbohidratos) || 0) * factor;
                // Calcular cuántas porciones necesitamos (aprox)
                let porciones = Math.max(0.5, Math.min(2, faltanCarbos / (carbGuarn || 1)));
                comidaFinal.push({
                    nombre: guarnElegida.nombre,
                    gramos: Math.round(guarnElegida.gramos_porcion * porciones)
                });
            }
        }
    }

    return {
        nombre_receta: recetaElegida.nombre,
        elaboracion_receta: recetaElegida.elaboracion || "",
        items: comidaFinal
    };
}

/**
 * Genera el plan semanal completo
 */
function generarPlanSemanal(reqEnergia, reqProt, reqGrasa, reqCarb, numComidas, entrenaEn) {
    let distInfo = distribuirMacrosPorTiempo(reqEnergia, reqProt, reqGrasa, reqCarb, numComidas, entrenaEn);
    let plan = {};
    let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    
    // Mapear "Desayuno", "Almuerzo" a tipos de receta (puede ser mejorable)
    const mapTipoReceta = (t) => {
        if (t.includes("Desayuno")) return "Desayuno";
        if (t.includes("Almuerzo")) return "Almuerzo";
        if (t.includes("Merienda") || t.includes("Cena")) return "Cena"; // Usamos 'Cena' para Merienda
        return "Snack";
    };

    dias.forEach(dia => {
        plan[dia] = {};
        distInfo.tiempos.forEach(t => {
            let target = distInfo.distribucion[t];
            let tipoBusqueda = mapTipoReceta(t);
            // Si el tiempo es Merienda en numComidas=5, la base de datos podría tener "Cena" o "Snack"
            // Dejamos que generarComidaParaBucket maneje el fallback
            let generada = generarComidaParaBucket(target, tipoBusqueda);
            plan[dia][t] = generada;
        });
    });

    return { plan, tiempos: distInfo.tiempos };
}

// ==========================================
// FUNCIONES DE INTERFAZ GRÁFICA (UI)
// ==========================================

let planGeneradoGlobal = null;

function escaparHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function ejecutarGenerador() {
    // 1. Obtener requerimientos de la calculadora
    let reqEnergia = parseFloat(document.getElementById('input_energia_calculada_requerimiento')?.value || 0);
    let reqProt = parseFloat(document.getElementById('input_proteina_requerimiento')?.value || 0);
    let reqGrasa = parseFloat(document.getElementById('input_grasa_requerimiento')?.value || 0);
    let reqCarb = parseFloat(document.getElementById('input_carbohidratos_requerimiento')?.value || 0);

    if (reqEnergia <= 1 || reqProt <= 1) {
        alert("Por favor, calcula primero los requerimientos en la pestaña Calculadora.");
        return;
    }

    // 2. Obtener configuración
    let numComidas = parseInt(document.getElementById('gen_comidas').value);
    let entrenaEn = document.getElementById('gen_entrenamiento').value;

    // 3. Generar Plan
    let resultado = generarPlanSemanal(reqEnergia, reqProt, reqGrasa, reqCarb, numComidas, entrenaEn);
    planGeneradoGlobal = resultado;

    // 4. Renderizar Plan
    renderizarCalendarioSemanal(resultado.plan, resultado.tiempos);
}

function renderizarCalendarioSemanal(plan, tiempos) {
    document.getElementById('contenedor_calendario').style.display = 'block';
    let thead = document.getElementById('thead_semanal');
    let tbody = document.getElementById('tbody_semanal');
    
    let dias = Object.keys(plan); // Lunes, Martes...

    // Encabezados
    let theadHtml = '<tr><th>Tiempo de Comida</th>';
    dias.forEach(dia => {
        theadHtml += `<th>${dia}</th>`;
    });
    theadHtml += '</tr>';
    thead.innerHTML = theadHtml;

    // Filas
    let tbodyHtml = '';
    tiempos.forEach(t => {
        tbodyHtml += `<tr><td class="fw-bold bg-light">${t}</td>`;
        dias.forEach(dia => {
            let comida = plan[dia][t];
            if (!comida || !comida.items) {
                tbodyHtml += `<td>-</td>`;
                return;
            }
            
            let celdaHtml = `<div class="receta-box">
                <strong class="text-primary">${escaparHtml(comida.nombre_receta)}</strong><br>
                <ul class="list-unstyled mb-0" style="font-size:0.85em;">`;
            
            comida.items.forEach(item => {
                celdaHtml += `<li>- ${escaparHtml(item.nombre)} (${escaparHtml(item.gramos)}g)</li>`;
            });
            celdaHtml += `</ul>`;
            if (comida.elaboracion_receta) {
                celdaHtml += `<div class="receta-elaboracion"><strong>Elaboración:</strong> ${escaparHtml(comida.elaboracion_receta)}</div>`;
            }
            celdaHtml += `</div>`;
            tbodyHtml += `<td>${celdaHtml}</td>`;
        });
        tbodyHtml += `</tr>`;
    });
    tbody.innerHTML = tbodyHtml;
}

// ---- Funciones para Crear Receta ----
let ingredientesTemp = [];

function buscarIngredienteParaReceta() {
    const busqueda = document.getElementById('buscador_ingrediente').value.toLowerCase();
    const lista = document.getElementById('lista_busqueda_ingredientes');
    lista.innerHTML = '';

    if (busqueda.length < 2) return;

    let resultados = alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda)).slice(0, 10);
    
    resultados.forEach(alim => {
        let btn = document.createElement('button');
        btn.className = 'list-group-item list-group-item-action py-1';
        btn.textContent = alim.nombre;
        btn.onclick = () => {
            let gramos = prompt(`¿Cuántos gramos de "${alim.nombre}" desea añadir?`, "100");
            if (gramos && !isNaN(gramos)) {
                ingredientesTemp.push({ nombre: alim.nombre, gramos: parseFloat(gramos) });
                actualizarListaIngredientes();
                document.getElementById('buscador_ingrediente').value = '';
                lista.innerHTML = '';
            }
        };
        lista.appendChild(btn);
    });
}

function actualizarListaIngredientes() {
    let ul = document.getElementById('ingredientes_seleccionados_lista');
    ul.innerHTML = '';
    ingredientesTemp.forEach((ing, index) => {
        let li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center py-1';
        li.innerHTML = `${ing.nombre} (${ing.gramos}g)
            <button class="btn btn-sm btn-danger" onclick="quitarIngredienteTemp(${index})">X</button>`;
        ul.appendChild(li);
    });
}

function quitarIngredienteTemp(index) {
    ingredientesTemp.splice(index, 1);
    actualizarListaIngredientes();
}

function guardarNuevaReceta() {
    let nombre = document.getElementById('nueva_receta_nombre').value.trim();
    let tipo = document.getElementById('nueva_receta_tipo').value;
    let elaboracion = document.getElementById('nueva_receta_elaboracion').value.trim();

    if (!nombre) {
        alert("Por favor ingrese un nombre para la receta.");
        return;
    }
    if (ingredientesTemp.length === 0) {
        alert("Añada al menos un ingrediente a la receta.");
        return;
    }

    let receta = {
        nombre: nombre,
        tipo: tipo,
        ingredientes: [...ingredientesTemp],
        elaboracion: elaboracion || "Preparar los ingredientes indicados, cocinarlos segun corresponda y servir la receta."
    };

    guardarRecetaPersonalizada(receta);
    alert("Receta guardada exitosamente.");
    
    // Limpiar
    document.getElementById('nueva_receta_nombre').value = '';
    document.getElementById('nueva_receta_elaboracion').value = '';
    ingredientesTemp = [];
    actualizarListaIngredientes();
    $('#modalCrearReceta').modal('hide');
}

// Descargar el plan semanal como PDF
function generarPDFSemanal() {
    if (!planGeneradoGlobal) {
        alert("Genere un menú primero.");
        return;
    }
    const nombre = document.getElementById('calc_nombre').value || "Paciente";
    
    let html = `
        <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px;">
            <h2 style="color: #4CAF50; text-align: center;">Menú Semanal - ${nombre}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ccc; padding: 5px; background: #eee;">Tiempo</th>`;
    
    let dias = Object.keys(planGeneradoGlobal.plan);
    dias.forEach(dia => {
        html += `<th style="border: 1px solid #ccc; padding: 5px; background: #eee;">${dia}</th>`;
    });
    html += `</tr></thead><tbody>`;

    planGeneradoGlobal.tiempos.forEach(t => {
        html += `<tr><td style="border: 1px solid #ccc; padding: 5px; font-weight: bold; background: #f9f9f9;">${t}</td>`;
        dias.forEach(dia => {
            let comida = planGeneradoGlobal.plan[dia][t];
            if (!comida || !comida.items) {
                html += `<td style="border: 1px solid #ccc; padding: 5px;">-</td>`;
                return;
            }
            html += `<td style="border: 1px solid #ccc; padding: 5px; vertical-align: top;">
                <strong style="color:#007bff;">${escaparHtml(comida.nombre_receta)}</strong><br>
                <ul style="padding-left: 15px; margin: 5px 0;">`;
            comida.items.forEach(item => {
                html += `<li>${escaparHtml(item.nombre)} (${escaparHtml(item.gramos)}g)</li>`;
            });
            html += `</ul>`;
            if (comida.elaboracion_receta) {
                html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #ddd; line-height: 1.4;"><strong>Elaboración:</strong> ${escaparHtml(comida.elaboracion_receta)}</div>`;
            }
            html += `</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;

    var opt = {
        margin:       [10, 10, 10, 10],
        filename:     'Menu_Semanal_' + nombre.replace(/\s+/g, '_') + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(html).save().catch(err => {
        console.error("Error generando PDF semanal", err);
    });
}
