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
    if (numComidas === 6) tiempos = ["Desayuno", "Media Mañana", "Almuerzo", "Media Tarde", "Merienda", "Cena"];

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
    // Si entrena en la Noche -> Cena peri-entreno cuando existe; si no, Merienda
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
            pesosGrasa[tiempos[tiempos.length - 1]] = 2; // Lejos del entreno
        } else if (entrenaEn === 'Tarde') {
            pesosCarb["Almuerzo"] = 2;
            if(pesosCarb["Media Tarde"]) pesosCarb["Media Tarde"] = 1.5;
            pesosGrasa["Desayuno"] = 2;
        } else if (entrenaEn === 'Noche') {
            const tiempoNocturno = pesosCarb["Cena"] ? "Cena" : "Merienda";
            pesosCarb[tiempoNocturno] = 2;
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
        if (t.includes("Merienda") || t.includes("Cena")) return "Cena";
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
function generarPDFSemanalTablaOriginal() {
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

// Version HTML previa. Se conserva como referencia, pero el boton usa la version jsPDF directa de abajo.
function generarPDFSemanalHtmlAnterior() {
    if (!planGeneradoGlobal) {
        alert("Genere un menu primero.");
        return;
    }

    const nombre = document.getElementById('calc_nombre').value || "Paciente";
    const nombreSeguro = escaparHtml(nombre);
    const dias = Object.keys(planGeneradoGlobal.plan);

    let html = `
        <div style="font-family: Arial, sans-serif; color: #222; font-size: 10.5px; line-height: 1.35;">
            <style>
                .pdf-header {
                    text-align: center;
                    margin: 0 0 10px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #4CAF50;
                }
                .pdf-header h1 {
                    margin: 0;
                    color: #4CAF50;
                    font-size: 20px;
                }
                .pdf-day {
                    margin: 0 0 10px;
                }
                .pdf-day-title {
                    margin: 0;
                    padding: 6px 8px;
                    background: #cfe2ff;
                    color: #111;
                    border: 1px solid #8bbcff;
                    font-size: 14px;
                }
                .pdf-meal {
                    display: table;
                    width: 100%;
                    border-collapse: collapse;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .pdf-time,
                .pdf-content {
                    display: table-cell;
                    border: 1px solid #cfd7e3;
                    padding: 6px;
                    vertical-align: top;
                    overflow-wrap: anywhere;
                }
                .pdf-time {
                    width: 21%;
                    background: #f4f6f8;
                    font-weight: bold;
                }
                .pdf-recipe {
                    color: #0066ff;
                    display: block;
                    font-size: 12px;
                    margin-bottom: 4px;
                }
                .pdf-items {
                    margin: 0;
                    padding-left: 14px;
                }
                .pdf-elab {
                    margin-top: 5px;
                    padding-top: 5px;
                    border-top: 1px solid #e1e5ea;
                    color: #444;
                }
            </style>
            <div class="pdf-header">
                <h1>Menu Semanal</h1>
                <div>${nombreSeguro}</div>
            </div>`;

    dias.forEach(dia => {
        html += `
            <section class="pdf-day">
                <h2 class="pdf-day-title">${escaparHtml(dia)}</h2>`;

        planGeneradoGlobal.tiempos.forEach(t => {
            const comida = planGeneradoGlobal.plan[dia][t];
            html += `<div class="pdf-meal"><div class="pdf-time">${escaparHtml(t)}</div><div class="pdf-content">`;

            if (!comida || !comida.items) {
                html += `-`;
            } else {
                html += `<strong class="pdf-recipe">${escaparHtml(comida.nombre_receta)}</strong>
                    <ul class="pdf-items">`;

                comida.items.forEach(item => {
                    html += `<li>${escaparHtml(item.nombre)} (${escaparHtml(item.gramos)}g)</li>`;
                });

                html += `</ul>`;
                if (comida.elaboracion_receta) {
                    html += `<div class="pdf-elab"><strong>Elaboracion:</strong> ${escaparHtml(comida.elaboracion_receta)}</div>`;
                }
            }

            html += `</div></div>`;
        });

        html += `
            </section>`;
    });

    html += `</div>`;

    const nombreArchivo = 'Menu_Semanal_' + nombre.replace(/\s+/g, '_') + '.pdf';
    const opt = {
        margin:       [8, 8, 8, 8],
        filename:     nombreArchivo,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.pdf-meal'] }
    };

    html2pdf().set(opt).from(html).save().catch(err => {
        console.error("Error generando PDF semanal", err);
    });
}

function generarPDFSemanal() {
    if (!planGeneradoGlobal) {
        alert("Genere un menu primero.");
        return;
    }

    const JsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
    if (!JsPDF) {
        alert("No se pudo cargar jsPDF para generar el PDF semanal.");
        return;
    }

    const nombre = document.getElementById('calc_nombre').value || "Paciente";
    const nombreArchivo = 'Menu_Semanal_' + nombre.replace(/\s+/g, '_') + '.pdf';
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - (margin * 2);
    const timeWidth = 34;
    const contentWidth = usableWidth - timeWidth;
    const lineHeight = 4.2;
    const padding = 3;
    let y = margin;

    function limpiarTextoPdf(valor) {
        return String(valor || "")
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function agregarPagina() {
        doc.addPage();
        y = margin;
    }

    function asegurarEspacio(alto) {
        if (y + alto > pageHeight - margin) {
            agregarPagina();
        }
    }

    function escribirEncabezado() {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(76, 175, 80);
        doc.text('Menu Semanal', pageWidth / 2, y, { align: 'center' });
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 70);
        doc.text(limpiarTextoPdf(nombre), pageWidth / 2, y, { align: 'center' });
        y += 6;

        doc.setDrawColor(76, 175, 80);
        doc.line(margin, y, pageWidth - margin, y);
        y += 7;
    }

    function escribirTituloDia(dia) {
        asegurarEspacio(12);
        doc.setFillColor(207, 226, 255);
        doc.setDrawColor(139, 188, 255);
        doc.rect(margin, y, usableWidth, 8, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text(limpiarTextoPdf(dia), margin + 3, y + 5.5);
        y += 10;
    }

    function prepararLineasComida(comida) {
        const lineas = [];
        if (!comida || !comida.items) {
            lineas.push({ texto: "-", estilo: "normal", color: [30, 30, 30] });
            return lineas;
        }

        const receta = limpiarTextoPdf(comida.nombre_receta);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.splitTextToSize(receta, contentWidth - (padding * 2)).forEach(linea => {
            lineas.push({ texto: linea, estilo: "bold", color: [0, 102, 255] });
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        comida.items.forEach(item => {
            const itemTexto = `- ${limpiarTextoPdf(item.nombre)} (${limpiarTextoPdf(item.gramos)}g)`;
            doc.splitTextToSize(itemTexto, contentWidth - (padding * 2)).forEach(linea => {
                lineas.push({ texto: linea, estilo: "normal", color: [30, 30, 30] });
            });
        });

        if (comida.elaboracion_receta) {
            lineas.push({ texto: "", estilo: "normal", color: [30, 30, 30] });
            const elaboracion = `Elaboracion: ${limpiarTextoPdf(comida.elaboracion_receta)}`;
            doc.splitTextToSize(elaboracion, contentWidth - (padding * 2)).forEach(linea => {
                lineas.push({ texto: linea, estilo: "normal", color: [70, 70, 70] });
            });
        }

        return lineas;
    }

    function escribirComida(tiempo, comida) {
        const lineas = prepararLineasComida(comida);
        const altoContenido = Math.max(12, (lineas.length * lineHeight) + (padding * 2));
        const altoDisponible = pageHeight - margin - y;
        if (altoContenido > altoDisponible && altoContenido < pageHeight - (margin * 2)) {
            agregarPagina();
        }

        const bloqueY = y;
        doc.setDrawColor(207, 215, 227);
        doc.setFillColor(244, 246, 248);
        doc.rect(margin, bloqueY, timeWidth, altoContenido, 'FD');
        doc.rect(margin + timeWidth, bloqueY, contentWidth, altoContenido);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        const tiempoLineas = doc.splitTextToSize(limpiarTextoPdf(tiempo), timeWidth - (padding * 2));
        doc.text(tiempoLineas, margin + padding, bloqueY + padding + 3);

        let textoY = bloqueY + padding + 3;
        lineas.forEach(linea => {
            doc.setFont('helvetica', linea.estilo);
            doc.setFontSize(linea.estilo === "bold" ? 10 : 9);
            doc.setTextColor(linea.color[0], linea.color[1], linea.color[2]);
            if (linea.texto) {
                doc.text(linea.texto, margin + timeWidth + padding, textoY);
            }
            textoY += lineHeight;
        });

        y += altoContenido;
    }

    escribirEncabezado();

    Object.keys(planGeneradoGlobal.plan).forEach((dia, indexDia) => {
        if (indexDia > 0) {
            y += 3;
        }
        escribirTituloDia(dia);

        planGeneradoGlobal.tiempos.forEach(tiempo => {
            escribirComida(tiempo, planGeneradoGlobal.plan[dia][tiempo]);
        });
    });

    doc.save(nombreArchivo);
}

function generarPDFSemanalHorizontal() {
    if (!planGeneradoGlobal) {
        alert("Genere un menu primero.");
        return;
    }

    const JsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
    if (!JsPDF) {
        alert("No se pudo cargar jsPDF para generar el PDF semanal.");
        return;
    }

    const nombre = document.getElementById('calc_nombre').value || "Paciente";
    const nombreArchivo = 'Menu_Semanal_Horizontal_' + nombre.replace(/\s+/g, '_') + '.pdf';
    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 6;
    const usableWidth = pageWidth - (margin * 2);
    const timeWidth = 24;
    const dayWidth = (usableWidth - timeWidth) / 7;
    const padding = 1.8;
    const lineHeight = 2.55;
    const headerHeight = 9;
    const rowMinHeight = 16;
    let y = margin;

    function limpiarTextoPdf(valor) {
        return String(valor || "")
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escribirTitulo() {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(76, 175, 80);
        doc.text('Menu Semanal', pageWidth / 2, y, { align: 'center' });
        y += 5.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        doc.text(limpiarTextoPdf(nombre), pageWidth / 2, y, { align: 'center' });
        y += 5;

        doc.setDrawColor(76, 175, 80);
        doc.line(margin, y, pageWidth - margin, y);
        y += 7;
    }

    function escribirEncabezadoTabla(dias) {
        let x = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);

        doc.setFillColor(207, 226, 255);
        doc.setDrawColor(139, 188, 255);
        doc.rect(x, y, timeWidth, headerHeight, 'F');
        doc.rect(x, y, timeWidth, headerHeight, 'S');
        doc.setTextColor(20, 20, 20);
        doc.text('Tiempo', x + timeWidth / 2, y + 5.8, { align: 'center' });
        x += timeWidth;

        dias.forEach(dia => {
            doc.setFillColor(207, 226, 255);
            doc.setDrawColor(139, 188, 255);
            doc.rect(x, y, dayWidth, headerHeight, 'F');
            doc.rect(x, y, dayWidth, headerHeight, 'S');
            doc.setTextColor(20, 20, 20);
            doc.text(limpiarTextoPdf(dia), x + dayWidth / 2, y + 5.8, { align: 'center' });
            x += dayWidth;
        });

        y += headerHeight;
    }

    function nuevaPagina(dias) {
        doc.addPage('a4', 'landscape');
        y = margin;
        escribirTitulo();
        escribirEncabezadoTabla(dias);
    }

    function construirLineasCelda(comida) {
        const lineas = [];
        const anchoTexto = dayWidth - (padding * 2);

        if (!comida || !comida.items) {
            lineas.push({ texto: '-', estilo: 'normal', color: [30, 30, 30], size: 5.2 });
            return lineas;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.8);
        doc.splitTextToSize(limpiarTextoPdf(comida.nombre_receta), anchoTexto).forEach(linea => {
            lineas.push({ texto: linea, estilo: 'bold', color: [0, 102, 255], size: 5.8 });
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        comida.items.forEach(item => {
            const texto = `- ${limpiarTextoPdf(item.nombre)} (${limpiarTextoPdf(item.gramos)}g)`;
            doc.splitTextToSize(texto, anchoTexto).forEach(linea => {
                lineas.push({ texto: linea, estilo: 'normal', color: [30, 30, 30], size: 5.2 });
            });
        });

        return lineas;
    }

    function dibujarLineasCelda(lineas, x, yInicio, altoFila) {
        let textoY = yInicio + padding + 2.6;
        const limiteY = yInicio + altoFila - padding;

        for (let i = 0; i < lineas.length; i++) {
            if (textoY > limiteY) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.2);
                doc.setTextColor(80, 80, 80);
                doc.text('...', x + padding, limiteY);
                break;
            }

            const linea = lineas[i];
            doc.setFont('helvetica', linea.estilo);
            doc.setFontSize(linea.size);
            doc.setTextColor(linea.color[0], linea.color[1], linea.color[2]);
            doc.text(linea.texto, x + padding, textoY);
            textoY += lineHeight;
        }
    }

    function dibujarFila(tiempo, dias) {
        const lineasPorDia = dias.map(dia => construirLineasCelda(planGeneradoGlobal.plan[dia][tiempo]));
        const maxLineas = Math.max(...lineasPorDia.map(lineas => lineas.length), 1);
        let altoFila = Math.max(rowMinHeight, (maxLineas * lineHeight) + (padding * 2) + 2);
        const altoMaximoFila = pageHeight - margin - y;

        if (altoFila > altoMaximoFila && y > margin + 20) {
            nuevaPagina(dias);
        }

        altoFila = Math.min(altoFila, pageHeight - margin - y);
        const yFila = y;
        let x = margin;

        doc.setDrawColor(207, 215, 227);
        doc.setFillColor(244, 246, 248);
        doc.rect(x, yFila, timeWidth, altoFila, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 30, 30);
        doc.text(doc.splitTextToSize(limpiarTextoPdf(tiempo), timeWidth - (padding * 2)), x + padding, yFila + padding + 3);
        x += timeWidth;

        lineasPorDia.forEach(lineas => {
            doc.rect(x, yFila, dayWidth, altoFila);
            dibujarLineasCelda(lineas, x, yFila, altoFila);
            x += dayWidth;
        });

        y += altoFila;
    }

    const dias = Object.keys(planGeneradoGlobal.plan);
    escribirTitulo();
    escribirEncabezadoTabla(dias);

    planGeneradoGlobal.tiempos.forEach(tiempo => {
        dibujarFila(tiempo, dias);
    });

    doc.save(nombreArchivo);
}
