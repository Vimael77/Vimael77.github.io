// leer el archivo CSV de alimentos
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
window.alimentos_subtotales = {};
/*
document.getElementById("file-input").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileContent = event.target.result;
    const lineas = fileContent.split('\n');
    for (const linea of lineas) {
      valores = linea.split(";");
      alimentos.push(
        {
          nombre: valores[0],
          energia_calculada: parseFloat(valores[2].replace(",", ".")),
          proteina: parseFloat(valores[3].replace(",", ".")),
          grasa_total: parseFloat(valores[4].replace(",", ".")),
          carbohidratos: parseFloat(valores[5].replace(",", ".")),
          fibra: parseFloat(valores[6].replace(",", ".")),
          ags: parseFloat(valores[7].replace(",", ".")),
          agm: parseFloat(valores[8].replace(",", ".")),
          agpi: parseFloat(valores[9].replace(",", ".")),
          colesterol: parseFloat(valores[10].replace(",", ".")),
          calcio: parseFloat(valores[11].replace(",", ".")),
          fosforo: parseFloat(valores[12].replace(",", ".")),
          hierro: parseFloat(valores[13].replace(",", ".")),
          potasio: parseFloat(valores[14].replace(",", ".")),
          sodio: parseFloat(valores[15].replace(",", ".")),
          zinc: parseFloat(valores[16].replace(",", ".")),
          vitamina_c: parseFloat(valores[17].replace(",", ".")),
          vitamina_a: parseFloat(valores[18].replace(",", ".")),
          folatos: parseFloat(valores[19].replace(",", ".")),
          vitamina_b12: parseFloat(valores[20].replace(",", ".")),
        },          
      )
  }
  };
  reader.readAsText(file);
});
*/


document.getElementById("file-input2").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, { type: 'array' });
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (alimentos.length > 0) {
      for (var i = 1; i < jsonData.length; i++) {
        var row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        var tiempoComida = row[0];
        var nombreAlimento = row[1];
        var gramos = row[2];

        if (tiempoComida === "Identificacion") {
          let idInput = document.getElementById("calc_id");
          if(idInput) idInput.value = nombreAlimento || "";
          continue;
        }
        if (tiempoComida === "Fecha") {
          let fInput = document.getElementById("calc_fecha");
          if(fInput) fInput.value = nombreAlimento || "";
          continue;
        }
        if (tiempoComida === "NombrePaciente") {
          let nInput = document.getElementById("calc_nombre");
          if(nInput) nInput.value = nombreAlimento || "";
          continue;
        }
        if (tiempoComida === "Paciente Info") continue;

        if (nombreAlimento && nombreAlimento !== "Total" && nombreAlimento !== 'Requerimiento'
          && nombreAlimento !== 'Total Kilocalorias'
          && nombreAlimento !== 'Porcentaje de Adecuación') {
          
          agregarAlimentos(gramos, nombreAlimento, tiempoComida);
        }
        
        if (nombreAlimento === 'Requerimiento') {
          document.getElementById('input_energia_calculada_requerimiento').value = row[3];
          document.getElementById('input_proteina_requerimiento').value = row[4];
          document.getElementById('input_grasa_requerimiento').value = row[5];
          document.getElementById('input_carbohidratos_requerimiento').value = row[6];
          document.getElementById('input_fibra_requerimiento').value = row[7];
          document.getElementById("input_ags_requerimiento").value = row[8];
          document.getElementById("input_agm_requerimiento").value = row[9];
          document.getElementById("input_agpi_requerimiento").value = row[10];
          document.getElementById("input_colesterol_requerimiento").value = row[11];
          document.getElementById("input_calcio_requerimiento").value = row[12];
          document.getElementById("input_fosforo_requerimiento").value = row[13];
          document.getElementById("input_hierro_requerimiento").value = row[14];
          document.getElementById("input_potasio_requerimiento").value = row[15];
          document.getElementById("input_sodio_requerimiento").value = row[16];
          document.getElementById("input_zinc_requerimiento").value = row[17];
          document.getElementById("input_vitamina_c_requerimiento").value = row[18];
          document.getElementById("input_vitamina_a_requerimiento").value = row[19];
          document.getElementById("input_folatos_requerimiento").value = row[20];
          document.getElementById("input_vitamina_b12_requerimiento").value = row[21];
          calcular();
          break;
        }
      }
    } else {
      alert('Por favor cargue la base de datos antes de recuperar el trabajo.');
    }


  };
  reader.readAsArrayBuffer(file);

});

//Descarga alimentos

function total_kilocalorias() {

  alimentos_total_kc['gramos'] = "";
  alimentos_total_kc['nombre'] = "Total Kilocalorias";
  alimentos_total_kc['energia_calculada'] = "";
  alimentos_total_kc['proteina'] = alimentos_total['proteina'] * 4
  alimentos_total_kc['grasa_total'] = alimentos_total['grasa_total'] * 9
  alimentos_total_kc['carbohidratos'] = alimentos_total['carbohidratos'] * 4

}

const ordenDeseado = [
  "nombre",
  "gramos",
  "energia_calculada",
  "proteina",
  "grasa_total",
  "carbohidratos",
  "fibra",
  "ags",
  "agm",
  "agpi",
  "colesterol",
  "calcio",
  "fosforo",
  "hierro",
  "potasio",
  "sodio",
  "zinc",
  "vitamina_c",
  "vitamina_a",
  "folatos",
  "vitamina_b12"
];

function descargar() {
  nuevoOrden();
  total_kilocalorias();
  let info = [];
  
  info.push({ "Tiempo de Comida": "Paciente Info", "nombre": "" });
  info.push({ "Tiempo de Comida": "Identificacion", "nombre": document.getElementById('calc_id') ? document.getElementById('calc_id').value : "" });
  info.push({ "Tiempo de Comida": "Fecha", "nombre": document.getElementById('calc_fecha') ? document.getElementById('calc_fecha').value : "" });
  info.push({ "Tiempo de Comida": "NombrePaciente", "nombre": document.getElementById('calc_nombre') ? document.getElementById('calc_nombre').value : "" });
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
    let nombrePaciente = document.getElementById('calc_nombre') ? document.getElementById('calc_nombre').value.trim() : "";
    let filename = nombrePaciente ? "Dieta_" + nombrePaciente.replace(/\s+/g, '_') + ".xlsx" : "datos_pacientes.xlsx";
    XLSX.writeFile(workbook, filename, { compression: true });
  })();
}

function nuevoOrden() {
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
  alimentoPendiente = alimento;
  document.getElementById('modalAlimentoName').textContent = alimento.nombre;
  $('#mealSelectionModal').modal('show');
}

function seleccionarTiempo(tiempo) {
  if (alimentoPendiente) {
    agregar(baseGramos, alimentoPendiente, tiempo);
    $('#mealSelectionModal').modal('hide');
    alimentoPendiente = null;
  }
}

// agregar un alimento a la tabla de valores nutricionales
function agregar(valorGramos, alimento, tiempo = "Desayuno") {
  let tbody_id = "valores_" + tiempo.replace(" ", "_");
  const valores_tbody = document.getElementById(tbody_id);

  if (!valores_tbody.dataset.sortableInitialized) {
    Sortable.create(valores_tbody, {
      animation: 150,
      dragClass: "drag"
    });
    valores_tbody.dataset.sortableInitialized = "true";
  }

  const encabezado = document.getElementById("encabezado_valores");
  encabezado.classList.add('table-primary');


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

  valores_tbody.appendChild(fila);

  let alimentoCopia = { ...alimento };
  alimentoCopia.tiempo = tiempo;

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
      let el_id = "sub_" + t.replace(" ", "_") + "_" + idx;
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
    
    // Calcular macros estándar sugeridos: 50% Carbs, 20% Proteína, 30% Grasas
    let reqCarb = (promedio * 0.50) / 4; // 4 kcal por gramo
    let reqProt = (promedio * 0.20) / 4; // 4 kcal por gramo
    let reqGrasa = (promedio * 0.30) / 9; // 9 kcal por gramo

    const reqProtInput = document.getElementById('input_proteina_requerimiento');
    const reqGrasaInput = document.getElementById('input_grasa_requerimiento');
    const reqCarbInput = document.getElementById('input_carbohidratos_requerimiento');

    if (reqProtInput) reqProtInput.value = reqProt.toFixed(2);
    if (reqGrasaInput) reqGrasaInput.value = reqGrasa.toFixed(2);
    if (reqCarbInput) reqCarbInput.value = reqCarb.toFixed(2);

    // Disparar las funciones regulares para actualizar el porcentaje de adecuación en la tabla inferior
    calcular();
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
    <div style="padding: 40px; background-color: #ffffff; font-family: Arial, sans-serif; color: #333;">
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
        <div style="margin-bottom: 15px;">
          <h5 style="background-color: #f1f1f1; padding: 5px; margin: 0; color: #333;">${t}</h5>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
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
    filename:     'Reporte_' + nombre.replace(/\s+/g, '_') + '.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(html).save().catch(err => {
    console.error("Error generando PDF", err);
  });
}

// Limpiar el formulario cuando la página se recarga o se abre
document.addEventListener('DOMContentLoaded', function() {
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
  if (fecha) fecha.value = '';
  if (peso) peso.value = '70';
  if (estatura) estatura.value = '170';
  if (edad) edad.value = '30';
  if (genero) genero.value = 'M';
  if (actividad) actividad.value = '1.55';

  // Limpiar requerimientos de la tabla de totales (restablecer a 1 por defecto)
  const reqInputs = document.querySelectorAll('input[id$="_requerimiento"]');
  reqInputs.forEach(input => {
    input.value = '1';
  });
  
  // Ocultar resultados de la calculadora anterior
  const resDiv = document.getElementById('resultados_calc');
  if (resDiv) resDiv.style.display = 'none';
  
  // Recalcular para blanquear porcentajes
  calcular();
});
